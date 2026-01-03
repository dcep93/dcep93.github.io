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

  // normalize a Letterboxd URI to its unique part
  function normalizeURI(uri) {
    return (
      uri?.trim()?.replace(/\/$/, "")?.split("/").pop()?.toLowerCase() || ""
    );
  }

  async function getCsv(fileName) {
    const fileObj = zip.file(fileName);
    if (!fileObj) return [];

    const text = await fileObj.async("text");
    const lines = text.trim().split("\n");
    const headers = lines.shift().split(",");
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

  const missingRatings = ratings.filter((r) => !diarySet.has(getKey(r)));
}

main();
