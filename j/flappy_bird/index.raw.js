var vars = {
  gravity: 400,
  power: 300,
  tick: 10,
  birdScale: 0.2,

  velocity: 0,
  interval: undefined,
  birdHeightPx: 267,
  birdWidthPx: 446,
  birdOffsetBottomPx: 22,
  birdOffsetRightPx: 66,
};

function ready() {
  renderElements();
  document.body.onkeydown = function (e) {
    if (e.key == " " || e.code == "Space" || e.keyCode == 32) flap();
  };
  document.body.onclick = () => flap();
  vars.interval = setInterval(() => tick(), vars.tick);
}

function renderElements() {
  var div = document.createElement("div");
  div.style.height = "100%";
  div.style.position = "relative";
  document.body.appendChild(div);

  var bg = document.createElement("div");
  bg.style.background = "url(assets/background.png)";
  bg.style.backgroundSize = "100% 100%";
  bg.style.width = "100%";
  bg.style.height = "100%";
  bg.style.position = "absolute";
  div.appendChild(bg);

  var bird = document.createElement("div");
  bird.id = "bird";
  bird.style.position = "absolute";
  bird.style.transform = `scale(${vars.birdScale})`;
  bird.style.transformOrigin = "top left";
  bird.style.backgroundColor = "red";
  div.appendChild(bird);
  var space = document.createElement("div");
  space.style.width = vars.birdWidthPx;
  space.style.height = vars.birdHeightPx;
  bird.appendChild(space);
  var subBird = document.createElement("img");
  subBird.src = "./assets/bird.png";
  subBird.style.position = "absolute";
  subBird.style.bottom = -vars.birdOffsetBottomPx;
  subBird.style.right = -vars.birdOffsetRightPx;
  bird.appendChild(subBird);
}

function flap() {
  console.log("flap");
}

function tick() {
  // console.log("tick");
}

var functions = Object.keys({
  vars,
  renderElements,
  ready,
  flap,
  tick,
});

////

(function () {
  function main() {
    document.addEventListener("DOMContentLoaded", ready);
  }

  main();
})();
