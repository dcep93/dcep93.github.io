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

  try {
    window.__shortsAutoNextSafe2?.stop?.();
  } catch {}

  // Fix for speed changes:
  // - don't rely on timeupdate frequency (it can get weird under rate changes / throttling)
  // - instead, poll *video time* at a steady interval and trigger when remaining <= dynamicThreshold
  const CFG = {
    pollMs: 120, // steady poll cadence
    uiPollMs: 1500, // slow UI poll for toggle insertion
    cooldownMs: 1200, // anti double-trigger
    minThresholdSec: 0.15, // absolute floor
    thresholdFrac: 0.02, // 2% of duration (helps for very short clips)
    maxThresholdSec: 0.4, // absolute ceiling
    minProgressFrac: 0.995, // avoid early advances when duration metadata shifts
  };

  const STATE = {
    enabled: true,
    lastAdvanceAt: 0,
    pollId: null,
    uiPollId: null,
    inAdvance: false,
    lastSig: "",
    lastRemaining: null,
    toggleBtn: null,
    lastVideo: null,
  };

  function now() {
    return Date.now();
  }

  function get_button_bar() {
    try {
      const selectors = [
        "#button-bar",
        "ytd-reel-player-overlay-renderer #actions",
        "#actions.ytd-reel-player-overlay-renderer",
        "ytd-reel-player-overlay-renderer #actions #top-level-buttons-computed",
        "#actions",
      ];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el;
      }
      return null;
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

  function on_video_ended() {
    advance_next("ended");
  }

  function ensure_video_listener(v) {
    if (!v || v === STATE.lastVideo) return;
    try {
      if (STATE.lastVideo) {
        STATE.lastVideo.removeEventListener("ended", on_video_ended);
      }
    } catch {}
    try {
      v.addEventListener("ended", on_video_ended);
      STATE.lastVideo = v;
    } catch (e) {
      warn("ensure_video_listener failed", e);
    }
  }

  function dynamic_threshold_sec(duration) {
    // threshold scales a bit with duration so we don't miss short vids,
    // but bounded so we don't trigger too early on long ones.
    const t = Math.max(
      CFG.minThresholdSec,
      Math.min(CFG.maxThresholdSec, duration * CFG.thresholdFrac)
    );
    return t;
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

    const ok = send_arrow_down();
    setTimeout(
      () => {
        try {
          if (STATE.enabled) scroll_fallback();
        } finally {
          STATE.inAdvance = false;
        }
      },
      ok ? 150 : 0
    );
  }

  function poll_tick() {
    try {
      if (!STATE.enabled) return;

      const v = get_active_video();
      if (!v) return;
      ensure_video_listener(v);

      const dur = Number(v.duration);
      const t = Number(v.currentTime);
      if (!isFinite(dur) || dur <= 0) return;
      if (!isFinite(t) || t <= 0) return;

      const sig = video_sig(v);
      if (sig && sig !== STATE.lastSig) {
        STATE.lastSig = sig;
        STATE.lastRemaining = null;
        log("video changed", sig, "playbackRate=", v.playbackRate);
      }

      const remaining = dur - t;
      const threshold = dynamic_threshold_sec(dur);
      const progress = t / dur;

      // Key part for playbackRate changes:
      // Require that remaining is (a) below threshold AND (b) trending downward or stable,
      // so we don't false-trigger on seeks/buffer jumps.
      const prev = STATE.lastRemaining;
      STATE.lastRemaining = remaining;

      const trendingDown = prev == null ? true : remaining <= prev + 0.05;

      if (
        (v.ended || (remaining <= threshold && trendingDown)) &&
        progress >= CFG.minProgressFrac
      ) {
        advance_next(
          `near-end(poll) rem=${remaining.toFixed(3)} thr=${threshold.toFixed(
            3
          )} rate=${v.playbackRate}`
        );
      }
    } catch (e) {
      warn("poll_tick crashed", e);
    }
  }

  function poll_ui() {
    try {
      ensure_toggle_once();
    } catch (e) {
      warn("poll_ui crashed", e);
    }
  }

  function stop_all() {
    try {
      if (STATE.pollId) clearInterval(STATE.pollId);
    } catch {}
    try {
      if (STATE.uiPollId) clearInterval(STATE.uiPollId);
    } catch {}
    STATE.pollId = null;
    STATE.uiPollId = null;
    log("stopped");
  }

  // Start
  try {
    poll_ui();

    STATE.uiPollId = setInterval(poll_ui, CFG.uiPollMs);
    STATE.pollId = setInterval(poll_tick, CFG.pollMs);

    log("started uiPoll", CFG.uiPollMs, "ms; poll", CFG.pollMs, "ms");
  } catch (e) {
    warn("startup failed", e);
    stop_all();
  }

  window.__shortsAutoNextSafe2 = { stop: stop_all, state: STATE };
  log("running; stop with __shortsAutoNextSafe2.stop()");
}

main();
