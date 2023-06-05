var vars = {
  gravity: 1000,
  power: 300,
  tick: 10,
  birdScale: 0.2,

  velocity: 0,
  altitude: 0,

  interval: undefined,
  started: false,
  maxRotateDeg: 90,
  rotateThreshold: 180,
  birdHeightPx: 267,
  birdWidthPx: 444,
  birdImgAspectRatio: 600 / 333,
  birdImgHeightPercentage: 124,
  birdImgOffsetBottomPx: 21,
  birdImgOffsetRightPx: 65,
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
  div.style.overflow = "hidden";
  document.body.appendChild(div);

  var bg = document.createElement("div");
  bg.style.background = "url(assets/background.png)";
  bg.style.backgroundSize = "100% 100%";
  bg.style.width = "100%";
  bg.style.height = "100%";
  bg.style.position = "absolute";
  div.appendChild(bg);

  var birdWrapper = document.createElement("div");
  birdWrapper.id = "bird";
  birdWrapper.style.position = "absolute";
  birdWrapper.style.width = vars.birdWidthPx * vars.birdScale;
  birdWrapper.style.height = vars.birdHeightPx * vars.birdScale;
  birdWrapper.style.backgroundColor = "red";
  div.appendChild(birdWrapper);
  var birdImg = document.createElement("img");
  birdImg.src = "./assets/bird.png";
  birdImg.style.position = "absolute";
  birdImg.style.height = `${vars.birdImgHeightPercentage}%`;
  birdImg.style.aspectRatio = vars.birdImgAspectRatio;
  birdImg.style.bottom = -vars.birdImgOffsetBottomPx * vars.birdScale;
  birdImg.style.right = -vars.birdImgOffsetRightPx * vars.birdScale;
  birdWrapper.appendChild(birdImg);

  drawBird();
}

function flap() {
  vars.started = true;
  vars.velocity = vars.power;
}

function tick() {
  if (!vars.started) return;
  console.log(vars.velocity, vars.altitude);
  vars.velocity -= (vars.gravity * vars.tick) / 1000;
  vars.altitude = vars.altitude + (vars.velocity * vars.tick) / 1000;
  if (vars.altitude < 0) {
    vars.altitude = 0;
    drawBird();
    endGame();
    return;
  }
  drawBird();
}

function drawBird() {
  var bird = document.getElementById("bird");
  bird.style.bottom = vars.altitude;
  var rotate =
    (-vars.maxRotateDeg * Math.atan(vars.velocity / vars.rotateThreshold)) /
    (Math.PI / 2);
  bird.style.transform = `rotate(${rotate}deg)`;
}

function endGame() {
  vars.started = false;
}

var functions = Object.keys({
  vars,
  renderElements,
  ready,
  flap,
  tick,
  drawBird,
  endGame,
});

////

(function () {
  function main() {
    document.addEventListener("DOMContentLoaded", ready);
  }

  main();
})();
