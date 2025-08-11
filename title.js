document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  const bgOverlay = document.getElementById("background-overlay"); // 背景白くするdiv
  const bgm = document.getElementById("bgm"); // <audio>タグで用意

  let currentIndex = 0;
  let started = false;

  // フェードイン関数
  function fadeIn(element, duration = 1000) {
    element.style.display = "block";
    element.style.opacity = 0;
    let start = null;
    return new Promise(resolve => {
      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.opacity = progress;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  // フェードアウト関数
  function fadeOut(element, duration = 1000) {
    element.style.opacity = 1;
    let start = null;
    return new Promise(resolve => {
      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.opacity = 1 - progress;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.style.display = "none";
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  // ロゴを順番に表示
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      // すべて表示終わったらBGM再生
      if (bgm) {
        bgm.loop = true;
        bgm.play();
      }
      return;
    }

    // 2枚目以降は背景を白＋暗めに
    if (currentIndex >= 1 && bgOverlay) {
      bgOverlay.style.backgroundColor = "rgba(255,255,255,0.8)";
    } else if (bgOverlay) {
      bgOverlay.style.backgroundColor = "transparent";
    }

    const logo = logos[currentIndex];
    await fadeIn(logo, 1000);
    await new Promise(r => setTimeout(r, 2000)); // 2秒表示キープ
    await fadeOut(logo, 1000);

    currentIndex++;
    showNextLogo();
  }

  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(() => {
      showNextLogo();
    });
  });

  // 初期はロゴ非表示
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = 0;
  });
});
