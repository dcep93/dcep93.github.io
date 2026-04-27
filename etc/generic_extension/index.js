function execute() {
  const paths = [
    {
      p: /https:\/\/open\.spotify\.com\/.*/,
      jss: [
        "ktv420/config.js",
        "ktv420/trackId.js",
        "ktv420/timing.js",
        "ktv420/spotifyPage.js",
        "ktv420/clipboard.js",
        "ktv420/md5.js",
        "ktv420/mediaElements.js",
        "ktv420/pcmCapture.js",
        "ktv420/playbackCapture.js",
        "ktv420/debugLog.js",
        "ktv420/main.js",
        "ktv420/ui.js",
      ],
    },
    {
      p: /https:\/\/www\.nytimes\.com\/games\/wordle\/index\.html/,
      jss: ["wordle.txt", "wordle.js"],
    },
    {
      p: new RegExp(
        "https://www.buildinglink.com/V2/Tenant/Postings/PostingAreas.aspx",
      ),
      jss: ["buildinglink_postings.js"],
    },
    {
      p: /https:\/\/www\.ticketmaster\.com.*/,
      jss: ["ticketmaster.js"],
    },
    {
      p: /https:\/\/letterboxd\.com.*/,
      jss: ["letterboxd.js"],
    },
    {
      p: /https:\/\/www\.reddit\.com.*/,
      jss: ["reddit.js"],
    },
    {
      p: /https:\/\/www\.youtube\.com\/.*/,
      jss: ["youtube.js"],
    },
    {
      p: /https:\/\/colonist\.io\/.*/,
      jss: ["colonist.js"],
    },
  ];

  const jss = paths
    .filter((o) => location.href.match(o.p))
    .flatMap((o) => o.jss);

  if (jss.length > 0) {
    console.log("generic_extension", jss);
  }

  allPromises(jss.map((js) => () => fileToPromise(js))).catch(alert);
}

function allPromises(arr) {
  if (arr.length === 0) return Promise.resolve();
  return Promise.resolve()
    .then(() => arr.shift()())
    .then(() => allPromises(arr));
}

async function fileToPromise(fileName) {
  const url = chrome.runtime.getURL(`extensions/${fileName}`);
  const root = await waitForDocumentRoot();
  if (fileName.endsWith(".txt")) {
    const d = document.createElement("data");
    d.setAttribute("id", fileName);
    root.appendChild(d);
    return fetch(url)
      .then((resp) => resp.text())
      .then((text) => (d.innerHTML = text));
  }
  const scriptId = `generic-extension-${fileName.replace(/[^\w-]+/g, "-")}`;
  if (document.documentElement?.hasAttribute(`data-loaded-${scriptId}`)) {
    return Promise.resolve();
  }

  const s = document.createElement("script");
  s.id = scriptId;
  s.src = url;
  document.documentElement?.setAttribute(`data-loaded-${scriptId}`, "loading");
  return new Promise((resolve, reject) => {
    s.onload = () => {
      document.documentElement?.setAttribute(`data-loaded-${scriptId}`, "true");
      resolve();
    };
    s.onerror = () => {
      document.documentElement?.removeAttribute(`data-loaded-${scriptId}`);
      reject(new Error(`Failed to load ${fileName}`));
    };
    root.appendChild(s);
  });
}

function waitForDocumentRoot() {
  return new Promise((resolve) => {
    const root = document.head || document.documentElement;
    if (root) {
      resolve(root);
      return;
    }

    setTimeout(() => resolve(document.head || document.documentElement), 0);
  });
}

execute();
