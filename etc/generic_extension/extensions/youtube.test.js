const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const {
  create_auto_advance_like_gate,
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

test("gates low-like checks on extension-observed destinations", () => {
  const source = fs.readFileSync(require.resolve("./youtube.js"), "utf8");

  assert.match(source, /autoAdvanceLikeGate\.mark_advance\(startSig\)/);
  assert.match(source, /if \(autoAdvanceLikeGate\.observe\(sig\)\)/);
  assert.match(source, /!autoAdvanceLikeGate\.is_eligible\(sig\)/);
  assert.match(source, /autoAdvanceLikeGate\.consume\(sig\)/);
});

function makeGate() {
  let currentTime = 1000;
  const gate = create_auto_advance_like_gate({
    now: () => currentTime,
    transitionTtlMs: 1500,
  });

  return {
    gate,
    advanceTime(milliseconds) {
      currentTime += milliseconds;
    },
  };
}

test("does not authorize initial or manual playback", () => {
  const { gate } = makeGate();

  assert.equal(gate.observe("initial"), false);
  assert.equal(gate.observe("manual-next"), false);
  assert.equal(gate.is_eligible("manual-next"), false);
});

test("authorizes one destination after an extension advance", () => {
  const { gate } = makeGate();

  gate.observe("source");
  gate.mark_advance("source");

  assert.equal(gate.observe("source"), false);
  assert.equal(gate.observe("destination"), true);
  assert.equal(gate.is_eligible("destination"), true);
  assert.equal(gate.consume("destination"), true);
  assert.equal(gate.is_eligible("destination"), false);
  assert.equal(gate.consume("destination"), false);
});

test("supports chained extension low-like skips", () => {
  const { gate } = makeGate();

  gate.observe("first");
  gate.mark_advance("first");
  assert.equal(gate.observe("second"), true);
  assert.equal(gate.consume("second"), true);

  gate.mark_advance("second");
  assert.equal(gate.observe("third"), true);
  assert.equal(gate.is_eligible("third"), true);
});

test("does not authorize a destination after transition expiry", () => {
  const { gate, advanceTime } = makeGate();

  gate.observe("source");
  gate.mark_advance("source");
  advanceTime(1501);

  assert.equal(gate.observe("manual-later"), false);
  assert.equal(gate.is_eligible("manual-later"), false);
});
