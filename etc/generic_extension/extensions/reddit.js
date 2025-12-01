function loop() {
  Promise.resolve()
    .then(() =>
      ["shreddit-ad-post", "shreddit-comment-tree-ad"]
        .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
        .filter(Boolean)
    )
    .then((ads) => ads.forEach((ad) => (ad.style.display = "none")))
    .finally(() => setTimeout(loop, 100));
}

loop();
