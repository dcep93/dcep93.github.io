const KTV_TRACK_ID_INPUT_ID = "ktv420-spotify-track-id-input";
const KTV_FORM_ID = "ktv420-spotify-track-id-form";
const KTV_DEFAULT_TRACK_ID = "4kr3l1fAE5gkjxkbE7WU65";

function createSubmitButton() {
    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "md5";
    button.style.display = "inline-flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.minWidth = "52px";
    button.style.height = "32px";
    button.style.padding = "0 12px";
    button.style.border = "1px solid rgba(255,255,255,0.18)";
    button.style.borderRadius = "999px";
    button.style.background = "rgba(255,255,255,0.08)";
    button.style.color = "#fff";
    button.style.fontSize = "14px";
    button.style.cursor = "pointer";

    return button;
}

function createTrackIdInput() {
    const input = document.createElement("input");
    input.id = KTV_TRACK_ID_INPUT_ID;
    input.type = "text";
    input.value = KTV_DEFAULT_TRACK_ID;
    input.placeholder = "track id";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.style.width = "170px";
    input.style.height = "32px";
    input.style.padding = "0 10px";
    input.style.border = "1px solid rgba(255,255,255,0.18)";
    input.style.borderRadius = "999px";
    input.style.background = "rgba(255,255,255,0.08)";
    input.style.color = "#fff";
    input.style.fontSize = "14px";
    input.style.outline = "none";
    return input;
}

function createTrackIdForm() {
    const form = document.createElement("form");
    form.id = KTV_FORM_ID;
    form.style.display = "inline-flex";
    form.style.alignItems = "center";
    form.style.gap = "8px";
    form.style.marginLeft = "12px";

    const input = createTrackIdInput();
    const button = createSubmitButton();

    form.appendChild(input);
    form.appendChild(button);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitTrackId(input.value);
    });

    return form;
}

function attachTrackIdForm() {
    const spotifyLogo = document.querySelector('[data-encore-id="logoSpotify"]');
    if (!spotifyLogo) {
        return false;
    }

    const logoContainer = spotifyLogo.closest("a")?.parentElement;
    if (!logoContainer) {
        return false;
    }

    const existingForm = document.getElementById(KTV_FORM_ID);
    if (existingForm && existingForm.parentElement === logoContainer) {
        return true;
    }

    existingForm?.remove();
    document.getElementById(KTV_TRACK_ID_INPUT_ID)?.remove();
    logoContainer.appendChild(createTrackIdForm());
    return true;
}

function init() {
    attachTrackIdForm();

    const observer = new MutationObserver(() => {
        attachTrackIdForm();
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
