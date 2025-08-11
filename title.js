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
    // フェードインさせるため次フレームでopacityを1に
    requestAnimationFrame(() => {
      pressKeyText.style.opacity = "1";
    });

    // 「Press any key」からの入力待ちをセット
    waitForPressKey();
  }

  // 「Press any key」待ちイベント設定
  function waitForPressKey() {
    function onInput() {
      window.removeEventListener("keydown", onInput);
      window.removeEventListener("touchstart", onInput);

      // Press any key フェードアウト＋タイトル2・背景オーバーレイもフェードアウト後にスクロール背景開始
      fadeOut(pressKeyText, 800).then(() => {
        fadeOut(titleImg2, 800);
        fadeOut(backgroundOverlay, 800).then(() => {
          startBackgroundScroll();
          console.log("メインメニュー開始");
        });
      });
    }
    window.addEventListener("keydown", onInput);
    window.addEventListener("touchstart", onInput);
  }

  // 企業ロゴを順に表示
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      await fadeInBackgroundImage();
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

  // スクロール背景用変数・関数
  let bgPosX = 0;
  const scrollSpeed = 1;
  let scrollingBg = null;

  function animateScrollingBackground() {
    bgPosX -= scrollSpeed;
    if (bgPosX <= -window.innerWidth) {
      bgPosX = 0;
    }
    if (scrollingBg) {
      scrollingBg.style.backgroundPosition = `${bgPosX}px 0, ${bgPosX + window.innerWidth}px 0`;
      requestAnimationFrame(animateScrollingBackground);
    }
  }

  function startBackgroundScroll() {
    backgroundOverlay.style.display = "none";

    scrollingBg = document.createElement("div");
    scrollingBg.id = "scrolling-background";
    scrollingBg.style.position = "fixed";
    scrollingBg.style.top = "0";
    scrollingBg.style.left = "0";
    scrollingBg.style.width = "200vw";
    scrollingBg.style.height = "100vh";
    scrollingBg.style.backgroundImage = "url('images/menu.png'), url('images/menu.png')";
    scrollingBg.style.backgroundRepeat
