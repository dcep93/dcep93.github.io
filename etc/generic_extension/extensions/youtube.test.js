const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const {
  create_shorts_auto_flow,
  parse_compact_count,
  get_like_count_from_button,
  select_visible_short,
  create_short_timing_recorder,
} = require("./youtube.js");

const viewport = { width: 1000, height: 800 };
const shortPath = "/shorts/current";

function makeElement({
  top = 100,
  left = 300,
  width = 400,
  height = 600,
  hidden = false,
} = {}) {
  return {
    checkVisibility: () => !hidden,
    getBoundingClientRect: () => ({
      top,
      left,
      width,
      height,
      right: left + width,
      bottom: top + height,
    }),
  };
}

function makeShort({
  path = shortPath,
  layout = {},
  videoLayout = layout,
  videoProps = {},
} = {}) {
  const video = {
    ...makeElement(videoLayout),
    currentTime: 48,
    duration: 58,
    paused: false,
    seeking: false,
    ended: false,
    loop: true,
    playbackRate: 1,
    readyState: 4,
    currentSrc: "blob:visible",
    getAttribute: () => null,
    ...videoProps,
  };
  const item = {
    ...makeElement(layout),
    querySelectorAll(selector) {
      if (selector === "video") return [video];
      if (selector === 'a[href*="/shorts/"]')
        return path ? [{ getAttribute: () => path }] : [];
      return [];
    },
    querySelector: () => null,
  };
  video.closest = () => item;
  return { item, video };
}

function makeDocument(shorts, extraVideos = []) {
  return {
    querySelectorAll(selector) {
      if (selector === "ytd-reel-video-renderer,ytd-reel-item-renderer")
        return shorts.map((s) => s.item);
      if (selector === "video")
        return [...extraVideos, ...shorts.map((s) => s.video)];
      return [];
    },
    addEventListener() {},
  };
}

test("selects the visible Short even when offscreen and unrelated videos are playing first", () => {
  const offscreen = makeShort({
    layout: { top: -700 },
    videoProps: { currentTime: 57.9 },
  });
  const visible = makeShort();
  const unrelated = makeShort({ videoProps: { currentTime: 57.9 } });
  const result = select_visible_short(
    makeDocument([offscreen, visible], [unrelated.video]),
    viewport,
    shortPath,
  );
  assert.equal(result.video, visible.video);
});

test("does not fall back when the visible Short is unready or its video is hidden", () => {
  const neighbor = makeShort({ layout: { top: 700 } });
  for (const options of [
    { videoProps: { readyState: 0 } },
    { videoLayout: { hidden: true } },
  ]) {
    assert.equal(
      select_visible_short(
        makeDocument([neighbor, makeShort(options)]),
        viewport,
        shortPath,
      ),
      null,
    );
  }
});

test("rejects hidden, horizontally offscreen, and half-visible renderers", () => {
  for (const layout of [{ hidden: true }, { left: 1100 }, { top: -300 }]) {
    assert.equal(
      select_visible_short(
        makeDocument([makeShort({ layout })]),
        viewport,
        shortPath,
      ),
      null,
    );
  }
});

test("rejects a stale renderer identity and accepts the live markup without is-active", () => {
  assert.equal(
    select_visible_short(
      makeDocument([makeShort({ path: "/shorts/old" })]),
      viewport,
      shortPath,
    ),
    null,
  );
  const visible = makeShort();
  assert.equal(
    select_visible_short(makeDocument([visible]), viewport, shortPath).video,
    visible.video,
  );
});

test("waits on equally centered renderers and multiple visible videos", () => {
  assert.equal(
    select_visible_short(
      makeDocument([makeShort(), makeShort()]),
      viewport,
      shortPath,
    ),
    null,
  );
  const short = makeShort();
  const originalQuery = short.item.querySelectorAll;
  short.item.querySelectorAll = (selector) =>
    selector === "video"
      ? [short.video, makeShort().video]
      : originalQuery(selector);
  assert.equal(
    select_visible_short(makeDocument([short]), viewport, shortPath),
    null,
  );
});

test("timing recorder retains bounded history and records duration and source changes", () => {
  let clock = 1000;
  const events = [];
  const recorder = create_short_timing_recorder({
    now: () => clock,
    emit: (event, data) => events.push({ event, data }),
  });
  const short = makeShort();
  const selection = select_visible_short(
    makeDocument([short]),
    viewport,
    shortPath,
  );
  let result;
  for (let i = 0; i < 20; i++) {
    result = recorder.observe(selection, shortPath, 0.4);
    clock += 1000;
  }
  assert.equal(result.history.length, 15);
  short.video.duration = 70;
  result = recorder.observe(selection, shortPath, 0.4);
  assert.equal(events.at(-1).event, "duration-changed");
  assert.equal(events.at(-1).data.previous.duration, 58);
  assert.equal(result.sample.remaining, 22);
  short.video.currentSrc = "blob:replacement";
  result = recorder.observe(selection, shortPath, 0.4);
  assert.equal(result.changed, true);
  assert.equal(result.previous, null);
  assert.equal(result.history.length, 1);
  assert.equal(recorder.observe(null, shortPath, null), null);
  assert.equal(events.at(-1).event, "selection-lost");
  assert.equal(recorder.observe(selection, shortPath, 0.4).previous, null);
});

