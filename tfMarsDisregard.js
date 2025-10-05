const disregarded = [];
window.customMiddlewareF = (ctx) => {
  if (!ctx.app) return;
  const playerHomeBlock = document.querySelector(".player_home_block--actions");
  if (!playerHomeBlock) return;
  const wfAction = playerHomeBlock.querySelector(".wf-action");
  if (!wfAction) return;
  const oldButton = wfAction.querySelector(".btn-submit");
  if (!oldButton) return;
  const newButton = oldButton.cloneNode(true);
  newButton.textContent = "disregard";
  wfAction.appendChild(newButton);
  const disregardedDiv = document.createElement("div");
  const clearAllDisregardedButton = oldButton.cloneNode(true);
  clearAllDisregardedButton.textContent = `clear all (${disregarded.length}) disregarded`;
  // @ts-ignore / Property 'onclick' does not exist on type 'Node'.ts(2339)
  clearAllDisregardedButton.onclick = () => {
    disregarded.splice(0);
    ctx.app.playerkey++;
  };
  disregardedDiv.appendChild(clearAllDisregardedButton);
  wfAction.appendChild(disregardedDiv);
  // @ts-ignore / Property 'onclick' does not exist on type 'Node'.ts(2339)
  newButton.onclick = () => {
    const checkedLabels = Array.from(
      playerHomeBlock.querySelectorAll(".wf-options label")
    ).filter((label) => label.querySelector('input[type="radio"]:checked'));
    if (
      checkedLabels.length === 1 &&
      playerHomeBlock.querySelector(".card-title")
    ) {
      return;
    }
    disregarded.push({
      action: checkedLabels[0]?.textContent.trim(),
      selectedCard: !checkedLabels[1]
        ? undefined
        : checkedLabels[1].querySelector(".card-title").textContent.trim(),
    });
    ctx.app.playerkey++;
  };
  const options = Array.from(
    playerHomeBlock.querySelectorAll(".wf-options > div")
  );
  disregarded.forEach((d, index) => {
    const { action, selectedCard } = d;
    const optionDiv = options.find(
      (div) => div.querySelector(".form-radio")?.textContent.trim() === action
    );
    if (selectedCard) {
      optionDiv
        .querySelector('input[type="radio"]')
        .addEventListener("change", () => {
          const allCards = Array.from(
            optionDiv.querySelectorAll("label")
          ).filter((label) => !label.matches(".form-radio"));
          const cardDiv = allCards.find(
            (cardLabel) =>
              cardLabel.querySelector(".card-title").textContent.trim() ===
              selectedCard
          );
          if (cardDiv) {
            cardDiv.style.display = "none";
            const nextCard = allCards.find((o) => o.style.display !== "none");
            if (nextCard) {
              nextCard.click();
            } else {
              optionDiv.style.display = "none";
              options
                .find((o) => o.style.display !== "none")
                .querySelector("label")
                .click();
            }
          }
        });
    } else {
      optionDiv.style.display = "none";
    }
    const disregardButton = oldButton.cloneNode(true);
    disregardButton.textContent = [action, selectedCard]
      .filter(Boolean)
      .join(".");
    // @ts-ignore / Property 'onclick' does not exist on type 'Node'.ts(2339)
    disregardButton.onclick = () => {
      disregarded.splice(index, 1);
      ctx.app.playerkey++;
    };
    disregardedDiv.appendChild(disregardButton);
  });
  options
    .find((o) => o.style.display !== "none")
    .querySelector("label")
    .click();
};
