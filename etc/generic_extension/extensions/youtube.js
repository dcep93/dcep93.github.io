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

function create_shorts_auto_flow({
  now = () => Date.now(),
  advanceAttemptIntervalMs = 500,
  onDiagnostic = null,
} = {}) {
  let mode = "watching";
  let identity = "";
  let lastAdvanceAttemptAt = null;

  function diagnose(event, details = {}) {
    try {
      onDiagnostic?.(event, details);
    } catch {}
  }

  function start_advance(sourceIdentity, reason) {
    if (!sourceIdentity) return false;
    mode = "advancing";
    identity = sourceIdentity;
    lastAdvanceAttemptAt = null;
    diagnose("advance-started", { sourceIdentity, reason });
    return true;
  }

  return {
    start_advance,

    observe(activeIdentity) {
      if (!activeIdentity) return false;

      if (mode === "watching") {
        identity = activeIdentity;
        return false;
      }

      if (mode === "advancing") {
        if (activeIdentity === identity) return false;
        const sourceIdentity = identity;
        mode = "checking";
        identity = activeIdentity;
        lastAdvanceAttemptAt = null;
        diagnose("destination-observed", {
          sourceIdentity,
          destinationIdentity: activeIdentity,
        });
        return true;
      }

      if (mode === "checking" && activeIdentity !== identity) {
        const destinationIdentity = identity;
        mode = "watching";
        identity = activeIdentity;
        diagnose("check-invalidated", {
          destinationIdentity,
          activeIdentity,
        });
      }
      return false;
    },

    should_attempt_advance(activeIdentity) {
      if (mode !== "advancing" || activeIdentity !== identity) return false;
      const currentTime = now();
      if (
        lastAdvanceAttemptAt !== null &&
        currentTime - lastAdvanceAttemptAt < advanceAttemptIntervalMs
      ) {
        return false;
      }
      lastAdvanceAttemptAt = currentTime;
      diagnose("advance-attempt", { sourceIdentity: identity });
      return true;
    },

    complete_check(destinationIdentity, { skip }) {
      if (mode !== "checking" || destinationIdentity !== identity) return false;
      diagnose("check-completed", { destinationIdentity, skip: Boolean(skip) });
      if (skip) return start_advance(destinationIdentity, "low-likes");
      mode = "watching";
      lastAdvanceAttemptAt = null;
      return true;
    },

    cancel(reason) {
      if (mode !== "watching" || identity) {
        diagnose("cancelled", { mode, identity, reason });
      }
      mode = "watching";
      identity = "";
      lastAdvanceAttemptAt = null;
    },

    get_state() {
      return { mode, identity };
    },
  };
}

function short_visibility(element, viewport) {
  if (
    element.checkVisibility?.({
      checkOpacity: true,
      checkVisibilityCSS: true,
    }) === false
  ) {
    return null;
  }
  const { left, top, right, bottom, width, height } =
    element.getBoundingClientRect();
  if (width <= 0 || height <= 0) return null;
  const visibleWidth = Math.max(
    0,
    Math.min(right, viewport.width) - Math.max(left, 0),
  );
  const visibleHeight = Math.max(
    0,
    Math.min(bottom, viewport.height) - Math.max(top, 0),
  );
  const fraction = (visibleWidth * visibleHeight) / (width * height);
  if (fraction <= 0.5) return null;
  return {
    fraction,
    centerDistance: Math.abs(top + height / 2 - viewport.height / 2),
    rect: { left, top, width, height },
  };
}