function makePollingHarness(shorts, extraVideos = []) {
  const doc = makeDocument(shorts, extraVideos);
  const originalQuery = doc.querySelectorAll;
  let clicks = 0;
  const logs = [];
  const timers = new Map();
  let clock = 1000;
  const button = {
    ...makeElement({ width: 50, height: 50 }),
    disabled: false,
    closest: (selector) => (selector === "#navigation-button-down" ? {} : null),
    click() {
      clicks++;
    },
  };
  const controls = [button];
  const unrelatedControls = [];
  const shortsRoot = { querySelectorAll: () => controls };
  for (const short of shorts) {
    short.video.closest = (selector) =>
      selector === "ytd-shorts" ? shortsRoot : short.item;
  }
  doc.querySelectorAll = (selector) =>
    selector === 'button[aria-label="Next video" i]'
      ? [...unrelatedControls, ...controls]
      : originalQuery(selector);
  const window = { location: { pathname: shortPath } };
  vm.runInNewContext(fs.readFileSync(require.resolve("./youtube.js"), "utf8"), {
    document: doc,
    window,
    innerWidth: viewport.width,
    innerHeight: viewport.height,
    URL,
    Date: class extends Date {
      static now() {
        return clock;
      }
    },
    console: {
      log: (...args) => logs.push(args),
      warn: (...args) => logs.push(args),
    },
    setInterval: (fn, ms) => {
      timers.set(ms, fn);
      return ms;
    },
    clearInterval: (ms) => timers.delete(ms),
    setTimeout: () => {},
  });
  return {
    tick: (ms = 120) => {
      clock += ms;
      timers.get(120)();
    },
    logs,
    clicks: () => clicks,
    window,
    button,
    controls,
    unrelatedControls,
  };
}

test("advances using the active Shorts navigation control hidden by responsive layout", () => {
  const harness = makePollingHarness([
    makeShort({ videoProps: { currentTime: 57.9 } }),
  ]);
  Object.assign(harness.button, makeElement({ width: 0, height: 0 }));
  harness.tick();
  assert.equal(harness.clicks(), 1);
});

test("does not click disabled, ambiguous, or unrelated hidden navigation controls", () => {
  for (const variant of ["disabled", "ambiguous", "unrelated"]) {
    const harness = makePollingHarness([
      makeShort({ videoProps: { currentTime: 57.9 } }),
    ]);
    Object.assign(harness.button, makeElement({ width: 0, height: 0 }));
    if (variant === "disabled") harness.button.disabled = true;
    if (variant === "ambiguous") harness.controls.push({ ...harness.button });
    if (variant === "unrelated") harness.button.closest = () => null;
    harness.tick();
    assert.equal(harness.clicks(), 0, variant);
  }
});

test("ignores Next buttons outside the active Shorts root and retries when its control returns", () => {
  const harness = makePollingHarness([
    makeShort({ videoProps: { currentTime: 57.9 } }),
  ]);
  harness.unrelatedControls.push({ ...harness.button });
  harness.controls.length = 0;
  harness.tick();
  assert.equal(harness.clicks(), 0);
  assert.equal(
    harness.window.__shortsAutoNextSafe2.flow.get_state().mode,
    "advancing",
  );
  Object.assign(harness.button, makeElement({ width: 0, height: 0 }));
  harness.controls.push(harness.button);
  harness.tick(500);
  assert.equal(harness.clicks(), 1);
});

test("advances after a looping Short skips the final polling window", () => {
  for (const rate of [1, 2, 4]) {
    const short = makeShort({
      videoProps: { duration: 10, currentTime: 9.9, playbackRate: rate },
    });
    const harness = makePollingHarness([short]);
    harness.tick();
    assert.equal(harness.clicks(), 0);
    short.video.currentTime = 9.9 + 0.12 * rate - 10;
    harness.tick();
    assert.equal(harness.clicks(), 1, `playback rate ${rate}`);
  }
});

