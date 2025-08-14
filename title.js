document.addEventListener("DOMContentLoaded", () => {
  // ---------- 要素取得 ----------
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
  const intro = document.getElementById("intro");

  let currentIndex = 0;
  let started = false;
  let introPlayed = false;

  // ロゴ初期位置設定
  logos.forEach(logo => {
    Object.assign(logo.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: "9998"
    });
  });

  // ---------- 汎用フェード関数 ----------
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

  // ---------- イントロ ----------
  function startIntro() {
    if (!intro) return showNextLogo();
    introPlayed = true;
    intro.style.display = "flex";
    intro.style.opacity = 1;

    // 自動スキップ（5秒）
    setTimeout(() => {
      if (introPlayed) skipIntro();
    }, 5000);

    intro.addEventListener("click", skipIntro);
  }

  function skipIntro() {
    if (!introPlayed) return;
    introPlayed = false;
    fadeOut(intro, 1000).then(showNextLogo);
  }

  // ---------- ロゴ表示 ----------
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      await Promise.all([showFullscreenEffect(), fadeInBackgroundImage()]);
      await showTitleImages();
      return;
    }

    if (currentIndex > 0) {
      backgroundOverlay.style.transition = "none";
      backgroundOverlay.style.backgroundImage = "";
      backgroundOverlay.style.backgroundColor = "rgba(255,255,255,0.8)";
      backgroundOverlay.style.opacity = 1;
      setTimeout(() => backgroundOverlay.style.transition = "opacity 1s ease", 10);
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

  // ---------- 全画面エフェクト ----------
  async function showFullscreenEffect() {
    if (!fullscreenEffect) return;
    if (effectSfx) { try { effectSfx.currentTime = 0; await effectSfx.play(); } catch {} }
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

  // ---------- 背景フェードイン ----------
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

    if (bgm) { bgm.loop = true; bgm.volume = 1; bgm.play(); }
    await new Promise(resolve => setTimeout(resolve, 2100));
  }

  // ---------- タイトル表示 ----------
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
    requestAnimationFrame(() => pressKeyText.style.opacity = "1");

    waitForPressKey();
  }

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

  // ---------- 背景スクロール ----------
  const scrollSpeed = 1;
  const containerHeight = window.innerHeight;
  const containerWidth = window.innerWidth;
  const bgImageWidth = 3600;
  const bgImageHeight = containerHeight;

  const scrollWrapper = document.createElement("div");
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
      div.style.left = `${parseFloat(div.style.left) - scrollSpeed}px`;
    }

    if (parseFloat(bgElements[0].style.left) + bgImageWidth <= 0) {
      const removed = bgElements.shift();
      removed.remove();
    }

    const lastDiv = bgElements[bgElements.length - 1];
    if (parseFloat(lastDiv.style.left) + bgImageWidth <= containerWidth) {
      const newDiv = createBgDiv(parseFloat(lastDiv.style.left) + bgImageWidth);
      scrollWrapper.appendChild(newDiv);
      bgElements.push(newDiv);
    }
    requestAnimationFrame(animateScrollingBackground);
  }

  function startBackgroundScroll() {
    backgroundOverlay.style.display = "none";
    document.body.appendChild(scrollWrapper);
    bgElements = [createBgDiv(0), createBgDiv(bgImageWidth)];
    bgElements.forEach(div => scrollWrapper.appendChild(div));
    animateScrollingBackground();
  }

  // ---------- メニュー ----------
  const menuItems = ["New Game", "Load", "Settings"];
  let selectedIndex = 0;
  let isInputMode = false;
  let menuWrapper;

  function createMenu() {
    menuWrapper = document.createElement("div");
    const rect = titleImg2.getBoundingClientRect();
    Object.assign(menuWrapper.style, {
      position: "fixed",
      top: `${rect.bottom + 20}px`,
      left: "50%",
      transform: "translateX(-50%)",
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
          if (menuItems[i] === "New Game") onNewGameClicked();
          else alert(`"${menuItems[i]}" が選択されました！`);
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
    window.addEventListener("click", e => {
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
    let playedSfx = false;
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
        if (!playedSfx && selectSfx) {
          try { selectSfx.currentTime = 0; selectSfx.play(); playedSfx = true; } catch {}
        }
      } else {
        item.style.backgroundColor = "transparent";
        item.style.color = "#fff";
      }
    }
  }

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
          if (menuItems[selectedIndex] === "New Game") onNewGameClicked();
          else alert(`"${menuItems[selectedIndex]}" が選択されました！`);
        } else {
          isInputMode = true;
          updateMenuHighlight();
        }
      }
      e.preventDefault();
    } else if (e.key === "Escape") {
      if (isInputMode) {
        isInputMode = false;
        updateMenuHighlight();
      }
    }
  }

  // ---------- New Game ----------
  async function onNewGameClicked() {
    if (menuWrapper) menuWrapper.style.display = "none";

    const fadeTitleImg2 = new Promise(resolve => {
      if (titleImg2) {
        titleImg2.style.transition = "opacity 2s ease";
        titleImg2.style.opacity = "0";
        setTimeout(() => { titleImg2.style.display = "none"; resolve(); }, 2000);
      } else resolve();
    });

    const fadeScrollWrapper = fadeOut(scrollWrapper, 2000);
    await Promise.all([fadeTitleImg2, fadeScrollWrapper]);

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

    if (typeof startIntroSequence === "function") startIntroSequence();
    else console.error("startIntroSequence 関数がありません (Script.js側を確認してください)");
  }

  // ---------- 初期状態 ----------
  logos.forEach(logo => { logo.style.display = "none"; logo.style.opacity = "0"; });
  titleImg1.style.display = "none";
  titleImg2.style.display = "none";
  pressKeyText.style.display = "none";
  pressKeyText.style.opacity = "0";
  if (fullscreenEffect) { fullscreenEffect.style.display = "none"; fullscreenEffect.style.opacity = "0"; }
  if (intro) { intro.style.display = "none"; intro.style.opacity = 0; }

  // ---------- センターテキストクリック ----------
  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(startIntro);
  });
});