function select_visible_short(doc, viewport, expectedPath) {
  const renderers = Array.from(
    doc.querySelectorAll("ytd-reel-video-renderer,ytd-reel-item-renderer"),
  );
  const candidates = renderers
    .map((item) => ({ item, visibility: short_visibility(item, viewport) }))
    .filter(({ visibility }) => visibility)
    .sort((a, b) => a.visibility.centerDistance - b.visibility.centerDistance);
  if (!candidates.length) return null;
  // During a split transition, wait instead of choosing arbitrarily.
  if (
    candidates[1] &&
    Math.abs(
      candidates[0].visibility.centerDistance -
        candidates[1].visibility.centerDistance,
    ) < 1
  ) {
    return null;
  }
  const { item } = candidates[0];
  const paths = Array.from(item.querySelectorAll('a[href*="/shorts/"]'))
    .map((link) => {
      try {
        const path = new URL(
          link.getAttribute("href"),
          "https://www.youtube.com",
        ).pathname;
        return /^\/shorts\/[^/]+$/.test(path) ? path : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  if (paths.length && !paths.includes(expectedPath)) return null;
  const videos = Array.from(item.querySelectorAll("video"))
    .map((video) => ({ video, visibility: short_visibility(video, viewport) }))
    .filter(({ visibility }) => visibility)
    .sort((a, b) => a.visibility.centerDistance - b.visibility.centerDistance);
  // Multiple visible players are ambiguous; never fall back to a neighboring Short.
  if (videos.length !== 1 || videos[0].video.readyState < 2) return null;
  return {
    ...videos[0],
    item,
    rendererPath: paths.includes(expectedPath) ? expectedPath : null,
  };
}

function create_short_timing_recorder({
  now = () => Date.now(),
  emit = () => {},
} = {}) {
  const ids = new WeakMap();
  let nextId = 1;
  let previous = null;
  let history = [];
  let lastLogAt = -Infinity;
  return {
    observe(selection, path, threshold) {
      if (!selection) {
        if (previous)
          emit("selection-lost", {
            timestamp: new Date(now()).toISOString(),
            path,
            previous,
          });
        previous = null;
        history = [];
        return null;
      }
      const { video, rendererPath, visibility } = selection;
      if (!ids.has(video)) ids.set(video, nextId++);
      const capturedAt = now();
      const duration = Number.isFinite(video.duration) ? video.duration : null;
      const currentTime = Number.isFinite(video.currentTime)
        ? video.currentTime
        : null;
      const remaining =
        duration !== null && currentTime !== null
          ? duration - currentTime
          : null;
      const sample = {
        timestamp: new Date(capturedAt).toISOString(),
        capturedAt,
        path,
        rendererPath,
        videoId: ids.get(video),
        source: video.currentSrc || video.getAttribute("src") || "",
        currentTime,
        duration,
        remaining,
        threshold,
        progress:
          duration > 0 && currentTime !== null ? currentTime / duration : null,
        playbackRate: video.playbackRate,
        wallRemaining:
          remaining !== null && video.playbackRate > 0
            ? remaining / video.playbackRate
            : null,
        paused: video.paused,
        seeking: video.seeking,
        ended: video.ended,
        loop: video.loop,
        readyState: video.readyState,
        visibility,
      };
      const changed =
        !previous ||
        previous.videoId !== sample.videoId ||
        previous.source !== sample.source ||
        previous.path !== path;
      const previousSample = changed ? null : previous;
      if (changed) history = [];
      const durationChanged =
        previousSample && previousSample.duration !== duration;
      const stateChanged =
        previousSample &&
        ["paused", "seeking", "ended", "readyState", "playbackRate"].some(
          (key) => previousSample[key] !== sample[key],
        );
      const event = changed
        ? "selection-changed"
        : durationChanged
          ? "duration-changed"
          : stateChanged
            ? "state-changed"
            : null;
      if (
        event ||
        capturedAt - (history.at(-1)?.capturedAt ?? -Infinity) >= 1000
      ) {
        history.push(sample);
        history = history.slice(-15);
      }
      if (event || capturedAt - lastLogAt >= 5000) {
        emit(event || "sample", {
          ...sample,
          previous: event ? previous : undefined,
        });
        lastLogAt = capturedAt;
      }
      previous = sample;
      return {
        sample,
        previous: previousSample,
        history: history.slice(),
        changed,
      };
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
  init_scroll_button("startup");
}

function init_scroll_button(reason = "manual") {
  const TAG = "[shorts-autonext]";
  const DEBUG = true;

  function log(...a) {
    if (DEBUG)
      try {
        console.log(
          TAG,
          ...a.map((value) =>
            value && typeof value === "object" ? JSON.stringify(value) : value,
          ),
        );
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
    advanceAttemptIntervalMs: 500,
    minThresholdSec: 0.15, // absolute floor
    thresholdFrac: 0.02, // 2% of duration (helps for very short clips)
    maxThresholdSec: 0.4, // absolute ceiling
    minProgressFrac: 0.995, // avoid early advances when duration metadata shifts
    minLikeCount: 1000,
    lowLikeInitialDelayMs: 700,
    lowLikeRetryMs: 300,
    lowLikeMaxAttempts: 5,
  };

  const STATE = {
    enabled: true,
    pollId: null,
    uiPollId: null,
    lastSig: "",
    lastRemaining: null,
    toggleBtn: null,
    likeCheckInFlightSig: "",
    stopped: false,
    timing: null,
  };

  const timingRecorder = create_short_timing_recorder({
    emit: (event, details) => log("timing", event, details),
  });

  function now() {
    return Date.now();
  }

  const flow = create_shorts_auto_flow({
    now,
    advanceAttemptIntervalMs: CFG.advanceAttemptIntervalMs,
    onDiagnostic(event, details) {
      if (event === "advance-started") STATE.advanceReason = details.reason;
      log("flow", event, details);
    },
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
        document.querySelectorAll("button[data-shorts-auto-next-toggle='1']"),
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
          if (!STATE.enabled) flow.cancel("disabled");
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
      return get_visible_selection()?.video || null;
    } catch (e) {
      warn("get_active_video failed", e);
      return null;
    }
  }

  function get_visible_selection() {
    return select_visible_short(
      document,
      { width: innerWidth, height: innerHeight },
      short_identity(),
    );
  }

  function short_identity() {
    try {
      if (!is_shorts_url()) return "";
      return window.location.pathname;
    } catch {
      return "";
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
      const roots = shortItem ? [shortItem] : [];
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
          if (viewport_center_distance(button) === Infinity) {
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
      const sig = short_identity();
      const flowState = flow.get_state();
      if (
        STATE.stopped ||
        !STATE.enabled ||
        !is_shorts_url() ||
        !v ||
        !sig ||
        flowState.mode !== "checking" ||
        flowState.identity !== sig ||
        sig === STATE.likeCheckInFlightSig
      ) {
        return;
      }
      STATE.likeCheckInFlightSig = sig;
      log_like_check("scheduled", {
        sig,
        delayMs: CFG.lowLikeInitialDelayMs,
      });

      const check = (attempt = 0) => {
        try {
          const activeVideo = get_active_video();
          const cancellationReason = like_check_cancellation_reason(sig);
          if (cancellationReason) {
            log_like_check("cancelled", {
              sig,
              attempt,
              reason: cancellationReason,
            });
            if (STATE.likeCheckInFlightSig === sig) {
              STATE.likeCheckInFlightSig = "";
            }
            return;
          }

          const likes = get_like_count(get_active_short_item(activeVideo));
          log_like_check("attempt", { sig, attempt, likes });
          if (likes === null) {
            if (attempt < CFG.lowLikeMaxAttempts) {
              setTimeout(() => check(attempt + 1), CFG.lowLikeRetryMs);
            } else if (STATE.likeCheckInFlightSig === sig) {
              log_like_check("retry-exhausted", {
                sig,
                attempts: attempt + 1,
              });
              STATE.likeCheckInFlightSig = "";
              flow.complete_check(sig, { skip: false });
            }
            return;
          }

          log_like_check("decision", {
            sig,
            likes,
            threshold: CFG.minLikeCount,
            action: likes < CFG.minLikeCount ? "skip" : "keep",
          });
          STATE.likeCheckInFlightSig = "";
          const skip = likes < CFG.minLikeCount;
          flow.complete_check(sig, { skip });
          if (!skip) return;

          log("skip low-like short", likes, sig);
        } catch (e) {
          warn("maybe_skip_low_like_video delayed check failed", e);
        }
      };

      setTimeout(check, CFG.lowLikeInitialDelayMs);
    } catch (e) {
      warn("maybe_skip_low_like_video failed", e);
    }
  }

  function log_like_check(event, details) {
    log("like-check", event, details);
  }

  function like_check_cancellation_reason(sig) {
    if (STATE.stopped) return "stopped";
    if (!STATE.enabled) return "disabled";
    if (!is_shorts_url()) return "not-shorts-url";
    if (short_identity() !== sig) return "active-video-changed";
    const flowState = flow.get_state();
    if (flowState.mode !== "checking" || flowState.identity !== sig) {
      return "eligibility-lost";
    }
    return "";
  }

  function click_next_button() {
    try {
      const button = Array.from(
        document.querySelectorAll('button[aria-label="Next video" i]'),
      )
        .filter(
          (candidate) =>
            !candidate.disabled &&
            viewport_center_distance(candidate) !== Infinity,
        )
        .sort(
          (first, second) =>
            viewport_center_distance(first) - viewport_center_distance(second),
        )[0];
      if (!button) return false;
      button.click();
      return true;
    } catch (e) {
      warn("click_next_button failed", e);
      return false;
    }
  }

  function attempt_advance(sig) {
    if (!flow.should_attempt_advance(sig)) return;
    log("advance-timing", { reason: STATE.advanceReason, ...STATE.timing });
    const clicked = click_next_button();
    log("advance-attempt", { sig, clicked });
  }

  function is_shorts_url() {
    try {
      return window.location.pathname.startsWith("/shorts/");
    } catch {
      return false;
    }
  }

  function poll_tick() {
    try {
      if (STATE.stopped) return;
      if (!STATE.enabled) {
        flow.cancel("disabled");
        return;
      }
      if (!is_shorts_url()) {
        flow.cancel("left-shorts");
        STATE.lastSig = "";
        STATE.lastRemaining = null;
        return;
      }

      const sig = short_identity();
      if (!sig) return;
      const selection = get_visible_selection();
      const v = selection?.video;
      const threshold =
        v && Number.isFinite(v.duration)
          ? dynamic_threshold_sec(v.duration)
          : null;
      STATE.timing = timingRecorder.observe(selection, sig, threshold);
      if (!STATE.timing || STATE.timing.changed) STATE.lastRemaining = null;

      if (flow.observe(sig)) {
        STATE.lastSig = sig;
        STATE.lastRemaining = null;
        log("auto-advanced destination", sig);
      }

      const flowState = flow.get_state();
      if (!v) return;
      if (flowState.mode === "advancing") {
        if (STATE.timing.changed) {
          flow.cancel("visible-player-changed");
          return;
        }
        attempt_advance(sig);
        return;
      }
      if (flowState.mode === "checking") {
        maybe_skip_low_like_video(v);
        return;
      }

      if (sig !== STATE.lastSig) {
        STATE.lastSig = sig;
        STATE.lastRemaining = null;
        log("video changed", sig, "playbackRate=", v?.playbackRate);
      }

      if (v.paused || v.seeking) {
        STATE.lastRemaining = null;
        return;
      }

      const dur = Number(v.duration);
      const t = Number(v.currentTime);
      if (!isFinite(dur) || dur <= 0) return;
      if (!isFinite(t) || t <= 0) return;

      const remaining = dur - t;
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
        const reason = `near-end(poll) rem=${remaining.toFixed(
          3,
        )} thr=${threshold.toFixed(3)} rate=${v.playbackRate}`;
        if (flow.start_advance(sig, reason)) {
          log("advancing...", reason);
          attempt_advance(sig);
        }
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
    STATE.stopped = true;
    flow.cancel("stopped");
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

  window.__shortsAutoNextSafe2 = { stop: stop_all, state: STATE, flow };
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
    create_shorts_auto_flow,
    parse_compact_count,
    get_like_count_from_button,
    select_visible_short,
    create_short_timing_recorder,
  };
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  main();
}