test("does not mistake rewinds, metadata changes, or interrupted observations for completed loops", () => {
  for (const variant of [
    "rewind", "duration", "source", "paused", "seeking", "stale", "disabled",
  ]) {
    const short = makeShort({
      videoProps: { duration: 10, currentTime: variant === "rewind" ? 8 : 9.9 },
    });
    const harness = makePollingHarness([short]);
    harness.tick();
    short.video.currentTime = 0.02;
    if (variant === "duration") short.video.duration = 12;
    if (variant === "source") short.video.currentSrc = "blob:new";
    if (variant === "paused") short.video.paused = true;
    if (variant === "seeking") short.video.seeking = true;
    if (variant === "disabled") {
      harness.window.__shortsAutoNextSafe2.state.enabled = false;
    }
    harness.tick(variant === "stale" ? 10000 : 120);
    assert.equal(harness.clicks(), 0, variant);
  }
});

test("advances when a non-looping video ends and the browser marks it paused", () => {
  const harness = makePollingHarness([
    makeShort({
      videoProps: {
        duration: 10, currentTime: 10, loop: false, ended: true, paused: true,
      },
    }),
  ]);
  harness.tick();
  assert.equal(harness.clicks(), 1);
});

test("polling ignores a hidden player's ending while the visible Short has ten seconds left", () => {
  const hidden = makeShort({
    layout: { top: -700 },
    videoProps: { currentTime: 57.827 },
  });
  const visible = makeShort();
  const harness = makePollingHarness([hidden, visible]);
  harness.tick();
  assert.equal(harness.clicks(), 0);
  visible.video.currentTime = 57.827;
  harness.tick();
  assert.equal(harness.clicks(), 1);
  const log = harness.logs.find((args) => args[1] === "advance-timing");
  assert.equal(typeof log[2], "string");
  const details = JSON.parse(log[2]);
  assert.equal(details.sample.currentTime, 57.827);
  assert.equal(details.sample.duration, 58);
  assert.equal(details.sample.rendererPath, shortPath);
  assert.equal(details.sample.videoId, 1);
  assert.equal(details.history[0].currentTime, 48);
  assert.equal(details.sample.threshold, 0.4);
  assert.equal(details.sample.paused, false);
  assert.ok(details.sample.timestamp);
  assert.match(details.reason, /near-end/);
});

test("paused and seeking visible players never start a completion advance", () => {
  for (const state of [{ paused: true }, { seeking: true }]) {
    const harness = makePollingHarness([
      makeShort({ videoProps: { currentTime: 57.9, ...state } }),
    ]);
    harness.tick();
    assert.equal(harness.clicks(), 0);
  }
});

test("replacing the visible player cancels a pending navigation retry", () => {
  const first = makeShort({ videoProps: { currentTime: 57.9 } });
  const shorts = [first];
  const harness = makePollingHarness(shorts);
  harness.tick();
  assert.equal(harness.clicks(), 1);
  shorts[0] = makeShort();
  harness.tick();
  assert.equal(
    harness.window.__shortsAutoNextSafe2.flow.get_state().mode,
    "watching",
  );
  assert.equal(harness.clicks(), 1);
});

function makeLikeButton({ ariaLabel, visibleLabel = "" }) {
  const root = {
    querySelector(selector) {
      if (selector === ".ytSpecButtonShapeWithLabelLabel") {
        return { textContent: visibleLabel };
      }
      return null;
    },
    textContent: visibleLabel,
  };

  return {
    getAttribute(name) {
      return name === "aria-label" ? ariaLabel : null;
    },
    closest(selector) {
      return selector === "button-view-model" ? root : null;
    },
  };
}

test("parses plain and compact counts", () => {
  assert.equal(parse_compact_count("36"), 36);
  assert.equal(parse_compact_count("1.2K"), 1200);
  assert.equal(parse_compact_count("2.3 million"), 2300000);
});

test("reads the count from the new visible Like button label", () => {
  const button = makeLikeButton({
    ariaLabel: "like this video along with 36 other people",
    visibleLabel: "36",
  });

  assert.equal(get_like_count_from_button(button), 36);
});

test("targets the active Shorts action bar", () => {
  const source = fs.readFileSync(require.resolve("./youtube.js"), "utf8");

  assert.match(
    source,
    /shortItem\?\.querySelector\("reel-action-bar-view-model"\)/,
  );
  assert.doesNotMatch(source, /\n\s*"#actions",/);
});

test("uses one persistent verified navigation loop", () => {
  const source = fs.readFileSync(require.resolve("./youtube.js"), "utf8");

  assert.match(source, /init_scroll_button\("startup"\)/);
  assert.match(source, /button\[aria-label="Next video" i\]/);
  assert.match(source, /flow\.should_attempt_advance\(sig\)/);
  assert.match(source, /return window\.location\.pathname/);
  assert.doesNotMatch(source, /yt-navigate-finish|yt-page-data-updated/);
  assert.doesNotMatch(source, /send_arrow_down|scroll_fallback|KeyboardEvent/);
  assert.doesNotMatch(
    source,
    /create_auto_advance_like_gate|autoAdvanceLikeGate/,
  );
});

