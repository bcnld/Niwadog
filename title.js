document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  const backgroundOverlay = document.getElementById("background-overlay");
  const bgm = document.getElementById("bgm");
  const titleImg1 = document.getElementById("title-img1");
  const titleImg2 = document.getElementById("title-img2");
  const pressKeyText = document.getElementById("press-any-key");
  const fullscreenEffect = document.getElementById("fullscreen-effect");
  const effectSfx = document.getElementById("effect-sfx");
  const selectSfx = document.getElementById("select-sfx");

  let currentIndex = 0;
  let started = false;

  logos.forEach(logo => {
    logo.style.position = "fixed";
    logo.style.top = "50%";
    logo.style.left = "50%";
    logo.style.transform = "translate(-50%, -50%)";
    logo.style.zIndex = "9998";
  });

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
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
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

  // 全画面効果（音付き）
  async function showFullscreenEffect() {
    if (!fullscreenEffect) return;
    if (effectSfx) {
      try {
        effectSfx.currentTime = 0;
        await effectSfx.play();
      } catch {}
    }
    fullscreenEffect.style.display = "block";
    fullscreenEffect.style.opacity = "0";
    fullscreenEffect.style.transform = "translate(-50%, -50%) scale(2)";
    fullscreenEffect.style.transition = "none";

    await new Promise(requestAnimationFrame);

    fullscreenEffect.style.transition = "opacity 3s ease, transform 3s ease";
    fullscreenEffect.style.opacity = "1";
    fullscreenEffect.style.transform = "translate(-50%, -50%) scale(1)";

    await new Promise(resolve => setTimeout(resolve, 2000));

    fullscreenEffect.style.transition = "opacity 3s ease";
    fullscreenEffect.style.opacity = "0";

    await new Promise(resolve => setTimeout(resolve, 3000));
    fullscreenEffect.style.display = "none";
  }

  // 背景画像フェードイン
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
    bgm.volume = 1;
    bgm.play();

    await new Promise(resolve => setTimeout(resolve, 2100));
  }

  // タイトル画像表示
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
    pressKeyText.style.opacity = "0";
    requestAnimationFrame(() => {
      pressKeyText.style.opacity = "1";
    });

    waitForPressKey();
  }

  // キーまたはタッチ待ち
  function waitForPressKey() {
    async function onInput() {
      window.removeEventListener("keydown", onInput, true);
      window.removeEventListener("touchstart", onInput, true);

      await fadeOut(pressKeyText, 800);
      await fadeOut(backgroundOverlay, 1500);

      startBackgroundScroll();
      createMenu();
      attachMenuKeyboardListeners();
    }
    window.addEventListener("keydown", onInput, { capture: true });
    window.addEventListener("touchstart", onInput, { capture: true });
  }

  // ロゴを順に表示
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      await Promise.all([
        showFullscreenEffect(),
        fadeInBackgroundImage()
      ]);
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

  // 背景スクロール処理
  const scrollSpeed = 1;
  const containerHeight = window.innerHeight;
  const containerWidth = window.innerWidth;
  const bgImageWidth = 3600;
  const bgImageHeight = containerHeight;

  const scrollWrapper = document.createElement("div");
  scrollWrapper.id = "scroll-wrapper";
  Object.assign(scrollWrapper.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: `${containerWidth}px`,
    height: `${containerHeight}px`,
    overflow: "hidden",
    zIndex: "1",
    pointerEvents: "none",
  });

  let bgElements = [];

  function createBgDiv(x) {
    const div = document.createElement("div");
    Object.assign(div.style, {
      position: "absolute",
      top: "0",
      left: `${x}px`,
      width: `${bgImageWidth}px`,
      height: `${bgImageHeight}px`,
      backgroundImage: "url('images/menu.png')",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
    });
    return div;
  }

  function animateScrollingBackground() {
    for (let i = 0; i < bgElements.length; i++) {
      const div = bgElements[i];
      let currentX = parseFloat(div.style.left);
      let newX = currentX - scrollSpeed;
      div.style.left = `${newX}px`;
    }

    const firstDiv = bgElements[0];
    if (parseFloat(firstDiv.style.left) + bgImageWidth <= 0) {
      const removed = bgElements.shift();
      if (removed.parentNode) removed.parentNode.removeChild(removed);
    }

    const lastDiv = bgElements[bgElements.length - 1];
    const lastRight = parseFloat(lastDiv.style.left) + bgImageWidth;
    if (lastRight <= containerWidth) {
      const newDiv = createBgDiv(lastRight);
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

  // メニュー作成と選択処理
  const menuItems = ["New Game", "Load", "Settings"];
  let selectedIndex = 0;
  let isInputMode = false;
  let menuWrapper;

  function createMenu() {
    menuWrapper = document.createElement("div");
    menuWrapper.id = "menu-wrapper";
    menuWrapper.style.position = "fixed";

    const rect = titleImg2.getBoundingClientRect();

    menuWrapper.style.top = `${rect.bottom + 20}px`;
    menuWrapper.style.left = "50%";
    menuWrapper.style.transform = "translateX(-50%)";

    Object.assign(menuWrapper.style, {
      zIndex: "10000",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      fontSize: "24px",
      fontWeight: "bold",
      color: "#fff",
      textShadow: "0 0 5px black",
    });

    menuItems.forEach((text, i) => {
      const item = document.createElement("div");
      item.textContent = text;
      Object.assign(item.style, {
        cursor: "pointer",
        padding: "10px 20px",
        borderRadius: "8px",
        userSelect: "none",
        transition: "background-color 0.3s ease, color 0.3s ease",
      });
      item.dataset.index = i;

      item.addEventListener("click", () => {
        if (selectedIndex === i && isInputMode) {
          if (menuItems[i] === "New Game") {
            onNewGameClicked();
          } else {
            alert(`"${menuItems[i]}" が選択されました！`);
          }
        } else {
          selectedIndex = i;
          isInputMode = true;
          updateMenuHighlight();
        }
      });

      item.addEventListener("mouseenter", () => {
        if (selectedIndex !== i) {
          selectedIndex = i;
          isInputMode = false;
          updateMenuHighlight();
        }
      });

      menuWrapper.appendChild(item);
    });

    document.body.appendChild(menuWrapper);

    // 画面外クリックで選択解除
    window.addEventListener("click", (e) => {
      if (!menuWrapper.contains(e.target)) {
        selectedIndex = -1;
        isInputMode = false;
        updateMenuHighlight();
      }
    });

    updateMenuHighlight();
  }

  function updateMenuHighlight() {
    if (!menuWrapper) return;
    const children = menuWrapper.children;
    let playedSfxThisUpdate = false;
    for (let i = 0; i < children.length; i++) {
      const item = children[i];
      if (i === selectedIndex) {
        if (isInputMode) {
          item.style.backgroundColor = "#f90";
          item.style.color = "#000";
        } else {
          item.style.backgroundColor = "#555";
          item.style.color = "#fff";
        }
        if (!playedSfxThisUpdate && selectSfx) {
          try {
            selectSfx.currentTime = 0;
            selectSfx.play();
            playedSfxThisUpdate = true;
          } catch {}
        }
      } else {
        item.style.backgroundColor = "transparent";
        item.style.color = "#fff";
      }
    }
  }

  // キーボード操作の処理をメニューに付与
  function attachMenuKeyboardListeners() {
    window.addEventListener("keydown", onMenuKeyDown);
  }

  function onMenuKeyDown(e) {
    if (!menuWrapper) return;

    if (e.key === "ArrowDown") {
      selectedIndex = (selectedIndex + 1) % menuItems.length;
      isInputMode = false;
      updateMenuHighlight();
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
      isInputMode = false;
      updateMenuHighlight();
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < menuItems.length) {
        if (isInputMode) {
          if (menuItems[selectedIndex] === "New Game") {
            onNewGameClicked();
          } else {
            alert(`"${menuItems[selectedIndex]}" が選択されました！`);
          }
        } else {
          isInputMode = true;
          updateMenuHighlight();
        }
      }
      e.preventDefault();
    } else if (e.key === "Escape") {
      // 入力モード解除
      if (isInputMode) {
        isInputMode = false;
        updateMenuHighlight();
      }
    }
  }

  // 音量フェードアウト関数（Promiseで待機可能）
  function fadeOutAudio(audio, duration = 1000) {
    return new Promise(resolve => {
      const startVolume = audio.volume;
      const startTime = performance.now();

      function step(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = startVolume * (1 - progress);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          audio.volume = 0;
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  // New Game選択時の処理（完全版）
  async function onNewGameClicked() {
  if (menuWrapper) {
    menuWrapper.style.display = "none";
  }
  if (scrollWrapper) {
    await fadeOut(scrollWrapper, 2000);
  }

  if (bgm && !bgm.paused) {
    const fadeDuration = 2000;
    const steps = 20;
    const stepTime = fadeDuration / steps;
    for (let i = 0; i < steps; i++) {
      await new Promise(r => setTimeout(r, stepTime));
      bgm.volume = Math.max(0, bgm.volume - 1 / steps);
    }
    bgm.pause();
    bgm.currentTime = 0;
    bgm.volume = 1;
  }

  await new Promise(r => setTimeout(r, 1000));

  if (typeof startIntroSequence === "function") {
    startIntroSequence();
  } else {
    console.error("startIntroSequence 関数がありません (Script.js側を確認してください)");
  }
}

  // 初期非表示設定
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = "0";
  });
  titleImg1.style.display = "none";
  titleImg2.style.display = "none";
  pressKeyText.style.display = "none";
  pressKeyText.style.opacity = "0";

  if (fullscreenEffect) {
    fullscreenEffect.style.display = "none";
    fullscreenEffect.style.opacity = "0";
  }

  // センターテキストクリックで開始
  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(() => {
      showNextLogo();
    });
  });
});
