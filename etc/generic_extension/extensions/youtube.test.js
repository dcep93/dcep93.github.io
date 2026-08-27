const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const {
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
