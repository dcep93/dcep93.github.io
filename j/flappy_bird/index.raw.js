var config = {
  gravity: 1200,
  power: 400,
  pipeSpeed: 0.35,
  pipeVerticalGapPx: 125,
  birdScale: 0.15,
  pipeReappearPx: 1000,
  pipeSpacingX: 800, // TODO single var
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
  tick: 5,
  worldTranslatePercent: 20,
  pipeVisualBufferXPx: 20,
  pipeWidthPx: 200,
  birdHeightPx: 267,
  birdWidthPx: 444,
  birdImgAspectRatio: 600 / 333,
  birdImgHeightPercentage: 124,
  birdImgOffsetBottomPx: 21,
  birdImgOffsetRightPx: 65,
  maxRotateDeg: 120,
  rotateThreshold: 180,
};

function ready() {
  renderElements();
  document.body.onkeydown = function (e) {
    if (e.key == " " || e.code == "Space" || e.keyCode == 32) flap();
  };
  document.body.onclick = () => startGame();
  setInterval(() => tick(), visualConfig.tick);
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
    width: visualConfig.birdWidthPx * config.birdScale,
    height: visualConfig.birdHeightPx * config.birdScale,
  });
  worldDiv.appendChild(birdDiv);

  var birdImg = document.createElement("img");
  birdImg.id = "bird_img";
  birdImg.src = "./assets/bird.png";
  Object.assign(birdImg.style, {
    position: "absolute",
    height: `${visualConfig.birdImgHeightPercentage}%`,
    aspectRatio: visualConfig.birdImgAspectRatio,
    bottom: -visualConfig.birdImgOffsetBottomPx * config.birdScale,
    right: -visualConfig.birdImgOffsetRightPx * config.birdScale,
  });
  birdDiv.appendChild(birdImg);

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

  draw();
}

function flap() {
  if (!state.gameIsRunning) {
    return;
  }
  state.speed = config.power;
}

function tick() {
  if (!state.gameIsRunning) {
    return;
  }
  state.score += visualConfig.tick / 100;
  state.speed -= (config.gravity * visualConfig.tick) / 1000;
  state.altitude = state.altitude + (state.speed * visualConfig.tick) / 1000;
  updatePipes();
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

function randomBetween(low, high) {
  return low + (high - low) * Math.random();
}

function updatePipes() {
  var nextPipes = [];
  var maxX = 0;
  var pipeDisappearPx =
    (1.5 * document.body.offsetWidth * visualConfig.worldTranslatePercent) /
    100;
  for (var pipe of state.pipes) {
    pipe.x -= visualConfig.tick * config.pipeSpeed;
    maxX = Math.max(maxX, pipe.x);
    if (pipe.x > -pipeDisappearPx) {
      nextPipes.push(pipe);
    }
  }
  state.pipes = nextPipes;
  if (maxX < config.pipeReappearPx) {
    var x =
      config.pipeReappearPx +
      config.pipeSpacingX * randomBetween(...config.pipeSpacingXVariance);
    var y =
      document.body.offsetHeight * randomBetween(...config.pipeHeightYVariance);
    state.pipes.push({
      x,
      y,
    });
  }
}

function isHittingAPipe() {
  for (var pipe of state.pipes) {
    if (pipe.x < 0 && -pipe.x < visualConfig.birdWidthPx * config.birdScale) {
      if (state.altitude < pipe.y) {
        return true;
      }
      if (
        state.altitude + visualConfig.birdHeightPx * config.birdScale >
        pipe.y + config.pipeVerticalGapPx
      ) {
        return true;
      }
    }
  }
  return false;
}

function startGame() {
  state.gameIsRunning = true;
  state.score = 0;
  state.altitude = 0;
  state.speed = config.power;
  state.pipes = [
    {
      x:
        document.body.offsetWidth *
        (1 - visualConfig.worldTranslatePercent / 100),
      y:
        document.body.offsetHeight *
        randomBetween(...config.pipeHeightYVariance),
    },
  ];
}

function draw() {
  // TODO percentages
  var birdDiv = document.getElementById("bird");
  birdDiv.style.bottom = state.altitude;
  birdDiv.style.transform = `rotate(${getRotate()}deg)`;

  var scoreDiv = document.getElementById("score");
  scoreDiv.innerText = state.score.toFixed(2);

  var allPipesDiv = document.getElementById("all_pipes");
  allPipesDiv.replaceChildren();
  for (var pipe of state.pipes) {
    var pipesDiv = document.createElement("div");
    pipesDiv.className = "pipes";
    Object.assign(pipesDiv.style, {
      left: pipe.x - visualConfig.pipeVisualBufferXPx,
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
  }
}

function endGame() {
  state.gameIsRunning = false;
}

function getRotate() {
  return (
    (-visualConfig.maxRotateDeg *
      Math.atan(state.speed / visualConfig.rotateThreshold)) /
    (Math.PI / 2)
  );
}

var functions = Object.keys({
  config,
  state,
  visualConfig,
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
