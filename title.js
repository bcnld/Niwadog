document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  const pressBgContainer = document.getElementById("press-bg-container");
  const pressBgImage = document.getElementById("press-bg-image");
  const pressAnyKey = document.getElementById("press-any-key");
  let currentIndex = 0;
  let started = false;

  // 画像フェード用関数
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

  // 会社ロゴを順に表示
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      // ロゴ全部終わったらPress any key表示
      showPressAnyKey();
      return;
    }

    const logo = logos[currentIndex];
    await fadeIn(logo, 1000);
    await new Promise(r => setTimeout(r, 2000)); // 2秒表示キープ
    await fadeOut(logo, 1000);

    currentIndex++;
    showNextLogo();
  }

  // Press any key の背景とテキスト表示
  function showPressAnyKey() {
    pressBgContainer.style.display = "block";

    // 1フレーム遅らせてぼかし・拡大を解除（フェードイン）
    requestAnimationFrame(() => {
      pressBgImage.style.filter = "blur(0)";
      pressBgImage.style.transform = "scale(1)";
    });

    pressAnyKey.style.display = "block";

    // キー押しで非表示にして次へ
    window.addEventListener("keydown", () => {
      hidePressAnyKey();
      // ここに次の処理を追加可能
    }, { once: true });
  }

  // Press any key 非表示化
  function hidePressAnyKey() {
    pressBgImage.style.filter = "blur(5px)";
    pressBgImage.style.transform = "scale(1.2)";

    setTimeout(() => {
      pressBgContainer.style.display = "none";
      pressAnyKey.style.display = "none";
    }, 1000);
  }

  // 初回クリックテキスト処理開始
  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(() => {
      showNextLogo();
    });
  });

  // 初期状態ロゴ非表示
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = 0;
  });
});