test("logs the bounded Like-check lifecycle", () => {
  const source = fs.readFileSync(require.resolve("./youtube.js"), "utf8");

  for (const event of [
    "scheduled",
    "attempt",
    "cancelled",
    "retry-exhausted",
    "decision",
  ]) {
    assert.match(source, new RegExp(`log_like_check\\("${event}"`));
  }
  assert.match(source, /threshold: CFG\.minLikeCount/);
  assert.match(source, /action: likes < CFG\.minLikeCount \? "skip" : "keep"/);
});

function makeFlow() {
  let currentTime = 1000;
  const diagnostics = [];
  const flow = create_shorts_auto_flow({
    now: () => currentTime,
    advanceAttemptIntervalMs: 500,
    onDiagnostic(event, details) {
      diagnostics.push({ event, details });
    },
  });

  return {
    flow,
    diagnostics,
    advanceTime(milliseconds) {
      currentTime += milliseconds;
    },
  };
}

test("starts in watching and ignores ordinary observations", () => {
  const { flow, diagnostics } = makeFlow();

  assert.deepEqual(flow.get_state(), {
    mode: "watching",
    identity: "",
  });
  assert.equal(flow.observe("initial"), false);
  assert.equal(flow.observe("manual-next"), false);
  assert.deepEqual(diagnostics, []);
});

test("rate limits navigation attempts until the identity changes", () => {
  const { flow, diagnostics, advanceTime } = makeFlow();

  assert.equal(flow.start_advance("source", "finished"), true);
  assert.deepEqual(flow.get_state(), {
    mode: "advancing",
    identity: "source",
  });
  assert.equal(flow.should_attempt_advance("source"), true);
  assert.equal(flow.should_attempt_advance("source"), false);
  advanceTime(499);
  assert.equal(flow.should_attempt_advance("source"), false);
  advanceTime(1);
  assert.equal(flow.should_attempt_advance("source"), true);

  assert.equal(flow.observe("source"), false);
  assert.equal(flow.observe("destination"), true);
  assert.deepEqual(flow.get_state(), {
    mode: "checking",
    identity: "destination",
  });
  assert.equal(flow.observe("destination"), false);
  assert.deepEqual(
    diagnostics.map(({ event }) => event),
    [
      "advance-started",
      "advance-attempt",
      "advance-attempt",
      "destination-observed",
    ],
  );
});

test("keeps a popular destination and watches it", () => {
  const { flow } = makeFlow();

  flow.start_advance("source", "finished");
  flow.observe("destination");

  assert.equal(flow.complete_check("destination", { skip: false }), true);
  assert.deepEqual(flow.get_state(), {
    mode: "watching",
    identity: "destination",
  });
});

test("supports chained low-like skips", () => {
  const { flow } = makeFlow();

  flow.start_advance("first", "finished");
  assert.equal(flow.observe("second"), true);
  assert.equal(flow.complete_check("second", { skip: true }), true);
  assert.deepEqual(flow.get_state(), {
    mode: "advancing",
    identity: "second",
  });
  assert.equal(flow.observe("third"), true);
  assert.deepEqual(flow.get_state(), {
    mode: "checking",
    identity: "third",
  });
});

test("cancel prevents stale destination eligibility", () => {
  const { flow, diagnostics } = makeFlow();

  flow.start_advance("source", "finished");
  flow.cancel("disabled");

  assert.equal(flow.observe("manual-later"), false);
  assert.deepEqual(flow.get_state(), {
    mode: "watching",
    identity: "manual-later",
  });
  assert.deepEqual(
    diagnostics.map(({ event }) => event),
    ["advance-started", "cancelled"],
  );
});

test("manual navigation invalidates a pending Like check", () => {
  const { flow } = makeFlow();

  flow.start_advance("source", "finished");
  flow.observe("auto-destination");
  assert.equal(flow.observe("manual-destination"), false);
  assert.deepEqual(flow.get_state(), {
    mode: "watching",
    identity: "manual-destination",
  });
  assert.equal(flow.complete_check("auto-destination", { skip: true }), false);
});

test("diagnostic callback failures do not affect flow behavior", () => {
  const flow = create_shorts_auto_flow({
    onDiagnostic() {
      throw new Error("diagnostic failed");
    },
  });

  assert.doesNotThrow(() => flow.start_advance("source", "finished"));
  assert.equal(flow.should_attempt_advance("source"), true);
  assert.equal(flow.observe("destination"), true);
  assert.equal(flow.complete_check("destination", { skip: false }), true);
});
