document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  const backgroundOverlay = document.getElementById("background-overlay");
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

  // 会社ロゴを順番に表示
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      // 背景画像をフェードで切り替え
      // フェードアウト
      backgroundOverlay.style.transition = "opacity 1s ease";
      backgroundOverlay.style.opacity = 0;
      await new Promise(r => setTimeout(r, 1000));
      // 背景画像変更
      backgroundOverlay.style.backgroundImage = "url('images/press_bg.png')";
      backgroundOverlay.style.backgroundSize = "cover";
      backgroundOverlay.style.backgroundPosition = "center center";
      // フェードイン
      backgroundOverlay.style.opacity = 1;
      return;
    }

    const logo = logos[currentIndex];
    await fadeIn(logo, 1000);
    await new Promise(r => setTimeout(r, 2000)); // 2秒表示キープ
    await fadeOut(logo, 1000);

    currentIndex++;
    showNextLogo();
  }

  // 最初のクリックテキスト処理開始
  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(() => {
      showNextLogo();
    });
  });

  // ページ読み込み時に会社ロゴは全部非表示に設定
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = 0;
  });

  // 背景オーバーレイ初期設定
  backgroundOverlay.style.backgroundColor = "transparent";
  backgroundOverlay.style.opacity = 1;
  backgroundOverlay.style.backgroundImage = "";
});
