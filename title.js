document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  const backgroundOverlay = document.getElementById("background-overlay");
  const bgm = document.getElementById("bgm");

  const titleImg1 = document.getElementById("title-img1");
  const titleImg2 = document.getElementById("title-img2");
  const pressKeyText = document.getElementById("press-any-key");

  let currentIndex = 0;
  let started = false;

  pressKeyText.style.display = "none";
  pressKeyText.style.opacity = "0";

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

  // 「Press any key」押したらPress any keyだけ消して、タイトル2は残し背景スクロール開始
  function waitForPressKey() {
    function onInput() {
      fadeOut(pressKeyText, 800).then(() => {
        backgroundOverlay.style.display = "none";
        startBackgroundScroll();
        console.log("メインメニュー開始");
      });
    }
    window.addEventListener("keydown", onInput, { once: true, capture: true });
    window.addEventListener("touchstart", onInput, { once: true, capture: true });
  }

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
    for (let i = 0; i < bgElements.length; i++) {
      const div = bgElements[i];
      let currentX = parseFloat(div.style.left);

      // 右方向へスクロール
      let newX = currentX + scrollSpeed;
      div.style.left = `${newX}px`;
    }

    // 左端にあるdiv（画面左側、一番左の画像）
    const leftmostDiv = bgElements[0];
    const leftmostX = parseFloat(leftmostDiv.style.left);

    // 画像が完全に画面右端を超えたら削除
    if (leftmostX >= containerWidth) {
      const removed = bgElements.shift();
      if (removed && removed.parentNode) {
        removed.parentNode.removeChild(removed);
      }
    }

    // 右端にあるdiv（一番右の画像）
    const rightmostDiv = bgElements[bgElements.length - 1];
    const rightmostX = parseFloat(rightmostDiv.style.left);

    // 右端の画像の右端が画面の右端を超えたら左側に新しい画像を追加
    if (rightmostX + bgImageWidth <= containerWidth) {
      const newDiv = createBgDiv(rightmostX - bgImageWidth);
      scrollWrapper.appendChild(newDiv);
      bgElements.push(newDiv);
    }

    requestAnimationFrame(animateScrollingBackground);
  }

  function startBackgroundScroll() {
    backgroundOverlay.style.display = "none";
    document.body.appendChild(scrollWrapper);

    bgElements.push(createBgDiv(0));
    bgElements.push(createBgDiv(-bgImageWidth));
    bgElements.forEach(div => scrollWrapper.appendChild(div));

    animateScrollingBackground();
  }

  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = "0";
  });
  titleImg1.style.display = "none";
  titleImg2.style.display = "none";
  pressKeyText.style.display = "none";
  pressKeyText.style.opacity = "0";

  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(() => {
      showNextLogo();
    });
  });
});
