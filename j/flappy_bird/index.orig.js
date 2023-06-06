var vars = {
  gravity: 1200,
  power: 400,
  tick: 10,
  pipeSpeed: 0.35,
  pipeGapPx: 125,
  birdScale: 0.15,

  running: false,
  speed: 0,
  altitude: 0,
  score: 0,
  pipes: [],

  worldTranslatePercent: 20,
  pipeBufferXPx: 25,
  pipeWidthPx: 200,
  pipeReappearPx: 1000,
  pipeSpacingX: 800,
  pipeSpacingXVariance: [0.7, 0.9],
  pipeHeightYVariance: [0.2, 0.7],
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

  var worldDiv = document.createElement("div");
  worldDiv.id = "world";
  Object.assign(worldDiv.style, {
    position: "absolute",
    height: "100%",
    width: "100%",
    transform: `translate(${vars.worldTranslatePercent}%)`,
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
  if (!vars.gameIsRunning) {
    startGame();
  }
  vars.speed = vars.power;
}

function tick() {
  if (!vars.gameIsRunning) {
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
  var pipeDisappearPx =
    (1.5 * document.body.offsetWidth * vars.worldTranslatePercent) / 100;
  for (var pipe of vars.pipes) {
    pipe.lastX = pipe.x;
    pipe.x -= vars.tick * vars.pipeSpeed;
    maxX = Math.max(maxX, pipe.x);
    if (pipe.x > -pipeDisappearPx) {
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
        pipe.y + vars.pipeVerticalGapPx
      ) {
        return true;
      }
    }
  }
  return false;
}

function startGame() {
  vars.gameIsRunning = true;
  vars.score = 0;
  vars.altitude = 0;
  vars.pipes = [
    {
      x: document.body.offsetWidth * (1 - vars.worldTranslatePercent / 100),
      y:
        document.body.offsetHeight * randomBetween(...vars.pipeHeightYVariance),
    },
  ];
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
      left: pipe.x - vars.pipeVisualBufferXPx,
      position: "absolute",
      height: "100%",
      width: vars.pipeWidthPx,
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
      bottom: pipe.y + vars.pipeVerticalGapPx,
      transform: "scaleX(-1) scaleY(-1)",
    });
    topPipeWrapper.appendChild(topPipe);
    var topPipeFlipped = document.createElement("img");
    topPipeFlipped.className = "top_pipe_flipped";
    topPipeFlipped.src = "./assets/pipe.png";
    Object.assign(topPipeFlipped.style, {
      width: "100%",
      position: "absolute",
      bottom: pipe.y + vars.pipeVerticalGapPx,
      transform: "scaleX(-1)",
      zIndex: -1,
      height: "100%",
    });
    topPipeWrapper.appendChild(topPipeFlipped);
  }
}

function endGame() {
  vars.gameIsRunning = false;
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
