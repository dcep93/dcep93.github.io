function injectKtv420PageScript(fileName, onload) {
  const scriptId = `ktv420-${fileName.replace(/[^\w-]+/g, "-")}`;
  if (document.getElementById(scriptId)) {
    onload?.();
    return;
  }

  const root = document.head || document.documentElement;
  if (!root) {
    setTimeout(() => injectKtv420PageScript(fileName, onload), 0);
    return;
  }

  const script = document.createElement("script");
  script.id = scriptId;
  script.src = chrome.runtime.getURL(`extensions/${fileName}`);
  script.async = false;
  script.onload = () => {
    script.remove();
    onload?.();
  };
  root.appendChild(script);
}

function bootstrapKtv420Spotify() {
  if (document.documentElement?.hasAttribute("data-ktv420-spotify-bootstrap")) {
    return;
  }

  document.documentElement?.setAttribute("data-ktv420-spotify-bootstrap", "true");
  injectKtv420PageScript("ktv420/clickLogo.js", () => {
    injectKtv420PageScript("ktv420/index.js");
  });
}

bootstrapKtv420Spotify();
