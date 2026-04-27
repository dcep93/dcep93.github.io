(() => {
  const app = window.KTV420 || (window.KTV420 = {});

  async function copyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = String(text);
    textArea.setAttribute("readonly", "true");
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    textArea.style.opacity = "0";

    const root = document.body || document.documentElement;
    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    root.appendChild(textArea);

    try {
      window.focus();
    } catch (_error) {}

    textArea.focus({ preventScroll: true });
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    const copied = document.execCommand("copy");
    textArea.remove();

    if (previousActiveElement) {
      try {
        previousActiveElement.focus({ preventScroll: true });
      } catch (_error) {}
    }

    if (copied) {
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    throw new Error("Clipboard write failed.");
  }

  async function copyJson(value) {
    await copyText(JSON.stringify(value, null, 2));
  }

  app.clipboard = { copyJson, copyText };
})();
