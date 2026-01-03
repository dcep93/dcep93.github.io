const start = Date.now();
const duration_ms = 1000;

function loop() {
  if (Date.now() - start > duration_ms) return;
  Promise.resolve()
    .then(main)
    .then((done) => done || setTimeout(loop, 100));
}

function main() {
  console.log("main");
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
}

loop();
