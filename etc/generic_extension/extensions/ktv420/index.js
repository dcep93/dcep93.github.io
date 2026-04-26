const KTV_LOGO_ID = "ktv420-spotify-logo-button";

function createLogoButton() {
  const button = document.createElement("button");
  button.id = KTV_LOGO_ID;
  button.type = "button";
  button.setAttribute("aria-label", "ktv420");
  button.title = "ktv420";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.width = "32px";
  button.style.height = "32px";
  button.style.marginLeft = "12px";
  button.style.padding = "0";
  button.style.border = "0";
  button.style.background = "transparent";
  button.style.cursor = "pointer";

  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
      <g transform="translate(32 35) scale(1.22 1.22)">
        <text
          x="0"
          y="0"
          fill="#ff7bc3"
          font-family="'Comic Sans MS', 'Comic Sans', cursive"
          font-size="58"
          font-weight="400"
          stroke="#000"
          stroke-width="3"
          paint-order="stroke fill"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          k
        </text>
      </g>
    </svg>
  `;

  button.addEventListener("click", () => {
    alert("ktv420");
  });

  return button;
}

function attachLogo() {
  const spotifyLogo = document.querySelector('[data-encore-id="logoSpotify"]');
  if (!spotifyLogo) {
    return false;
  }

  const logoContainer = spotifyLogo.closest("a")?.parentElement;
  if (!logoContainer) {
    return false;
  }

  const existingButton = document.getElementById(KTV_LOGO_ID);
  if (existingButton && existingButton.parentElement === logoContainer) {
    return true;
  }

  existingButton?.remove();
  logoContainer.appendChild(createLogoButton());
  return true;
}

function init() {
  attachLogo();

  const observer = new MutationObserver(() => {
    attachLogo();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
