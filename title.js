document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  const backgroundOverlay = document.getElementById("background-overlay");
  const bgm = document.getElementById("bgm");
  const sfx = document.getElementById("sfx");

  const titleImg1 = document.getElementById("title-img1");
  const titleImg2 = document.getElementById("title-img2");
  const pressKeyText = document.getElementById("press-any-key");

  const transitionImg = document.getElementById("transition-img");
  const mainMenu = document.getElementById("main-menu");

  let currentIndex = 0;
  let started = false;

  // フェードイン
  function fadeIn(element, duration = 1000) {
    element.style.display = "block";
    element.style.opacity = 0;
    let start = null;
    return new Promise(resolve => {
      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.opacity = progress;
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  // フェードアウト
  function fadeOut(element, duration = 1000) {
    element.style.opacity = 1;
    let start = null;
    return new Promise(resolve => {
      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.opacity = 1 - progress;
        if (progress < 1) requestAnimationFrame(step);
        else {
          element.style.display = "none";
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  // 背景フェードイン
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

    bgm.loop = true;
    bgm.play();

    await new Promise(resolve => setTimeout(resolve, 2100));
  }

  // タイトル画像
  async function showTitleImages() {
    titleImg1.style.display = "block";
    titleImg1.style.opacity = 0;
    titleImg1.style.filter = "drop-shadow(0 0 20px white)";
    await fadeIn(titleImg1, 1000);
    await new Promise(r => setTimeout(r, 3000));
    await fadeOut(titleImg1, 1000);
    titleImg1.style.filter = "none";

    titleImg2.style.display = "block";
    titleImg2.style.opacity = 0;
    titleImg2.style.transform = "translate(-50%, -60%) scale(1.5)";
    titleImg2.style.transition = "transform 1s ease";
    await fadeIn(titleImg2, 1000);

    pressKeyText.style.display = "block";
    requestAnimationFrame(() => {
      pressKeyText.style.opacity = "1";
    });

    waitForPressKey();
  }

  // Press any key 待機
  function waitForPressKey() {
    function onInput() {
      fadeOut(titleImg2, 800).then(() => {
        fadeOut(pressKeyText, 500).then(() => {
          fadeInBackgroundImage().then(() => {
            startBackgroundScroll();
            if (mainMenu) {
              mainMenu.style.display = "block";
              mainMenu.style.opacity = "1";
            }
          });
        });
      });
      window.removeEventListener("keydown", onInput, true);
      window.removeEventListener("touchstart", onInput, true);
    }
    window.addEventListener("keydown", onInput, { capture: true });
    window.addEventListener("touchstart", onInput, { capture: true });
  }

  // 企業ロゴ表示
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      await fadeInBackgroundImage();
      await showTitleImages();
      return;
    }

    // 3枚目（インデックス2）の後
    if (currentIndex === 2) {
      if (sfx) sfx.play();
      if (transitionImg) {
        transitionImg.style.display = "block";
        transitionImg.style.opacity = "1";
        setTimeout(() => {
          fadeOut(transitionImg, 2000);
        }, 1000);
      }
    }

    const logo = logos[currentIndex];
    await fadeIn(logo, 1000);
    await new Promise(r => setTimeout(r, 2000));
    await fadeOut(logo, 1000);

    currentIndex++;
    showNextLogo();
  }

  // ===== スクロール背景（右方向に見えるように調整） =====
  const scrollSpeed = 1;
  const containerHeight = window.innerHeight;
  const containerWidth = window.innerWidth;
  const bgImageWidth = 3600;
  const bgImageHeight = containerHeight;

  const scrollWrapper = document.createElement("div");
  scrollWrapper.id = "scroll-wrapper";
  scrollWrapper.style.position = "fixed";
  scrollWrapper.style.top = "0";
  scrollWrapper.style.left = "0";
  scrollWrapper.style.width = `${containerWidth}px`;
  scrollWrapper.style.height = `${containerHeight}px`;
  scrollWrapper.style.overflow = "hidden";
  scrollWrapper.style.zIndex = "1";
  scrollWrapper.style.pointerEvents = "none";

  let bgElements = [];

  function createBgDiv(x) {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.left = `${x}px`;
    div.style.width = `${bgImageWidth}px`;
    div.style.height = `${bgImageHeight}px`;
    div.style.backgroundImage = "url('images/menu.png')";
    div.style.backgroundSize = "cover";
    div.style.backgroundRepeat = "no-repeat";
    div.style.backgroundPosition = "center center";
    return div;
  }

  function animateScrollingBackground() {
    // 背景を左に流す（見た目は右に進んでいるように見える）
    for (let i = 0; i < bgElements.length; i++) {
      const div = bgElements[i];
      let currentX = parseFloat(div.style.left);
      let newX = currentX - scrollSpeed;
      div.style.left = `${newX}px`;
    }

    // 左端が画面外に出たら削除
    if (parseFloat(bgElements[0].style.left) + bgImageWidth < 0) {
      const removed = bgElements.shift();
      removed?.parentNode?.removeChild(removed);
    }

    // 右端が画面に入ったら右に新しい背景を追加
    const rightmostDiv = bgElements[bgElements.length - 1];
    if (parseFloat(rightmostDiv.style.left) + bgImageWidth <= containerWidth) {
      const newDiv = createBgDiv(parseFloat(rightmostDiv.style.left) + bgImageWidth);
      scrollWrapper.appendChild(newDiv);
      bgElements.push(newDiv);
    }

    requestAnimationFrame(animateScrollingBackground);
  }

  function startBackgroundScroll() {
    backgroundOverlay.style.display = "none";
    document.body.appendChild(scrollWrapper);
    bgElements.push(createBgDiv(0));
    bgElements.push(createBgDiv(bgImageWidth));
    bgElements.forEach(div => scrollWrapper.appendChild(div));
    animateScrollingBackground();
  }

  // 初期非表示設定
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = "0";
  });
  [titleImg1, titleImg2, pressKeyText, mainMenu, transitionImg].forEach(el => {
    if (el) {
      el.style.display = "none";
      el.style.opacity = "0";
    }
  });

  // 中央クリックで開始
  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(() => {
      showNextLogo();
    });
  });
});
