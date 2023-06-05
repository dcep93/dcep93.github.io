var vars = {
  gravity: 1000,
  power: 300,
  tick: 10,
  pipeSpeed: 0.3,
  pipeGapPx: 130,
  birdScale: 0.15,

  running: false,
  speed: 0,
  altitude: 0,
  score: 0,
  pipes: [],

  worldTranslate: "20%",
  pipeWidthPx: 100,
  pipeDisappearPx: 1000,
  pipeReappearPx: 1000,
  pipeSpacingX: 600,
  pipeSpacingXVariance: [0.7, 0.9],
  pipeHeightYVariance: [0.2, 0.7],
  birdHeightPx: 267,
  birdWidthPx: 444,
  birdImgAspectRatio: 600 / 333,
  birdImgHeightPercentage: 124,
  birdImgOffsetBottomPx: 21,
  birdImgOffsetRightPx: 65,
  maxRotateDeg: 90,
  rotateThreshold: 180,
};

function ready() {
  renderElements();
  document.body.onkeydown = function (e) {
    if (e.key == " " || e.code == "Space" || e.keyCode == 32) flap();
  };
  setInterval(() => tick(), vars.tick);
}

function renderElements() {
  var gameDiv = document.createElement("div");
  gameDiv.id = "game";
  Object.assign(gameDiv.style, {
    height: "100%",
    position: "relative",
    overflow: "hidden",
    userSelect: "none",
  });
  document.body.appendChild(gameDiv);

  var bgDiv = document.createElement("div");
  bgDiv.id = "bg";
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
  worldDiv.id = "world";
  Object.assign(worldDiv.style, {
    position: "absolute",
    height: "100%",
    width: "100%",
    transform: `translate(${vars.worldTranslate})`,
  });
  gameDiv.appendChild(worldDiv);

  var allPipesDiv = document.createElement("div");
  allPipesDiv.id = "all_pipes";
  Object.assign(allPipesDiv.style, { height: "100%" });
  worldDiv.appendChild(allPipesDiv);

  var birdDiv = document.createElement("div");
  birdDiv.id = "bird";
  Object.assign(birdDiv.style, {
    position: "absolute",
    width: vars.birdWidthPx * vars.birdScale,
    height: vars.birdHeightPx * vars.birdScale,
  });
  worldDiv.appendChild(birdDiv);

  var birdImg = document.createElement("img");
  birdImg.id = "bird_img";
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
  if (!vars.running) {
    startGame();
  }
  vars.speed = vars.power;
}

function tick() {
  if (!vars.running) {
    return;
  }
  vars.score += vars.tick / 100;
  vars.speed -= (vars.gravity * vars.tick) / 1000;
  vars.altitude = vars.altitude + (vars.speed * vars.tick) / 1000;
  updatePipes();
  draw();
  if (vars.altitude < 0) {
    endGame();
    return;
  }
  if (isHittingAPipe()) {
    endGame();
    return;
  }
}

function randomBetween(low, high) {
  return low + (high - low) * Math.random();
}

function updatePipes() {
  var nextPipes = [];
  var maxX = 0;
  for (var pipe of vars.pipes) {
    pipe.lastX = pipe.x;
    pipe.x -= vars.tick * vars.pipeSpeed;
    maxX = Math.max(maxX, pipe.x);
    if (pipe.x > -vars.pipeDisappearPx) {
      nextPipes.push(pipe);
    }
  }
  vars.pipes = nextPipes;
  if (maxX < vars.pipeReappearPx) {
    var x =
      vars.pipeReappearPx +
      vars.pipeSpacingX * randomBetween(...vars.pipeSpacingXVariance);
    var y =
      document.body.offsetHeight * randomBetween(...vars.pipeHeightYVariance);
    vars.pipes.push({
      x,
      y,
    });
  }
}

function isHittingAPipe() {
  for (var pipe of vars.pipes) {
    if (pipe.lastX > 0 && pipe.x < 0) {
      if (vars.altitude < pipe.y) {
        return true;
      }
      if (
        vars.altitude + vars.birdHeightPx * vars.birdScale >
        pipe.y + vars.pipeGapPx
      ) {
        return true;
      }
    }
  }
  return false;
}

function startGame() {
  vars.running = true;
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

  var allPipesDiv = document.getElementById("all_pipes");
  allPipesDiv.replaceChildren();
  for (var pipe of vars.pipes) {
    var pipesDiv = document.createElement("div");
    pipesDiv.className = "pipes";
    Object.assign(pipesDiv.style, {
      left: pipe.x,
      position: "absolute",
      height: "100%",
      width: vars.pipeWidthPx,
    });
    allPipesDiv.appendChild(pipesDiv);

    // TODO extend pipes

    var bottomPipeWrapper = document.createElement("div");
    bottomPipeWrapper.className = "pipe_wrapper";
    Object.assign(bottomPipeWrapper.style, {
      position: "absolute",
      width: "100%",
      height: "100%",
      height: pipe.y,
      bottom: 0,
    });
    pipesDiv.appendChild(bottomPipeWrapper);
    var bottomPipe = document.createElement("img");
    bottomPipe.className = "bottom_pipe";
    bottomPipe.src = "./assets/pipe.png";
    Object.assign(bottomPipe.style, {
      width: "100%",
    });
    bottomPipeWrapper.appendChild(bottomPipe);

    var topPipeWrapper = document.createElement("div");
    topPipeWrapper.className = "pipe_wrapper";
    Object.assign(topPipeWrapper.style, {
      position: "absolute",
      width: "100%",
      height: "100%",
      bottom: pipe.y + vars.pipeGapPx,
      transform: "scaleX(-1)",
      transform: "scaleY(-1)",
    });
    pipesDiv.appendChild(topPipeWrapper);
    var topPipe = document.createElement("img");
    topPipe.className = "top_pipe";
    topPipe.src = "./assets/pipe.png";
    Object.assign(topPipe.style, {
      width: "100%",
    });
    topPipeWrapper.appendChild(topPipe);
  }
}

function endGame() {
  vars.running = false;
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
  updatePipes,
  isHittingAPipe,
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
