var vars = {
  gravity: 1000,
  power: 300,
  tick: 10,
  birdScale: 0.2,

  started: false,
  speed: 0,
  altitude: 0,
  score: 0,
  pipes: [],

  birdHeightPx: 267,
  birdWidthPx: 444,
  birdImgAspectRatio: 600 / 333,
  birdImgHeightPercentage: 124,
  birdImgOffsetBottomPx: 21,
  birdImgOffsetRightPx: 65,
  maxRotateDeg: 90,
  rotateThreshold: 180,
  worldTranslate: "20%",
};

function ready() {
  renderElements();
  document.body.onkeydown = function (e) {
    if (e.key == " " || e.code == "Space" || e.keyCode == 32) flap();
  };
  document.body.onclick = () => flap();
  setInterval(() => tick(), vars.tick);
}

function renderElements() {
  var gameDiv = document.createElement("div");
  Object.assign(gameDiv.style, {
    height: "100%",
    position: "relative",
    overflow: "hidden",
    userSelect: "none",
  });
  document.body.appendChild(gameDiv);

  var bgDiv = document.createElement("div");
  Object.assign(bgDiv.style, {
    background: "url(assets/background.png)",
    backgroundSize: "100% 100%",
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: -1,
  });
  gameDiv.appendChild(bgDiv);

  var scoreDiv = document.createElement("div");
  scoreDiv.id = "score";
  Object.assign(scoreDiv.style, {
    position: "absolute",
    fontSize: "xxx-large",
    padding: 10,
  });
  gameDiv.appendChild(scoreDiv);

  var worldDiv = document.createElement("div");
  Object.assign(worldDiv.style, {
    position: "absolute",
    height: "100%",
    width: "100%",
    transform: `translate(${vars.worldTranslate})`,
  });
  gameDiv.appendChild(worldDiv);

  var birdDiv = document.createElement("div");
  birdDiv.id = "bird";
  Object.assign(birdDiv.style, {
    position: "absolute",
    width: vars.birdWidthPx * vars.birdScale,
    height: vars.birdHeightPx * vars.birdScale,
  });
  worldDiv.appendChild(birdDiv);
  var birdImg = document.createElement("img");
  birdImg.src = "./assets/bird.png";
  Object.assign(birdImg.style, {
    position: "absolute",
    height: `${vars.birdImgHeightPercentage}%`,
    aspectRatio: vars.birdImgAspectRatio,
    bottom: -vars.birdImgOffsetBottomPx * vars.birdScale,
    right: -vars.birdImgOffsetRightPx * vars.birdScale,
  });
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
  draw();
  if (vars.altitude < 0) {
    endGame();
    return;
  }
}

function startGame() {
  vars.started = true;
  vars.score = 0;
  vars.altitude = 0;
  vars.pipes = [];
}

function draw() {
  var birdDiv = document.getElementById("bird");
  birdDiv.style.bottom = vars.altitude;
  birdDiv.style.transform = `rotate(${getRotate()}deg)`;

  var scoreDiv = document.getElementById("score");
  scoreDiv.innerText = vars.score.toFixed(2);
}

function endGame() {
  vars.started = false;
}

function getRotate() {
  return (
    (-vars.maxRotateDeg * Math.atan(vars.speed / vars.rotateThreshold)) /
    (Math.PI / 2)
  );
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
