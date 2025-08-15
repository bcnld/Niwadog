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
  const introMovie = document.getElementById("intro-movie");
  const gameScreen = document.getElementById("game-screen");
  const fullscreenBtn = document.getElementById("fullscreen-toggle");

  let currentIndex = 0;
  let started = false;
  let menuWrapper;
  let selectedIndex = 0;
  let isInputMode = false;

  // --- ロゴ初期化 ---
  logos.forEach(logo => {
    Object.assign(logo.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: "9998",
      display: "none",
      opacity: 0
    });
  });
  titleImg1.style.display = "none";
  titleImg2.style.display = "none";
  pressKeyText.style.display = "none";
  fullscreenEffect.style.display = "none";

  // --- フェード ---
  function fadeIn(el, duration = 1000) {
    el.style.display = "block";
    el.style.opacity = 0;
    return new Promise(resolve => {
      const start = performance.now();
      function step(time) {
        const progress = Math.min((time - start) / duration, 1);
        el.style.opacity = progress;
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }
  function fadeOut(el, duration = 1000) {
    el.style.opacity = 1;
    return new Promise(resolve => {
      const start = performance.now();
      function step(time) {
        const progress = Math.min((time - start) / duration, 1);
        el.style.opacity = 1 - progress;
        if (progress < 1) requestAnimationFrame(step);
        else { el.style.display = "none"; resolve(); }
      }
      requestAnimationFrame(step);
    });
  }

  // --- ロゴ表示 ---
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      await showTitleSequence();
      return;
    }
    const logo = logos[currentIndex];
    await fadeIn(logo, 1000);
    await new Promise(r => setTimeout(r, 2000));
    await fadeOut(logo, 1000);
    currentIndex++;
    showNextLogo();
  }

  // --- タイトル演出 ---
  async function showTitleSequence() {
    if (fullscreenEffect && effectSfx) {
      try { effectSfx.currentTime = 0; effectSfx.play(); } catch {}
      fullscreenEffect.style.display = "block";
      fullscreenEffect.style.opacity = 0;
      fullscreenEffect.style.transform = "translate(-50%, -50%) scale(2)";
      await new Promise(requestAnimationFrame);
      fullscreenEffect.style.transition = "opacity 3s ease, transform 3s ease";
      fullscreenEffect.style.opacity = 1;
      fullscreenEffect.style.transform = "translate(-50%, -50%) scale(1)";
      await new Promise(resolve => setTimeout(resolve, 2000));
      fullscreenEffect.style.transition = "opacity 3s ease";
      fullscreenEffect.style.opacity = 0;
      await new Promise(resolve => setTimeout(resolve, 3000));
      fullscreenEffect.style.display = "none";
    }

    if (backgroundOverlay) {
      backgroundOverlay.style.display = "block";
      backgroundOverlay.style.opacity = 0;
      backgroundOverlay.style.backgroundImage = "url('images/press_bg.png')";
      backgroundOverlay.style.backgroundSize = "cover";
      backgroundOverlay.style.backgroundPosition = "center";
      backgroundOverlay.style.filter = "blur(5px)";
      await new Promise(requestAnimationFrame);
      backgroundOverlay.style.transition = "opacity 2s ease, filter 2s ease";
      backgroundOverlay.style.opacity = 1;
      backgroundOverlay.style.filter = "blur(0)";
    }

    if (bgm) { bgm.loop = true; bgm.volume = 1; bgm.play(); }

    // title images
    titleImg1.style.display = "block";
    titleImg1.style.opacity = 0;
    await fadeIn(titleImg1, 1000);
    await new Promise(r => setTimeout(r, 3000));
    await fadeOut(titleImg1, 1000);

    titleImg2.style.display = "block";
    titleImg2.style.opacity = 0;
    await fadeIn(titleImg2, 1000);

    // メニュー表示
    createMenu();
  }

  // --- メニュー ---
  const menuItems = ["New Game", "Load", "Settings"];
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
        selectedIndex = i;
        if (menuItems[i] === "New Game") startIntroSequence();
      });

      menuWrapper.appendChild(item);
    });

    document.body.appendChild(menuWrapper);
    updateMenuHighlight();
    attachMenuKeyboardListeners();
  }

  function updateMenuHighlight() {
    if (!menuWrapper) return;
    const children = menuWrapper.children;
    for (let i = 0; i < children.length; i++) {
      const item = children[i];
      if (i === selectedIndex) item.style.backgroundColor = "#f90";
      else item.style.backgroundColor = "transparent";
    }
  }

  function attachMenuKeyboardListeners() {
    window.addEventListener("keydown", e => {
      if (!menuWrapper) return;
      if (e.key === "ArrowDown") { selectedIndex = (selectedIndex + 1) % menuItems.length; updateMenuHighlight(); }
      else if (e.key === "ArrowUp") { selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length; updateMenuHighlight(); }
      else if (e.key === "Enter") {
        if (menuItems[selectedIndex] === "New Game") startIntroSequence();
      }
    });
  }

  // --- イントロ動画再生 ---
  function startIntroSequence() {
    if (menuWrapper) menuWrapper.style.display = "none";
    if (titleImg2) titleImg2.style.display = "none";
    if (bgm) { bgm.pause(); bgm.currentTime = 0; }

    if (introMovie) {
      introMovie.style.display = "block";
      introMovie.play();
      introMovie.onended = () => {
        introMovie.style.display = "none";
        showGameScreen();
      };
      introMovie.addEventListener("click", () => {
        introMovie.pause();
        introMovie.style.display = "none";
        showGameScreen();
      });
    } else {
      showGameScreen();
    }
  }

  function showGameScreen() {
    if (gameScreen) gameScreen.style.display = "block";
    if (backgroundOverlay) backgroundOverlay.style.display = "none";
  }

  // --- 中央テキストクリック ---
  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(showNextLogo);
  });

  // --- 全画面切替 ---
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });
});
