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
    titleImg2.style.transform = "translate(-50%, -60%)";
    await fadeIn(titleImg2, 1000);

    pressKeyText.style.display = "block";
    requestAnimationFrame(() => {
      pressKeyText.style.opacity = "1";
    });

    waitForPressKey();
  }

  function waitForPressKey() {
    function onInput() {
      fadeOut(pressKeyText, 800).then(() => {
        fadeOut(titleImg2, 800);
        fadeOut(backgroundOverlay, 800).then(() => {
          startBackgroundScroll();
          console.log("メインメニュー開始");
        });
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
  let bgElements = [];
  let containerWidth = window.innerWidth;
  let scrollWrapper = null;

  function createBgDiv(leftPos) {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "0";
    div.style.left = "0";
    div.style.width = `${containerWidth}px`;
    div.style.height = "100vh";
    div.style.backgroundImage = "url('images/menu.png')";
    div.style.backgroundRepeat = "no-repeat";
    div.style.backgroundSize = "cover";
    div.style.zIndex = "1";
    div.style.pointerEvents = "none";
    div.style.willChange = "transform";
    div.style.transform = `translateX(${leftPos}px)`;
    return div;
  }

  function animateScrollingBackground() {
    for (let i = 0; i < bgElements.length; i++) {
      const div = bgElements[i];
      let matrix = window.getComputedStyle(div).transform;
      let currentX = 0;
      if (matrix && matrix !== "none") {
        const values = matrix.match(/matrix.*\((.+)\)/)[1].split(", ");
        currentX = parseFloat(values[4]);
      }
      let newX = currentX - scrollSpeed;
      div.style.transform = `translateX(${newX}px)`;
    }

    const rightmostDiv = bgElements[bgElements.length - 1];
    let rightmostX = 0;
    {
      let matrix = window.getComputedStyle(rightmostDiv).transform;
      if (matrix && matrix !== "none") {
        const values = matrix.match(/matrix.*\((.+)\)/)[1].split(", ");
        rightmostX = parseFloat(values[4]);
      }
    }
    if (rightmostX <= containerWidth / 2) {
      const newDiv = createBgDiv(rightmostX + containerWidth);
      scrollWrapper.appendChild(newDiv);
      bgElements.push(newDiv);
    }

    const leftmostDiv = bgElements[0];
    let leftmostX = 0;
    {
      let matrix = window.getComputedStyle(leftmostDiv).transform;
      if (matrix && matrix !== "none") {
        const values = matrix.match(/matrix.*\((.+)\)/)[1].split(", ");
        leftmostX = parseFloat(values[4]);
      }
    }
    if (leftmostX <= -containerWidth) {
      const removed = bgElements.shift();
      if (removed && removed.parentNode) {
        removed.parentNode.removeChild(removed);
      }
    }

    requestAnimationFrame(animateScrollingBackground);
  }

  async function startBackgroundScroll() {
    backgroundOverlay.style.display = "none";
    containerWidth = window.innerWidth;

    if (scrollWrapper) {
      scrollWrapper.remove();
      scrollWrapper = null;
    }

    scrollWrapper = document.createElement("div");
    scrollWrapper.id = "scrolling-background-wrapper";
    scrollWrapper.style.position = "fixed";
    scrollWrapper.style.top = "0";
    scrollWrapper.style.left = "0";
    scrollWrapper.style.width = "100vw";
    scrollWrapper.style.height = "100vh";
    scrollWrapper.style.overflow = "hidden";
    scrollWrapper.style.zIndex = "1";
    scrollWrapper.style.pointerEvents = "none";
    scrollWrapper.style.opacity = "0";  // 最初は透明

    document.body.appendChild(scrollWrapper);

    bgElements.forEach(div => {
      if (div.parentNode) div.parentNode.removeChild(div);
    });
    bgElements = [];

    // 初期配置2枚
    const first = createBgDiv(0);
    const second = createBgDiv(containerWidth);
    scrollWrapper.appendChild(first);
    scrollWrapper.appendChild(second);
    bgElements.push(first, second);

    // フェードイン
    await fadeIn(scrollWrapper, 1500);

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
