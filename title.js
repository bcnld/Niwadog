document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  let currentIndex = 0;
  let started = false; // クリックスタート済みフラグ

  // 初期状態でロゴは非表示、透明度0にセット
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = 0;
  });

  // ロゴフェードイン・アウト関数
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

  // ロゴを順番に表示
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      console.log("すべてのロゴ表示完了");
      return;
    }
    const logo = logos[currentIndex];
    await fadeIn(logo, 1000);
    await new Promise(r => setTimeout(r, 2000)); // 2秒表示キープ
    await fadeOut(logo, 1000);
    currentIndex++;
    showNextLogo();
  }

  // テキストクリックイベント
  centerText.addEventListener("click", () => {
    if (started) return; // 多重クリック防止
    started = true;
    // テキストをフェードアウトしてから非表示
    fadeOut(centerText, 500).then(() => {
      showNextLogo();
    });
  });
});
