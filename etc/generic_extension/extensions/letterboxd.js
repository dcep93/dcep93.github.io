const start = Date.now();
const duration_ms = 1000;

function main() {
  hideAds();
  syncDiary();
}

function hideAds() {
  if (Date.now() - start > duration_ms) return;
  Promise.resolve()
    .then(() => {
      console.log("hideAds.loop");
      return Promise.resolve()
        .then(() => document.getElementsByTagName("button"))
        .then(Array.from)
        .then((buttons) =>
          buttons.find(
            (button) => button.innerText === "Continue without supporting us"
          )
        )
        .then((button) =>
          button
            ? Promise.resolve()
                .then(() => button.click())
                .then(() => true)
            : false
        );
    })
    .then((done) => done || setTimeout(hideAds, 100));
}

function syncDiary() {
  fetch("https://letterboxd.com/data/export/", {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      priority: "u=0, i",
      "sec-ch-ua":
        '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
    },
    referrer: "https://letterboxd.com/settings/data/",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  });
}

main();
