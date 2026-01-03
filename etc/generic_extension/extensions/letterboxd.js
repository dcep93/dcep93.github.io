const start = Date.now();
const duration_ms = 5000;

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

async function syncDiary() {
  // fetch and unzip
  const zipResp = await fetch("https://letterboxd.com/data/export/", {
    credentials: "include",
  });
  if (!zipResp.ok) throw new Error("Export download failed: " + zipResp.status);
  const zipBytes = await zipResp.arrayBuffer();

  // load JSZip
  const jszipScript = document.createElement("script");
  jszipScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
  document.head.appendChild(jszipScript);
  await new Promise((r) => (jszipScript.onload = r));

  const zip = await JSZip.loadAsync(zipBytes);

  async function getCsv(fileName) {
    const fileObj = zip.file(fileName);
    if (!fileObj) return [];

    const text = await fileObj.async("text");
    const lines = text.trim().split("\n");
    const headers = lines
      .shift()
      .split(",")
      .map((h) => h.trim());
    const parsed = [];

    for (let i = 0; i < lines.length; i++) {
      const row = lines[i].split(",").map((v) => v.replace(/^"|"$/g, ""));
      const obj = {};
      headers.forEach((h, idx) => (obj[h] = row[idx]));
      parsed.push(obj);
    }
    return parsed;
  }

  const diary = await getCsv("diary.csv");
  const ratings = await getCsv("ratings.csv");

  function getKey(e) {
    return `${e.Name}::${e.Year}`;
  }

  const diarySet = new Set(diary.map(getKey));

  const missingRatings = ratings
    .sort((a, b) => a["Name"].localeCompare(b["Name"]))
    .filter((r) => !diarySet.has(getKey(r)));

  const timestamp = Math.floor(Date.now() / 1000);

  console.log({ missingRatings });

  return;

  missingRatings.map((r, i) =>
    Promise.resolve()
      .then(() => new Promise((resolve) => setTimeout(resolve, i * 100)))
      .then(() => console.log(r))
      .then(() =>
        fetch(
          `https://letterboxd.com/s/autocompletefilm?q=${r["Name"]}&limit=1&timestamp=${timestamp}`,
          {
            headers: {
              accept: "*/*",
              "accept-language": "en-US,en;q=0.9",
              "content-type":
                "application/x-www-form-urlencoded; charset=UTF-8",
              priority: "u=1, i",
              "sec-ch-ua":
                '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"macOS"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
            },
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "include",
          }
        )
      )
      .then((resp) => resp.json())
      .then((resp) => ({ csrf: resp.csrf, filmId: resp.data[0].id }))
      .then(({ csrf, filmId }) =>
        fetch("https://letterboxd.com/s/save-diary-entry", {
          headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            priority: "u=1, i",
            "sec-ch-ua":
              '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
          },
          body: `json=true&__csrf=${csrf}&viewingId=&viewingableUid=film%3A${filmId}&specifiedDate=true&viewingDateStr=${
            r["Date"]
          }&review=&tags=&rating=${Number(
            r["Rating"] * 2
          )}&viewingableUID=film%3A${filmId}`,
          method: "POST",
          mode: "cors",
          credentials: "include",
        })
      )
  );
}

main();
