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

function init() {
  if (location.href.match(/.*\/comments\/.*\//)) {
    const url = new URL(location.href);
    url.searchParams.set("sort", "top");
    location.href = url.toString();
  }
}

function main() {
  init();
  loop();
}

main();
