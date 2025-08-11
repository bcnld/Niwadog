document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  const bgOverlay = document.getElementById("background-overlay");
  const bgm = document.getElementById("bgm");
  let currentIndex = 0;
  let started = false;

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

  // 背景のぼかしと拡大をスムーズに解除する関数
  function clearBackgroundEffects(duration = 3000) {
    return new Promise(resolve => {
      let start = null;
      const initialBlur = 8; // px
      const initialScale = 1.2;
      function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        // 線形補間でfilterとtransformを減らす
        const blur = initialBlur * (1 - progress);
        const scale = initialScale - (initialScale - 1) * progress;
        bgOverlay.style.filter = `blur(${blur}px)`;
        bgOverlay.style.transform = `scale(${scale})`;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // 最終的にフィルターなし、scale(1)
          bgOverlay.style.filter = 'blur(0)';
          bgOverlay.style.transform = 'scale(1)';
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      // ロゴ全表示終了後、BGM再生
      bgm.play();
      return;
    }

    // 2枚目以降は背景を白＋暗めに（フェードイン風に切り替え）
    if (currentIndex === 1) {
      // フェードインで背景色を変える処理（背景オーバーレイの透明度を上げる）
      await fadeIn(bgOverlay, 1000);
      bgOverlay.style.backgroundColor = "rgba(255,255,255,0.8)";
      // 背景効果（ぼかし・拡大）解除を開始
      await clearBackgroundEffects(3000);
    }

    const logo = logos[currentIndex];
    await fadeIn(logo, 1000);
    await new Promise(r => setTimeout(r, 2000));
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
});
