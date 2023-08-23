console.log("version 1.4");

var config = {
  gravity: 1300,
  power: 500,
  pipeSpeed: 400,
  pipeVerticalGapPx: 120,
  birdSize: 40,
  pipeReappearPx: 1000,
  pipeSpacingX: 800,
  pipeSpacingXVariance: [0.7, 0.9],
  pipeHeightYVariance: [0.2, 0.7],
};

var state = {
  gameIsRunning: false,
  speed: 0,
  altitude: 0,
  score: 0,
  pipes: [],
};

var visualConfig = {
  tick: 0.005,
  worldTranslatePercent: 20,
  pipeWidthPx: 200,
  pipeBoxWidth: 29,
  pipeBoxLeft: 85,
  birdImgOffsetBottomPx: 21,
  birdImgOffsetRightPx: 25,
  maxRotateDeg: 120,
  rotateThreshold: 180,
};

function ready() {
  renderElements();
  draw();
  assignButtons();
  setInterval(() => tick(), visualConfig.tick * 1000);
  startGame();
}

function assignButtons() {
  document.body.onkeydown = function (e) {
    if (
      (e.key == " " || e.code == "Space" || e.keyCode == 32) &&
      state.gameIsRunning
    )
      flap();
  };
  document.body.onclick = () => startGame();
}

function tick() {
  if (!state.gameIsRunning) {
    return;
  }
  state.score += visualConfig.tick * 10;
  updateBird();
  updatePipes();
  maybeMakeNewPipe();
  draw();
  if (state.altitude < 0) {
    endGame();
    return;
  }
  if (isHittingAPipe()) {
    endGame();
    return;
  }
}

function startGame() {
  state.score = 0;
  state.altitude = 0;
  state.pipes = [];
  flap();
  makeFirstPipe();
  state.gameIsRunning = true;
}

function drawBird() {
  document.getElementById("bird").style.bottom = state.altitude;
  document.getElementById(
    "bird_img"
  ).style.transform = `rotate(${getRotate()}deg)`;
}

function drawScore() {
  var scoreDiv = document.getElementById("score");
  scoreDiv.innerText = state.score.toFixed(2);
}

function drawPipes() {
  var allPipesDiv = document.getElementById("all_pipes");
  allPipesDiv.replaceChildren();
  for (var pipe of state.pipes) {
    drawPipe(pipe);
  }
}

function draw() {
  drawBird();
  drawScore();
  drawPipes();
}

function endGame() {
  state.gameIsRunning = false;
}

function updatePipes() {
  for (var pipe of state.pipes) {
    pipe.x -= visualConfig.tick * config.pipeSpeed;
  }
}

// dont override

function getRotate() {
  return (
    (-visualConfig.maxRotateDeg *
      Math.atan(state.speed / visualConfig.rotateThreshold)) /
    (Math.PI / 2)
  );
}

function makeFirstPipe() {
  makePipe(
    document.body.offsetWidth * (1 - visualConfig.worldTranslatePercent / 100) -
      0.5 * visualConfig.pipeWidthPx
  );
}

function makePipe(x) {
  state.pipes.push({
    x,
    y:
      document.body.offsetHeight * randomBetween(...config.pipeHeightYVariance),
  });
}

function isHittingAPipe() {
  var birdBox = document.getElementById("bird").getBoundingClientRect();
  var pipeBoxes = document.getElementsByClassName("pipe_box");
  for (var pipeBox of pipeBoxes) {
    var pipeBoxRect = pipeBox.getBoundingClientRect();
    if (
      birdBox.left <= pipeBoxRect.right &&
      pipeBoxRect.left <= birdBox.right &&
      birdBox.top <= pipeBoxRect.bottom &&
      pipeBoxRect.top <= birdBox.bottom
    ) {
      return true;
    }
  }
  return false;
}

