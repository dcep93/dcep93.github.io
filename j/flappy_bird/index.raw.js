(function () {
  var vars = {
    gravity: 400,
    flapStrength: 300,
    tickTime: 10,
    velocity: 0,
    interval: undefined,
  };

  function ready() {
    document.body.onkeydown = function (e) {
      if (e.key == " " || e.code == "Space" || e.keyCode == 32) window.flap();
    };
    document.body.onclick = () => window.flap();
    vars.interval = setInterval(() => window.tick(), window.vars.tickTime);
  }

  function flap() {}

  function tick() {
    console.log("tick1");
  }

  var _export = { vars, tick, flap };

  ////

  function main() {
    document.addEventListener("DOMContentLoaded", ready);
  }

  _export.functions = Object.keys(_export);

  Object.assign(window, _export);

  main();
})();
