var vars = {
  gravity: 400,
  flapStrength: 300,
  tickTime: 10,
  velocity: 0,
  interval: undefined,
};

function ready() {
  document.body.onkeydown = function (e) {
    if (e.key == " " || e.code == "Space" || e.keyCode == 32) flap();
  };
  document.body.onclick = () => flap();
  vars.interval = setInterval(() => tick(), vars.tickTime);
}

function flap() {
  console.log("flap");
}

function tick() {
  console.log("tick");
}

var functions = Object.keys({ vars, ready, flap, tick });

////

(function () {
  function main() {
    document.addEventListener("DOMContentLoaded", ready);
  }

  main();
})();