function drawPipe(pipe) {
  var allPipesDiv = document.getElementById("all_pipes");
  var pipesDiv = document.createElement("div");
  pipesDiv.className = "pipes_pair";
  Object.assign(pipesDiv.style, {
    left: pipe.x,
    position: "absolute",
    height: "100%",
    width: visualConfig.pipeWidthPx,
  });
  allPipesDiv.appendChild(pipesDiv);

  var bottomPipeWrapper = document.createElement("div");
  bottomPipeWrapper.className = "bottom_pipe_wrapper";
  Object.assign(bottomPipeWrapper.style, {
    position: "absolute",
    width: "100%",
    height: "100%",
  });
  pipesDiv.appendChild(bottomPipeWrapper);

  var bottomPipe = document.createElement("img");
  bottomPipe.className = "bottom_pipe";
  bottomPipe.src = "./assets/pipe.png";
  Object.assign(bottomPipe.style, {
    width: "100%",
    position: "absolute",
    bottom: pipe.y,
    transform: "translateY(100%)",
  });
  bottomPipeWrapper.appendChild(bottomPipe);

  var bottomPipeFlipped = document.createElement("img");
  bottomPipeFlipped.className = "bottom_pipe_flipped";
  bottomPipeFlipped.src = "./assets/pipe.png";
  Object.assign(bottomPipeFlipped.style, {
    width: "100%",
    position: "absolute",
    bottom: pipe.y,
    transform: "translateY(100%) scaleY(-1)",
    zIndex: -1,
    height: "100%",
  });
  bottomPipeWrapper.appendChild(bottomPipeFlipped);

  var bottomPipeBox = document.createElement("div");
  bottomPipeBox.className = "pipe_box";
  Object.assign(bottomPipeBox.style, {
    position: "absolute",
    width: visualConfig.pipeBoxWidth || 29,
    left: visualConfig.pipeBoxLeft || 85,
    height: "100%",
    bottom: pipe.y,
    transform: "translateY(100%) translateY(2px)",
  });
  bottomPipeWrapper.appendChild(bottomPipeBox);

  var topPipeWrapper = document.createElement("div");
  topPipeWrapper.className = "top_pipe_wrapper";
  Object.assign(topPipeWrapper.style, {
    position: "absolute",
    width: "100%",
    height: "100%",
  });
  pipesDiv.appendChild(topPipeWrapper);

  var topPipe = document.createElement("img");
  topPipe.className = "top_pipe";
  topPipe.src = "./assets/pipe.png";
  Object.assign(topPipe.style, {
    width: "100%",
    position: "absolute",
    bottom: pipe.y + config.pipeVerticalGapPx,
    transform: "scaleX(-1) scaleY(-1)",
  });
  topPipeWrapper.appendChild(topPipe);

  var topPipeFlipped = document.createElement("img");
  topPipeFlipped.className = "top_pipe_flipped";
  topPipeFlipped.src = "./assets/pipe.png";
  Object.assign(topPipeFlipped.style, {
    width: "100%",
    position: "absolute",
    bottom: pipe.y + config.pipeVerticalGapPx,
    transform: "scaleX(-1)",
    zIndex: -1,
    height: "100%",
  });
  topPipeWrapper.appendChild(topPipeFlipped);

  var topPipeBox = document.createElement("div");
  topPipeBox.className = "pipe_box";
  Object.assign(topPipeBox.style, {
    position: "absolute",
    width: visualConfig.pipeBoxWidth,
    left: visualConfig.pipeBoxLeft,
    height: "100%",
    bottom: pipe.y + config.pipeVerticalGapPx,
    transform: "translateY(-2px)",
  });
  topPipeWrapper.appendChild(topPipeBox);
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

  var worldDiv = document.createElement("div");
  worldDiv.id = "world";
  Object.assign(worldDiv.style, {
    position: "absolute",
    height: "100%",
    width: "100%",
    transform: `translate(${visualConfig.worldTranslatePercent}%)`,
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
    width: config.birdSize,
    height: config.birdSize,
  });
  worldDiv.appendChild(birdDiv);

  var birdWrapper = document.createElement("div");
  Object.assign(birdWrapper.style, {
    position: "absolute",
    bottom: -0.16 * config.birdSize,
    top: -0.25 * config.birdSize,
    right: -0.25 * config.birdSize,
    left: -0.25 * config.birdSize,
  });
  birdDiv.appendChild(birdWrapper);

  var birdImg = document.createElement("img");
  birdImg.id = "bird_img";
  birdImg.src = "./assets/bird.png";
  Object.assign(birdImg.style, {
    position: "absolute",
    height: "100%",
    width: "100%",
  });
  birdWrapper.appendChild(birdImg);

  var scoreDiv = document.createElement("div");
  scoreDiv.id = "score";
  Object.assign(scoreDiv.style, {
    position: "absolute",
    fontSize: "xxx-large",
    margin: 10,
    padding: 10,
    background: "rgba(255, 255, 255, 0.8)",
    border: "2px solid black",
    borderRadius: "10px",
    zIndex: 1,
  });
  gameDiv.appendChild(scoreDiv);

  var controlsDiv = document.createElement("div");
  controlsDiv.id = "controls";
  controlsDiv.innerText = "space to flap\nclick to restart";
  Object.assign(controlsDiv.style, {
    position: "absolute",
    fontSize: "xxx-large",
    bottom: 0,
    right: 0,
    margin: 10,
    padding: 10,
    background: "rgba(255, 255, 255, 0.8)",
    border: "2px solid black",
    borderRadius: "10px",
    zIndex: 1,
  });
  gameDiv.appendChild(controlsDiv);
}

function flap() {
  state.speed = config.power;
}

function updateBird() {
  state.speed -= config.gravity * visualConfig.tick;
  state.altitude = state.altitude + state.speed * visualConfig.tick;
}

function randomBetween(low, high) {
  return low + (high - low) * Math.random();
}

function maybeMakeNewPipe() {
  var nextPipes = [];
  var maxX = 0;
  var pipeDisappearPx =
    document.body.offsetWidth *
    1.5 *
    (visualConfig.worldTranslatePercent / 100);
  for (var pipe of state.pipes) {
    maxX = Math.max(maxX, pipe.x);
    if (pipe.x > -pipeDisappearPx) {
      nextPipes.push(pipe);
    }
  }
  state.pipes = nextPipes;
  if (maxX < config.pipeReappearPx) {
    makePipe(
      config.pipeReappearPx +
        config.pipeSpacingX * randomBetween(...config.pipeSpacingXVariance)
    );
  }
}

var vars = Object.keys({
  config,
  state,
  visualConfig,
  renderElements,
  updateBird,
  ready,
  assignButtons,
  flap,
  tick,
  updatePipes,
  isHittingAPipe,
  draw,
  getRotate,
  endGame,
  startGame,
  makeFirstPipe,
  drawPipes,
  drawPipe,
  drawScore,
  drawBird,
  maybeMakeNewPipe,
});

(function () {
  function main() {
    document.addEventListener("DOMContentLoaded", () => ready());
  }

  main();
})();
