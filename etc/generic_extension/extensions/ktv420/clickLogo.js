
function getNowPlayingSongTitle() {
    const titleElement = document.querySelector(
        '[data-testid="now-playing-widget"] [data-testid="context-item-info-title"] a, [data-testid="now-playing-widget"] [data-testid="context-item-info-title"]',
    );

    if (titleElement?.textContent?.trim()) {
        return titleElement.textContent.trim();
    }

    const widgetLabel = document
        .querySelector('[data-testid="now-playing-widget"]')
        ?.getAttribute("aria-label");

    if (widgetLabel?.startsWith("Now playing: ")) {
        return widgetLabel.replace(/^Now playing:\s*/i, "").split(" by ")[0].trim();
    }

    const liveRegionText = Array.from(
        document.querySelectorAll('[role="status"][aria-live="polite"]'),
    )
        .map((element) => element.textContent?.trim())
        .find((text) => text?.startsWith("Now playing: "));

    if (liveRegionText) {
        return liveRegionText.replace(/^Now playing:\s*/i, "").split(" by ")[0].trim();
    }

    return "";
}

function clickLogo() {
    const songTitle = getNowPlayingSongTitle();
    alert(songTitle || "No song is currently playing.");
}
