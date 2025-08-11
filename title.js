document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  const backgroundOverlay = document.getElementById("background-overlay");
  const bgm = document.getElementById("bgm");

  const titleImg1 = document.getElementById("title-img1");
  const titleImg2 = document.getElementById("title-img2");
  const pressKeyText = document.getElementById("press-key-text");

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

  // 背景画像フェードイン＋ぼかし・拡大解除演出
  async function fadeInBackgroundImage() {
    backgroundOverlay.style.backgroundImage = "url('images/press_bg.png')";
    backgroundOverlay.style.backgroundSize = "cover";
    backgroundOverlay.style.backgroundPosition = "center center";
    backgroundOverlay.style.backgroundRepeat = "no-repeat";

    backgroundOverlay.style.transition = "none";
    backgroundOverlay.style.opacity = 0;
    backgroundOverlay.style.filter = "blur(5px)";
    backgroundOverlay.style.transform = "scale(1.2)";
    backgroundOverlay.style.display = "block";

    await new Promise(requestAnimationFrame);
    backgroundOverlay.style.transition = "opacity 2s ease, filter 2s ease, transform 2s ease";
    backgroundOverlay.style.opacity = 1;
    backgroundOverlay.style.filter = "blur(0)";
    backgroundOverlay.style.transform = "scale(1)";

    // BGMループ再生をここで早めに開始
    bgm.loop = true;
    bgm.play();

    await new Promise(resolve => setTimeout(resolve, 2100));
  }

  // タイトル画像表示シーケンス
  async function showTitleImages() {
    // 1枚目タイトル表示（中央・光る演出）
    titleImg1.style.display = "block";
    titleImg1.style.opacity = 0;
    titleImg1.style.filter = "drop-shadow(0 0 20px white)"; // 光らせる
    await fadeIn(titleImg1, 1000);
    await new Promise(r => setTimeout(r, 3000));
    await fadeOut(titleImg1, 1000);
    titleImg1.style.filter = "none";

    // 2枚目タイトル表示（中央より少し上）
    titleImg2.style.display = "block";
    titleImg2.style.opacity = 0;
    titleImg2.style.transform = "translate(-50%, -60%)"; // 少し上に移動
    await fadeIn(titleImg2, 1000);

    // ★ タイトル2が出たタイミングでPress any keyテキスト表示
    pressKeyText.style.display = "block";
    pressKeyText.style.opacity = "1";

    // 「Press any key」からの入力待ちをセット
    waitForPressKey();
  }

  // 「Press any key」待ちイベント設定
  function waitForPressKey() {
    function onInput() {
      // イベント解除
      window.removeEventListener("keydown", onInput);
      window.removeEventListener("touchstart", onInput);

      // 背景フェード切り替え演出など
      fadeInBackgroundOverlayThenMenu();
    }
    // PCキーボード
    window.addEventListener("keydown", onInput);
    // スマホタップ
    window.addEventListener("touchstart", onInput);
  }

  // 背景フェード→メインメニュー表示（ここにゲームのメインメニュー処理などを追加可能）
  async function fadeInBackgroundOverlayThenMenu() {
    // Press any keyテキストをフェードアウト
    await fadeOut(pressKeyText, 800);

    // 背景のフェードイン・アウト演出
    backgroundOverlay.style.transition = "none";
    backgroundOverlay.style.backgroundColor = "black";
    backgroundOverlay.style.opacity = 0;
    backgroundOverlay.style.display = "block";

    await new Promise(requestAnimationFrame);

    backgroundOverlay.style.transition = "opacity 1.5s ease";
    backgroundOverlay.style.opacity = 1;

    await new Promise(resolve => setTimeout(resolve, 1500));

    backgroundOverlay.style.transition = "opacity 1.5s ease";
    backgroundOverlay.style.opacity = 0;

    await new Promise(resolve => setTimeout(resolve, 1500));

    backgroundOverlay.style.display = "none";

    // ここでメインメニューのUI表示や処理を開始できます
    console.log("メインメニューを表示する処理をここに実装してください");
  }

  // 企業ロゴを順に表示
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      // 3枚すべて表示終わったあと背景画像フェードイン＋BGM再生
      await fadeInBackgroundImage();

      // そのあとタイトル画像表示
      await showTitleImages();

      return;
    }

    if (currentIndex > 0) {
      backgroundOverlay.style.transition = "none";
      backgroundOverlay.style.backgroundImage = "";
      backgroundOverlay.style.backgroundColor = "rgba(255,255,255,0.8)";
      backgroundOverlay.style.opacity = 1;
      setTimeout(() => {
        backgroundOverlay.style.transition = "opacity 1s ease";
      }, 10);
    } else {
      backgroundOverlay.style.backgroundColor = "transparent";
      backgroundOverlay.style.opacity = 1;
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

  // 初期状態非表示
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = 0;
  });
  titleImg1.style.display = "none";
  titleImg2.style.display = "none";
  pressKeyText.style.display = "none";
});
