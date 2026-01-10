function main() {
  setTimeout(init_scroll_button, 5000);
}

function init_scroll_button() {
  const TAG = "[shorts-autonext]";
  const DEBUG = true;

  function log(...a) {
    if (DEBUG)
      try {
        console.log(TAG, ...a);
      } catch {}
  }
  function warn(...a) {
    try {
      console.warn(TAG, ...a);
    } catch {}
  }

  // Kill any previous run (prevents multiple timers/listeners)
  try {
    window.__shortsAutoNextSafe2?.stop?.();
  } catch {}

  const CFG = {
    nearEndSeconds: 0.25,
    cooldownMs: 1200,
    videoPollMs: 300,
    uiPollMs: 1500,
  };

  const STATE = {
    enabled: true,
    lastAdvanceAt: 0,
    attachedVideo: null,
    attachedSig: "",
    videoPollId: null,
    uiPollId: null,
    inAdvance: false,
    toggleBtn: null,
  };

  function now() {
    return Date.now();
  }

  function get_button_bar() {
    try {
      return document.querySelector("#button-bar");
    } catch {
      return null;
    }
  }

  function style_toggle(btn) {
    try {
      const enabled = STATE.enabled;
      btn.dataset.enabled = enabled ? "1" : "0";
      btn.setAttribute("aria-pressed", enabled ? "true" : "false");
      btn.title = enabled
        ? "Auto-next: ON (click to turn off)"
        : "Auto-next: OFF (click to turn on)";
      btn.textContent = enabled ? "AUTO" : "OFF";

      // lightweight styling (avoid triggering expensive layouts repeatedly)
      btn.style.display = "inline-flex";
      btn.style.alignItems = "center";
      btn.style.justifyContent = "center";
      btn.style.width = "48px";
      btn.style.height = "48px";
      btn.style.borderRadius = "24px";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.marginBottom = "8px";
      btn.style.background = enabled
        ? "rgba(255,255,255,0.18)"
        : "rgba(255,255,255,0.08)";
      btn.style.color = "white";
      btn.style.font =
        "600 12px/1 system-ui, -apple-system, Segoe UI, Roboto, Arial";
    } catch (e) {
      warn("style_toggle failed", e);
    }
  }

  function ensure_toggle_once() {
    try {
      const bar = get_button_bar();
      if (!bar) return false;

      // If it exists but got moved/removed, re-find it in this bar.
      let btn = bar.querySelector("button[data-shorts-auto-next-toggle='1']");

      if (!btn) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.shortsAutoNextToggle = "1";
        btn.setAttribute("aria-label", "Toggle auto-advance Shorts");

        btn.addEventListener("click", (e) => {
          try {
            e.stopPropagation();
          } catch {}
          STATE.enabled = !STATE.enabled;
          style_toggle(btn);
          log("toggle", STATE.enabled ? "ENABLED" : "DISABLED");
        });

        // insert at start
        bar.insertBefore(btn, bar.firstChild);
        log("toggle inserted");
      }

      STATE.toggleBtn = btn;
      style_toggle(btn);
      return true;
    } catch (e) {
      warn("ensure_toggle_once failed", e);
      return false;
    }
  }

  function get_active_video() {
    try {
      const vids = Array.from(document.querySelectorAll("video"));
      if (!vids.length) return null;

      // Prefer the playing one; fallback to ready one.
      return (
        vids.find((v) => v && !v.paused && v.readyState >= 2) ||
        vids.find((v) => v && v.readyState >= 2) ||
        vids[0] ||
        null
      );
    } catch (e) {
      warn("get_active_video failed", e);
      return null;
    }
  }

  function video_sig(v) {
    try {
      return `${v.currentSrc || ""}::${Number(v.duration) || 0}`;
    } catch {
      return "";
    }
  }

  function send_arrow_down() {
    try {
      const ev = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        code: "ArrowDown",
        keyCode: 40,
        which: 40,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(ev);
      return true;
    } catch (e) {
      warn("send_arrow_down failed", e);
      return false;
    }
  }

  function scroll_fallback() {
    try {
      window.scrollBy({ top: innerHeight * 1.1, behavior: "smooth" });
      return true;
    } catch (e) {
      warn("scroll_fallback failed", e);
      return false;
    }
  }

  function can_advance() {
    if (!STATE.enabled) return false;
    if (STATE.inAdvance) return false;
    return now() - STATE.lastAdvanceAt >= CFG.cooldownMs;
  }

  function advance_next(reason) {
    if (!can_advance()) return;

    STATE.inAdvance = true;
    STATE.lastAdvanceAt = now();
    log("advancing…", reason);

    // Best effort: key + scroll fallback
    const ok = send_arrow_down();
    setTimeout(
      () => {
        try {
          if (STATE.enabled) scroll_fallback();
        } finally {
          // release the lock even if something throws
          STATE.inAdvance = false;
        }
      },
      ok ? 150 : 0
    );
  }

  function detach_video_listener() {
    try {
      const v = STATE.attachedVideo;
      if (v && v.__shortsAutoNextHandler) {
        v.removeEventListener("timeupdate", v.__shortsAutoNextHandler);
        delete v.__shortsAutoNextHandler;
      }
    } catch (e) {
      warn("detach_video_listener failed", e);
    } finally {
      STATE.attachedVideo = null;
      STATE.attachedSig = "";
    }
  }

  function attach_video_listener(v) {
    try {
      if (!v) return;
      const sig = video_sig(v);
      if (!sig) return;

      // Already attached to this exact video/source
      if (STATE.attachedVideo === v && STATE.attachedSig === sig) return;

      // Detach old
      detach_video_listener();

      // Attach new
      const handler = () => {
        try {
          if (!STATE.enabled) return;
          const dur = Number(v.duration);
          const t = Number(v.currentTime);
          if (!isFinite(dur) || dur <= 0) return;
          if (!isFinite(t) || t <= 0) return;
          const remaining = dur - t;
          if (remaining <= CFG.nearEndSeconds) {
            advance_next("near-end(timeupdate)");
          }
        } catch (e) {
          warn("timeupdate handler crashed", e);
        }
      };

      // stash handler so we can remove it later
      v.__shortsAutoNextHandler = handler;
      v.addEventListener("timeupdate", handler, { passive: true });

      STATE.attachedVideo = v;
      STATE.attachedSig = sig;

      log("attached to video", sig);
    } catch (e) {
      warn("attach_video_listener failed", e);
    }
  }

  function poll_video() {
    try {
      const v = get_active_video();
      if (!v) return;

      const sig = video_sig(v);
      // If source changes on same element or element changes, attach handles it.
      if (v !== STATE.attachedVideo || sig !== STATE.attachedSig) {
        attach_video_listener(v);
      }
    } catch (e) {
      warn("poll_video crashed", e);
    }
  }

  function poll_ui() {
    // IMPORTANT: no MutationObserver on subtree. This is what often melts Shorts.
    try {
      ensure_toggle_once();
    } catch (e) {
      warn("poll_ui crashed", e);
    }
  }

  function stop_all() {
    try {
      if (STATE.videoPollId) clearInterval(STATE.videoPollId);
    } catch {}
    try {
      if (STATE.uiPollId) clearInterval(STATE.uiPollId);
    } catch {}
    STATE.videoPollId = null;
    STATE.uiPollId = null;

    detach_video_listener();
    log("stopped");
  }

  // Start
  try {
    poll_ui();
    poll_video();

    STATE.uiPollId = setInterval(poll_ui, CFG.uiPollMs);
    STATE.videoPollId = setInterval(poll_video, CFG.videoPollMs);

    log("started uiPoll", CFG.uiPollMs, "ms; videoPoll", CFG.videoPollMs, "ms");
  } catch (e) {
    warn("startup failed", e);
    stop_all();
  }

  window.__shortsAutoNextSafe2 = { stop: stop_all, state: STATE };
  log("running; stop with __shortsAutoNextSafe2.stop()");
}

main();
