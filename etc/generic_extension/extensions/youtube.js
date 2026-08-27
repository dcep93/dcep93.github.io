function parse_compact_count(text) {
  try {
    const normalized = String(text || "")
      .toLowerCase()
      .replace(/,/g, "")
      .trim();
    const match = normalized.match(
      /(\d+(?:\.\d+)?)\s*(k|m|b|thousand|million|billion)?\b/,
    );
    if (!match) return null;

    const value = Number.parseFloat(match[1]);
    if (!Number.isFinite(value)) return null;

    const suffix = match[2] || "";
    const multiplier =
      suffix === "k" || suffix === "thousand"
        ? 1000
        : suffix === "m" || suffix === "million"
          ? 1000000
          : suffix === "b" || suffix === "billion"
            ? 1000000000
            : 1;

    return Math.round(value * multiplier);
  } catch {
    return null;
  }
}

function get_like_count_from_button(button) {
  try {
    if (!button) return null;

    const root =
      button.closest?.("button-view-model") ||
      button.closest?.("ytd-toggle-button-renderer") ||
      button.closest?.("label") ||
      button;
    const candidates = [
      button.getAttribute?.("aria-label"),
      button.getAttribute?.("title"),
      root.querySelector?.(".ytSpecButtonShapeWithLabelLabel")?.textContent,
      root.querySelector?.("#text")?.textContent,
      root.textContent,
    ].filter(Boolean);

    for (const text of candidates) {
      const count = parse_compact_count(text);
      if (count !== null) return count;
    }
    return null;
  } catch {
    return null;
  }
}

function create_auto_advance_like_gate({
  now = () => Date.now(),
  transitionTtlMs = 1500,
} = {}) {
  let pendingTransition = null;
  let eligibleDestinationSig = "";

  function clear_expired_transition() {
    if (pendingTransition && now() > pendingTransition.expiresAt) {
      pendingTransition = null;
    }
  }

  return {
    mark_advance(sourceSig) {
      eligibleDestinationSig = "";
      pendingTransition = sourceSig
        ? {
            sourceSig,
            expiresAt: now() + transitionTtlMs,
          }
        : null;
    },

    observe(activeSig) {
      if (!activeSig) return false;
      clear_expired_transition();

      if (pendingTransition) {
        if (activeSig === pendingTransition.sourceSig) return false;

        pendingTransition = null;
        eligibleDestinationSig = activeSig;
        return true;
      }

      if (eligibleDestinationSig && activeSig !== eligibleDestinationSig) {
        eligibleDestinationSig = "";
      }
      return activeSig === eligibleDestinationSig;
    },

    is_eligible(activeSig) {
      return Boolean(activeSig && activeSig === eligibleDestinationSig);
    },

    consume(activeSig) {
      if (!activeSig || activeSig !== eligibleDestinationSig) return false;
      eligibleDestinationSig = "";
      return true;
    },

    clear() {
      pendingTransition = null;
      eligibleDestinationSig = "";
    },
  };
}

function main() {
  installShortsAutoNextBootstrap();
  enableShortsBulkOpen();
}

function installShortsAutoNextBootstrap() {
  if (window.__shortsAutoNextBootstrapInstalled) return;
  window.__shortsAutoNextBootstrapInstalled = true;

  let initTimer = null;
  let settledTimer = null;

  function queueInit(reason, delay = 0) {
    try {
      if (initTimer) clearTimeout(initTimer);
    } catch {}

    initTimer = setTimeout(() => {
      initTimer = null;
      init_scroll_button(reason);
    }, delay);
  }

  function scheduleNavigationRefresh(reason) {
    queueInit(`${reason}:soon`, 200);
    try {
      if (settledTimer) clearTimeout(settledTimer);
    } catch {}
    settledTimer = setTimeout(() => {
      settledTimer = null;
      init_scroll_button(`${reason}:settled`);
    }, 1200);
  }

  queueInit("startup", 0);
  setTimeout(() => {
    init_scroll_button("startup:settled");
  }, 5000);

  document.addEventListener(
    "yt-navigate-finish",
    () => scheduleNavigationRefresh("yt-navigate-finish"),
    true,
  );
  document.addEventListener(
    "yt-page-data-updated",
    () => scheduleNavigationRefresh("yt-page-data-updated"),
    true,
  );
  window.addEventListener("pageshow", () => scheduleNavigationRefresh("pageshow"));
  window.addEventListener("popstate", () => scheduleNavigationRefresh("popstate"));
}

