const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const {
  create_shorts_auto_flow,
  parse_compact_count,
  get_like_count_from_button,
} = require("./youtube.js");

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
  assert.doesNotMatch(source, /create_auto_advance_like_gate|autoAdvanceLikeGate/);
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
  assert.equal(
    flow.complete_check("auto-destination", { skip: true }),
    false,
  );
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
