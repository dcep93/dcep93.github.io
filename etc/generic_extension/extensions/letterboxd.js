function loop() {
  Promise.resolve()
    .then(main)
    .then(() => setTimeout(loop, 100));
}

function main() {
  console.log("main");
  return Promise.resolve()
    .then(() => document.getElementsByTagName("button"))
    .then(Array.from)
    .then((buttons) =>
      buttons
        .find((button) => button.innerText === "Continue without supporting us")
        ?.click()
    );
}

loop();