function init_scroll_button(reason = "manual") {
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
    minLikeCount: 1000,
    lowLikeInitialDelayMs: 700,
    lowLikeRetryMs: 300,
    lowLikeMaxAttempts: 5,
    autoAdvanceTransitionTtlMs: 1500,
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
    likeCheckInFlightSig: "",
    stopped: false,
  };

  function now() {
    return Date.now();
  }

  const autoAdvanceLikeGate = create_auto_advance_like_gate({
    now,
    transitionTtlMs: CFG.autoAdvanceTransitionTtlMs,
  });

  function get_button_bar() {
    try {
      if (!is_shorts_url()) return null;

      const shortItem = get_active_short_item();
      const bar = shortItem?.querySelector("reel-action-bar-view-model");
      return bar && viewport_center_distance(bar) !== Infinity ? bar : null;
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
      const buttons = Array.from(
        document.querySelectorAll(
          "button[data-shorts-auto-next-toggle='1']",
        ),
      );

      if (!bar) {
        buttons.forEach((button) => button.remove());
        STATE.toggleBtn = null;
        return false;
      }

      buttons.forEach((button) => {
        if (!bar.contains(button)) button.remove();
      });

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
      Math.min(CFG.maxThresholdSec, duration * CFG.thresholdFrac),
    );
    return t;
  }

  function send_arrow_down() {
    try {
      const keyboardEventInit = {
        key: "ArrowDown",
        code: "ArrowDown",
        keyCode: 40,
        which: 40,
        bubbles: true,
        cancelable: true,
      };
      const targets = [
        document.activeElement,
        document.querySelector("ytd-reel-video-renderer[is-active]"),
        document.body,
        document.documentElement,
        document,
      ].filter(Boolean);

      targets.forEach((target) => {
        target.dispatchEvent(new KeyboardEvent("keydown", keyboardEventInit));
        target.dispatchEvent(new KeyboardEvent("keyup", keyboardEventInit));
      });
      return true;
    } catch (e) {
      warn("send_arrow_down failed", e);
      return false;
    }
  }

  function get_scroll_parent(node) {
    try {
      for (let el = node?.parentElement; el; el = el.parentElement) {
        const style = window.getComputedStyle(el);
        const canScroll =
          /(auto|scroll|overlay)/.test(style.overflowY) &&
          el.scrollHeight > el.clientHeight + 16;
        if (canScroll) return el;
      }
      return null;
    } catch {
      return null;
    }
  }

  function get_active_short_item(v = get_active_video()) {
    try {
      if (!v) return null;

      return (
        v.closest(
          [
            "ytd-reel-video-renderer[is-active]",
            "ytd-reel-video-renderer",
            "ytd-reel-item-renderer[is-active]",
            "ytd-reel-item-renderer",
          ].join(","),
        ) || null
      );
    } catch {
      return null;
    }
  }

  function viewport_center_distance(el) {
    try {
      const rect = el.getBoundingClientRect();
      if (
        rect.width <= 0 ||
        rect.height <= 0 ||
        rect.bottom < 0 ||
        rect.top > innerHeight
      ) {
        return Infinity;
      }

      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      return Math.abs(y - innerHeight / 2) + Math.abs(x - innerWidth / 2) * 0.1;
    } catch {
      return Infinity;
    }
  }

  function find_like_button(shortItem) {
    try {
      const roots = shortItem ? [shortItem, document] : [document];
      for (const root of roots) {
        const buttons = Array.from(
          root.querySelectorAll(
            [
              'button[aria-label*="like this video" i]',
              'button[title*="like this video" i]',
              'button-view-model[aria-label*="like this video" i]',
              'ytd-toggle-button-renderer[aria-label*="like this video" i]',
            ].join(","),
          ),
        ).sort(
          (first, second) =>
            viewport_center_distance(first) - viewport_center_distance(second),
        );

        for (const candidate of buttons) {
          const button =
            candidate.matches?.("button") === true
              ? candidate
              : candidate.querySelector?.("button");
          if (!button) continue;
          if (
            root === document &&
            viewport_center_distance(button) === Infinity
          ) {
            continue;
          }
          const label = [
            button.getAttribute("aria-label"),
            button.getAttribute("title"),
            button.textContent,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!label.includes("like this video") || label.includes("dislike")) {
            continue;
          }
          return button;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  function get_like_count(shortItem = get_active_short_item()) {
    try {
      return get_like_count_from_button(find_like_button(shortItem));
    } catch (e) {
      warn("get_like_count failed", e);
      return null;
    }
  }

  function maybe_skip_low_like_video(v = get_active_video()) {
    try {
      const sig = video_sig(v);
      if (
        STATE.stopped ||
        !STATE.enabled ||
        !is_shorts_url() ||
        !v ||
        !sig ||
        !autoAdvanceLikeGate.is_eligible(sig) ||
        sig === STATE.likeCheckInFlightSig
      ) {
        return;
      }
      STATE.likeCheckInFlightSig = sig;

      const check = (attempt = 0) => {
        try {
          const activeVideo = get_active_video();
          if (
            STATE.stopped ||
            !STATE.enabled ||
            !is_shorts_url() ||
            video_sig(activeVideo) !== sig ||
            !autoAdvanceLikeGate.is_eligible(sig)
          ) {
            if (STATE.likeCheckInFlightSig === sig) {
              STATE.likeCheckInFlightSig = "";
            }
            return;
          }

          const likes = get_like_count(get_active_short_item(activeVideo));
          if (likes === null) {
            if (attempt < CFG.lowLikeMaxAttempts) {
              setTimeout(() => check(attempt + 1), CFG.lowLikeRetryMs);
            } else if (STATE.likeCheckInFlightSig === sig) {
              STATE.likeCheckInFlightSig = "";
            }
            return;
          }

          autoAdvanceLikeGate.consume(sig);
          STATE.likeCheckInFlightSig = "";
          if (likes >= CFG.minLikeCount) return;

          log("skip low-like short", likes, sig);
          advance_next(`low-likes(${likes})`, { force: true });
        } catch (e) {
          warn("maybe_skip_low_like_video delayed check failed", e);
        }
      };

      setTimeout(check, CFG.lowLikeInitialDelayMs);
    } catch (e) {
      warn("maybe_skip_low_like_video failed", e);
    }
  }

  function click_next_button() {
    try {
      const selectors = [
        "ytd-reel-player-overlay-renderer #navigation-button-down button",
        "ytd-reel-player-overlay-renderer #navigation-button-down",
        'button[aria-label*="Next"]',
        'button[title*="Next"]',
      ];
      for (const selector of selectors) {
        const btn = document.querySelector(selector);
        if (!btn) continue;
        btn.click();
        return true;
      }
      return false;
    } catch (e) {
      warn("click_next_button failed", e);
      return false;
    }
  }

  function scroll_fallback() {
    try {
      const activeItem = get_active_short_item();
      const items = Array.from(
        document.querySelectorAll("ytd-reel-video-renderer, ytd-reel-item-renderer"),
      );
      const currentIndex = activeItem ? items.indexOf(activeItem) : -1;
      const nextItem =
        currentIndex >= 0 && currentIndex + 1 < items.length
          ? items[currentIndex + 1]
          : null;

      if (nextItem?.scrollIntoView) {
        nextItem.scrollIntoView({ block: "start", behavior: "smooth" });
        return true;
      }

      const scrollParent = get_scroll_parent(activeItem);
      if (scrollParent?.scrollBy) {
        scrollParent.scrollBy({ top: innerHeight * 1.1, behavior: "smooth" });
        return true;
      }

      window.scrollBy({ top: innerHeight * 1.1, behavior: "smooth" });
      return true;
    } catch (e) {
      warn("scroll_fallback failed", e);
      return false;
    }
  }

  function can_advance({ force = false } = {}) {
    if (STATE.stopped) return false;
    if (!STATE.enabled) return false;
    if (STATE.inAdvance) return false;
    if (force) return true;
    return now() - STATE.lastAdvanceAt >= CFG.cooldownMs;
  }

  function is_shorts_url() {
    try {
      return window.location.pathname.startsWith("/shorts/");
    } catch {
      return false;
    }
  }

  function did_advance(startPath, startSig) {
    try {
      if (window.location.pathname !== startPath) return true;

      const currentSig = video_sig(get_active_video());
      return Boolean(startSig && currentSig && currentSig !== startSig);
    } catch {
      return false;
    }
  }

  function advance_next(reason, options = {}) {
    if (!can_advance(options)) return;
    if (!is_shorts_url()) {
      log("skip advance; not on shorts url");
      return;
    }

    STATE.inAdvance = true;
    STATE.lastAdvanceAt = now();
    log("advancing...", reason);

    const startPath = window.location.pathname;
    const startSig = video_sig(get_active_video());
    autoAdvanceLikeGate.mark_advance(startSig);
    const ok = send_arrow_down();

    setTimeout(() => {
      if (!STATE.enabled || did_advance(startPath, startSig)) return;
      click_next_button();
    }, ok ? 180 : 0);

    setTimeout(
      () => {
        try {
          if (!STATE.enabled || did_advance(startPath, startSig)) return;
          scroll_fallback();
        } finally {
          STATE.inAdvance = false;
        }
      },
      ok ? 520 : 220,
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
        if (autoAdvanceLikeGate.observe(sig)) {
          maybe_skip_low_like_video(v);
        }
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
            3,
          )} rate=${v.playbackRate}`,
        );
      }
    } catch (e) {
      warn("poll_tick crashed", e);
    }
  }

  function poll_ui() {
    try {
      ensure_toggle_once();
      maybe_skip_low_like_video();
    } catch (e) {
      warn("poll_ui crashed", e);
    }
  }

  function stop_all() {
    STATE.stopped = true;
    autoAdvanceLikeGate.clear();
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

    log(
      "started uiPoll",
      CFG.uiPollMs,
      "ms; poll",
      CFG.pollMs,
      "ms; reason=",
      reason,
    );
  } catch (e) {
    warn("startup failed", e);
    stop_all();
  }

  window.__shortsAutoNextSafe2 = { stop: stop_all, state: STATE };
  log("running; stop with __shortsAutoNextSafe2.stop()");
}

function enableShortsBulkOpen() {
  document.addEventListener("click", (e) => {
    const el = e.target.closest("span");
    if (!el) return;

    if (el.textContent.trim() !== "Shorts") return;

    e.preventDefault();
    e.stopPropagation();

    const seen = new Set();

    document.querySelectorAll('a[href^="/shorts/"]').forEach((a) => {
      const rect = a.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return; // only visible

      const url = new URL(a.getAttribute("href"), location.origin).href;
      if (seen.has(url)) return;
      seen.add(url);

      window.open(url, "_blank");
    });
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    create_auto_advance_like_gate,
    parse_compact_count,
    get_like_count_from_button,
  };
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  main();
}
