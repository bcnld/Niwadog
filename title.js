document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  let currentIndex = 0;
  let started = false;

  // BGM準備（フォルダ変更）
  const bgm = new Audio("Sounds/title.mp3");
  bgm.loop = false; // 必要なら true
  bgm.volume = 1.0;

  // 初期状態で非表示
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = 0;
  });

  function fadeIn(element, duration = 1000) {
    element.style.opacity = 0;
    element.style.display = "block";
    let start = null;
    return new Promise(resolve => {
      function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        let progress = Math.min(elapsed / duration, 1);
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
        const elapsed = timestamp - start;
        let progress = Math.min(elapsed / duration, 1);
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

  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      console.log("すべてのロゴ表示完了");
      bgm.play().catch(err => console.warn("BGM再生エラー:", err));
      return;
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
