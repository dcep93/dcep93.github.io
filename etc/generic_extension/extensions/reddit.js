function loop() {
  Promise.resolve()
    .then(() =>
      ["shreddit-ad-post", "shreddit-comment-tree-ad"]
        .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
        .filter(Boolean),
    )
    .then((ads) => ads.forEach((ad) => (ad.style.display = "none")))
    .finally(() => setTimeout(loop, 100));
}

function init() {
  if (location.href.match(/.*\/comments\/.*\//)) {
    const url = new URL(location.href);
    url.searchParams.set("sort", "top");
    location.href = url.toString();
  }

  dontPauseVideos()
}

function dontPauseVideos() {// ==UserScript==
  // @name         Reddit keep playing unless I pause
  // @match        https://www.reddit.com/*
  // @match        https://new.reddit.com/*
  // @match        https://sh.reddit.com/*
  // @run-at       document-start
  // @grant        none
  // ==/UserScript==

  (() => {
    let userPaused = new WeakSet();

    function markUserPause(video) {
      userPaused.add(video);
      setTimeout(() => userPaused.delete(video), 1500);
    }

    document.addEventListener("click", e => {
      const video = e.target.closest?.("video");
      if (video) markUserPause(video);
    }, true);

    document.addEventListener("keydown", e => {
      if (e.code === "Space" || e.key === "k") {
        for (const v of document.querySelectorAll("video")) {
          if (!v.paused) markUserPause(v);
        }
      }
    }, true);

    const realPause = HTMLMediaElement.prototype.pause;

    HTMLMediaElement.prototype.pause = function () {
      if (userPaused.has(this)) {
        return realPause.call(this);
      }

      const rect = this.getBoundingClientRect();
      const offscreen =
        rect.bottom < 0 ||
        rect.top > window.innerHeight ||
        document.visibilityState !== "visible";

      if (offscreen) {
        return; // block Reddit auto-pause
      }

      return realPause.call(this);
    };

    Object.defineProperty(document, "hidden", {
      get: () => false,
      configurable: true
    });

    Object.defineProperty(document, "visibilityState", {
      get: () => "visible",
      configurable: true
    });
  })();
}

function main() {
  init();
  loop();
}

main();
