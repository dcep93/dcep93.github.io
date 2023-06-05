var vars = {
  gravity: 1000,
  power: 300,
  tick: 10,
  birdScale: 0.2,

  speed: 0,
  altitude: 0,
  score: 0,

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
  var gameDiv = document.createElement("div");
  gameDiv.style.height = "100%";
  gameDiv.style.position = "relative";
  gameDiv.style.overflow = "hidden";
  gameDiv.style.userSelect = "none";
  document.body.appendChild(gameDiv);

  var bg = document.createElement("div");
  bg.style.background = "url(assets/background.png)";
  bg.style.backgroundSize = "100% 100%";
  bg.style.width = "100%";
  bg.style.height = "100%";
  bg.style.position = "absolute";
  bg.style.zIndex = -1;
  gameDiv.appendChild(bg);

  var scoreDiv = document.createElement("div");
  scoreDiv.id = "score";
  scoreDiv.style.fontSize = "xxx-large";
  scoreDiv.style.padding = 10;
  gameDiv.appendChild(scoreDiv);

  var birdDiv = document.createElement("div");
  birdDiv.id = "bird";
  birdDiv.style.position = "absolute";
  birdDiv.style.width = vars.birdWidthPx * vars.birdScale;
  birdDiv.style.height = vars.birdHeightPx * vars.birdScale;
  birdDiv.style.backgroundColor = "red";
  gameDiv.appendChild(birdDiv);
  var birdImg = document.createElement("img");
  birdImg.src = "./assets/bird.png";
  birdImg.style.position = "absolute";
  birdImg.style.height = `${vars.birdImgHeightPercentage}%`;
  birdImg.style.aspectRatio = vars.birdImgAspectRatio;
  birdImg.style.bottom = -vars.birdImgOffsetBottomPx * vars.birdScale;
  birdImg.style.right = -vars.birdImgOffsetRightPx * vars.birdScale;
  birdDiv.appendChild(birdImg);

  draw();
}

function flap() {
  if (!vars.started) {
    startGame();
  }
  vars.speed = vars.power;
}

function tick() {
  if (!vars.started) {
    return;
  }
  vars.score += vars.tick / 100;
  vars.speed -= (vars.gravity * vars.tick) / 1000;
  vars.altitude = vars.altitude + (vars.speed * vars.tick) / 1000;
  if (vars.altitude < 0) {
    vars.altitude = 0;
    draw();
    endGame();
    return;
  }
  draw();
}

function startGame() {
  vars.started = true;
  vars.score = 0;
}

function draw() {
  var birdDiv = document.getElementById("bird");
  birdDiv.style.bottom = vars.altitude;
  birdDiv.style.transform = `rotate(${getRotate()}deg)`;

  var scoreDiv = document.getElementById("score");
  scoreDiv.innerText = vars.score.toFixed(2);
}

function getRotate() {
  return (
    (-vars.maxRotateDeg * Math.atan(vars.speed / vars.rotateThreshold)) /
    (Math.PI / 2)
  );
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
  draw,
  getRotate,
  endGame,
  startGame,
});

////

(function () {
  function main() {
    document.addEventListener("DOMContentLoaded", ready);
  }

  main();
})();
