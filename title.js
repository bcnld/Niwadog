document.addEventListener("DOMContentLoaded", () => {
  const logos = document.querySelectorAll(".company-logo");
  const pressAnyKey = document.getElementById("press-any-key");
  const background = document.getElementById("background");

  // 最初に全部のロゴを透明にして非表示
  logos.forEach(logo => {
    logo.style.opacity = 0;
    logo.style.display = "none";
  });

  let index = 0;

  function showNextLogo() {
    if (index >= logos.length) {
      // 全部終わったら背景のぼかし解除＆拡大縮小をリセット
      background.style.filter = "blur(0px)";
      background.style.transform = "scale(1)";

      // 少し待ってからPress Any Key表示＆点滅開始
      setTimeout(() => {
        pressAnyKey.style.opacity = 1;
        blinkPressText();
      }, 2000);
      return;
    }

    const logo = logos[index];
    logo.style.display = "block";

    // フェードイン
    fadeIn(logo, 1000, () => {
      // 2秒保持
      setTimeout(() => {
        // フェードアウト
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

  // 開始
  showNextLogo();
});
