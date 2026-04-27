(() => {
  const app = window.KTV420 || (window.KTV420 = {});
  const faviconUrl = getModuleAssetUrl("favicon.svg");

  function getModuleAssetUrl(fileName) {
    const scriptUrl = document.currentScript?.src;
    if (!scriptUrl) {
      throw new Error("KTV420 UI could not resolve its module URL.");
    }

    return new URL(fileName, scriptUrl).href;
  }

  function createCaptureButton() {
    const button = document.createElement("button");
    button.id = app.config.buttonId;
    button.type = "button";
    button.setAttribute("aria-label", "KTV420");
    button.style.display = "inline-flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.width = "32px";
    button.style.minWidth = "32px";
    button.style.height = "32px";
    button.style.marginLeft = "12px";
    button.style.padding = "0";
    button.style.border = "1px solid rgba(255,255,255,0.18)";
    button.style.borderRadius = "999px";
    button.style.background = "rgba(255,255,255,0.08)";
    button.style.cursor = "pointer";

    const icon = document.createElement("img");
    icon.src = faviconUrl;
    icon.alt = "";
    icon.draggable = false;
    icon.style.display = "block";
    icon.style.width = "22px";
    icon.style.height = "22px";

    button.appendChild(icon);
    button.addEventListener("click", () => {
      app.main.startCapture();
    });
    syncCaptureButtonState(button);
    return button;
  }

  function syncCaptureButtonState(button) {
    const enabled = Boolean(app.main?.isRunning?.() || app.spotifyPage?.isAlbumOrPlaylistRoute?.());
    button.disabled = !enabled;
    button.title = enabled
      ? "Run KTV420 on this album or playlist."
      : "KTV420 only runs on Spotify album and playlist pages.";
    button.style.cursor = enabled ? "pointer" : "not-allowed";
    button.style.opacity = enabled ? "1" : "0.45";
    button.style.filter = enabled ? "" : "grayscale(1)";
  }

  function refreshCaptureButton() {
    const spotifyLogo = document.querySelector('[data-encore-id="logoSpotify"]');
    if (!spotifyLogo) {
      return false;
    }

    const logoContainer = spotifyLogo.closest("a")?.parentElement;
    if (!logoContainer) {
      return false;
    }

    const existingButton = document.getElementById(app.config.buttonId);
    if (existingButton && existingButton.parentElement === logoContainer) {
      syncCaptureButtonState(existingButton);
      return true;
    }

    existingButton?.remove();
    const button = createCaptureButton();
    logoContainer.appendChild(button);
    syncCaptureButtonState(button);
    return true;
  }

  function init() {
    if (!document.body) {
      return;
    }

    refreshCaptureButton();

    const observer = new MutationObserver(() => {
      refreshCaptureButton();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  app.ui = {
    refreshCaptureButton,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
