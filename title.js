document.addEventListener("DOMContentLoaded", () => {
  const logos = document.querySelectorAll(".company-logo");
  const pressAnyKey = document.getElementById("press-any-key");
  const background = document.getElementById("background");
  const bgm = document.getElementById("bgm");

  // 全ロゴ非表示スタート
  logos.forEach(logo => {
    logo.style.opacity = 0;
    logo.style.display = "none";
  });

  let index = 0;

  function showNextLogo() {
    if (index >= logos.length) {
      // 3つ全部終わったら背景ぼかし外して拡大縮小リセット
      background.style.filter = "blur(0px)";
      background.style.transform = "scale(1)";

      // BGM再生（必要なら）
      if (bgm) bgm.play();

      // Press Any Key 表示開始
      setTimeout(() => {
        pressAnyKey.style.opacity = 1;
        blinkPressText();
      }, 1500);
      return;
    }

    const logo = logos[index];
    logo.style.display = "block";

    fadeIn(logo, 1000, () => {
      setTimeout(() => {
        fadeOut(logo, 1000, () => {
          logo.style.display = "none";
          index++;
          setTimeout(showNextLogo, 500);
        });
      }, 2000);
    });
  }

  function fadeIn(element, duration, callback) {
    element.style.opacity = 0;
    let opacity = 0;
    element.style.display = "block";
    const interval = 50;
    const increment = interval / duration;

    function step() {
      opacity += increment;
      if (opacity >= 1) {
        opacity = 1;
        element.style.opacity = opacity;
        if (callback) callback();
      } else {
        element.style.opacity = opacity;
        setTimeout(step, interval);
      }
    }
    step();
  }

  function fadeOut(element, duration, callback) {
    let opacity = 1;
    const interval = 50;
    const decrement = interval / duration;

    function step() {
      opacity -= decrement;
      if (opacity <= 0) {
        opacity = 0;
        element.style.opacity = opacity;
        if (callback) callback();
      } else {
        element.style.opacity = opacity;
        setTimeout(step, interval);
      }
    }
    step();
  }

  function blinkPressText() {
    setInterval(() => {
      pressAnyKey.style.opacity = pressAnyKey.style.opacity == 1 ? 0 : 1;
    }, 800);
  }

  showNextLogo();
});
