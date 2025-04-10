var css;

function main() {
  init();
  document.addEventListener("DOMContentLoaded", ready);
}

function init() {
  document.write(`<base href="https://learnedleague.com/" />`);
  css = document.createElement("style");
  css.appendChild(document.createTextNode("body { display: none }"));
  document.head.appendChild(css);
}

function ready() {
  setHome();
  hideAnswers();
  document.head.removeChild(css);
}

function setHome() {
  const home = document.createElement("a");
  home.innerText = "dcep93 quizzes";
  home.href = `${document.location.href}/../../`;
  home.style.fontSize = "x-large";
  document.body.prepend(home);
}

function hideAnswers() {
  Array.from(document.getElementsByClassName("qbox")).forEach((e) => {
    const qbr = e.getElementsByClassName("qb_r")[0];
    const ans = Array.from(qbr.children).filter((_, i) => i > 0);
    const f = () =>
      ans.forEach((a) => (a.style.opacity = 1 - (a.style.opacity || 1)));
    const qba = document.createElement("div");
    qba.style.backgroundColor = "lightgrey";
    qbr.appendChild(qba);
    $(qba).hover(function () {
      $(this).css("cursor", "pointer");
    });
    qba.onclick = f;
    ans.forEach((a) => {
      qbr.removeChild(a);
      qba.appendChild(a);
    });
    const money = e.getElementsByClassName("money")[0];
    if (money) ans.push(money);
    f();
  });
}

main();
//
