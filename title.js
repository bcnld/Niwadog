document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");

  // 最初はロゴ非表示
  logos.forEach(logo => {
    logo.style.opacity = 0;
    logo.style.display = "none";
  });

  centerText.addEventListener("click", () => {
    // 文字を消す
    centerText.style.display = "none";

    let index = 0;

    function showNextLogo() {
      if (index >= logos.length) {
        // すべて表示し終えたら終了
        return;
      }
      const logo = logos[index];
      logo.style.display = "block";

      // フェードイン
      fadeIn(logo, 1000, () => {
        // 2秒表示後フェードアウト
        setTimeout(() => {
          fadeOut(logo, 1000, () => {
            logo.style.display = "none";
            index++;
            showNextLogo();
          });
        }, 2000);
      });
    }

    showNextLogo();
  });

  // フェードイン関数
  function fadeIn(element, duration, callback) {
    element.style.opacity = 0;
    let opacity = 0;
    const interval = 50;
    const increment = interval / duration;

    function step() {
      opacity += increment;
      if (opacity >= 1) {
        element.style.opacity = 1;
        if (callback) callback();
      } else {
        element.style.opacity = opacity;
        setTimeout(step, interval);
      }
    }
    step();
  }

  // フェードアウト関数
  function fadeOut(element, duration, callback) {
    let opacity = 1;
    const interval = 50;
    const decrement = interval / duration;

    function step() {
      opacity -= decrement;
      if (opacity <= 0) {
        element.style.opacity = 0;
        if (callback) callback();
      } else {
        element.style.opacity = opacity;
        setTimeout(step, interval);
      }
    }
    step();
  }
});
