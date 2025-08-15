// title.js（完全版）

document.addEventListener("DOMContentLoaded", () => {
  // ---------- 要素 ----------
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
  const fadeOverlay = document.getElementById("fade-overlay");

  let currentIndex = 0;
  let started = false;
  let menuWrapper, selectedIndex = 0, isInputMode = false;

  // ---------- 初期表示 ----------
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
  [titleImg1, titleImg2].forEach(el => el && (el.style.display = "none"));
  if (pressKeyText) { pressKeyText.style.display = "none"; pressKeyText.style.opacity = 0; }
  if (fullscreenEffect) { fullscreenEffect.style.display = "none"; fullscreenEffect.style.opacity = 0; }
  if (backgroundOverlay) { backgroundOverlay.style.display = "none"; backgroundOverlay.style.opacity = 0; }
  if (introMovie) { introMovie.style.display = "none"; }
  if (fadeOverlay) { fadeOverlay.style.opacity = 0; fadeOverlay.style.display = "none"; } // 黒フェード

  // ---------- 汎用フェード ----------
  function fadeIn(el, duration = 1000) {
    el.style.display = "block";
    el.style.opacity = 0;
    let start = null;
    return new Promise(resolve => {
      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        el.style.opacity = p;
        if (p < 1) requestAnimationFrame(step); else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  function fadeOut(el, duration = 1000) {
    el.style.opacity = 1;
    let start = null;
    return new Promise(resolve => {
      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        el.style.opacity = 1 - p;
        if (p < 1) requestAnimationFrame(step); else { el.style.display = "none"; resolve(); }
      }
      requestAnimationFrame(step);
    });
  }

  // ---------- ロゴシーケンス ----------
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      await showTitleSequence();
      return;
    }

    // 2枚目以降はロゴ背面を白で固定
    if (currentIndex > 0 && backgroundOverlay) {
      backgroundOverlay.style.display = "block";
      backgroundOverlay.style.transition = "none";
      backgroundOverlay.style.backgroundImage = "";
      backgroundOverlay.style.backgroundColor = "rgba(255,255,255,1)";
      backgroundOverlay.style.opacity = 1;
      setTimeout(() => (backgroundOverlay.style.transition = "opacity 1s ease"), 10);
    } else if (backgroundOverlay) {
      backgroundOverlay.style.display = "block";
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

  // ---------- タイトル（タイトル1と全画面エフェクトを同時） ----------
  async function showTitleSequence() {
    // タイトル背景（ゲーム用の背景画像に切り替え）
    if (backgroundOverlay) {
      backgroundOverlay.style.display = "block";
      backgroundOverlay.style.backgroundImage = "url('images/press_bg.png')";
      backgroundOverlay.style.backgroundSize = "cover";
      backgroundOverlay.style.backgroundPosition = "center";
      backgroundOverlay.style.backgroundRepeat = "no-repeat";
      backgroundOverlay.style.transition = "none";
      backgroundOverlay.style.opacity = 0;
      backgroundOverlay.style.filter = "blur(5px)";
      await new Promise(requestAnimationFrame);
      backgroundOverlay.style.transition = "opacity 800ms ease, filter 800ms ease";
      backgroundOverlay.style.opacity = 1;
      backgroundOverlay.style.filter = "blur(0)";
      // 背景のフェードが入ったら次へ
      await new Promise(r => setTimeout(r, 820));
    }

    if (bgm) { try { bgm.loop = true; bgm.volume = 1; bgm.play(); } catch {} }

    // タイトル1のフェードインと全画面エフェクトを同時に走らせる
    const effectPromise = showFullscreenEffect(); // ←同時開始
    const title1Promise = (async () => {
      if (!titleImg1) return;
      titleImg1.style.display = "block";
      titleImg1.style.opacity = 0;
      await fadeIn(titleImg1, 1000);
      await new Promise(r => setTimeout(r, 3000));
      await fadeOut(titleImg1, 1000);
    })();

    await Promise.allSettled([effectPromise, title1Promise]);

    // タイトル2表示 → PRESS ANY KEY
    if (titleImg2) { titleImg2.style.display = "block"; titleImg2.style.opacity = 0; await fadeIn(titleImg2, 1000); }
    if (pressKeyText) { pressKeyText.style.display = "block"; requestAnimationFrame(() => (pressKeyText.style.opacity = 1)); }

    waitForPressKey();
  }

  // ---------- 全画面エフェクト ----------
  async function showFullscreenEffect() {
    if (!fullscreenEffect) return;
    if (effectSfx) { try { effectSfx.currentTime = 0; await effectSfx.play(); } catch {} }
    fullscreenEffect.style.display = "block";
    fullscreenEffect.style.opacity = 0;
    fullscreenEffect.style.transform = "translate(-50%, -50%) scale(2)";
    fullscreenEffect.style.transition = "none";
    await new Promise(requestAnimationFrame);
    fullscreenEffect.style.transition = "opacity 3s ease, transform 3s ease";
    fullscreenEffect.style.opacity = 1;
    fullscreenEffect.style.transform = "translate(-50%, -50%) scale(1)";
    await new Promise(r => setTimeout(r, 2000));
    fullscreenEffect.style.transition = "opacity 3s ease";
    fullscreenEffect.style.opacity = 0;
    await new Promise(r => setTimeout(r, 3000));
    fullscreenEffect.style.display = "none";
  }

  // ---------- PRESS ANY KEY → メニュー ----------
  function waitForPressKey() {
    async function onInput() {
      window.removeEventListener("keydown", onInput, true);
      window.removeEventListener("touchstart", onInput, true);
      if (pressKeyText) await fadeOut(pressKeyText, 800);
      // 背景は残してメニューを重ねるため、ここでは消さない
      startBackgroundScroll();
      createMenu();
      attachMenuKeyboardListeners();
    }
    window.addEventListener("keydown", onInput, { capture: true });
    window.addEventListener("touchstart", onInput, { capture: true });
  }

  // ---------- センターテキストクリックで開始 ----------
  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(showNextLogo);
  });

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
    // タイトル背景(press_bg)は残す。スクロールはその上位z-index=1なので下層に流す
    document.body.appendChild(scrollWrapper);
    bgElements = [createBgDiv(0), createBgDiv(bgImageWidth)];
    bgElements.forEach(div => scrollWrapper.appendChild(div));
    animateScrollingBackground();
  }

  // ---------- メニュー ----------
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
      if (isInputMode) { isInputMode = false; updateMenuHighlight(); }
    }
  }

  // ---------- New Game：フェード→動画→ゲーム ----------
  async function onNewGameClicked() {
    // メニューとスクロールをフェードアウト
    if (menuWrapper) menuWrapper.style.display = "none";

    // タイトル画像・スクロール背景を薄く
    const fades = [];
    if (titleImg2) { titleImg2.style.transition = "opacity 500ms ease"; titleImg2.style.opacity = "0"; fades.push(new Promise(r => setTimeout(r, 520))); }
    if (bgm && !bgm.paused) {
      // BGMフェードアウト
      const fadeDuration = 600;
      const steps = 12;
      const stepTime = fadeDuration / steps;
      for (let i = 0; i < steps; i++) {
        await new Promise(r => setTimeout(r, stepTime));
        bgm.volume = Math.max(0, bgm.volume - 1 / steps);
      }
      bgm.pause();
      bgm.currentTime = 0;
      bgm.volume = 1;
    }
    await Promise.all(fades);

    // 黒フェードイン
    await fadeInOverlay();

    // 動画再生
    await playIntroMovie();

    // 黒フェードアウト → ゲーム開始
    await fadeOutOverlay();
    startGame();
  }

  function fadeInOverlay() {
    if (!fadeOverlay) return Promise.resolve();
    fadeOverlay.style.display = "block";
    // CSSにtransitionがある前提（HTMLに入っている）
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        fadeOverlay.style.opacity = "1";
        setTimeout(resolve, 1000); // CSSのtransition: 1s に合わせる
      });
    });
  }

  function fadeOutOverlay() {
    if (!fadeOverlay) return Promise.resolve();
    return new Promise(resolve => {
      fadeOverlay.style.opacity = "0";
      setTimeout(() => {
        fadeOverlay.style.display = "none";
        resolve();
      }, 1000);
    });
  }

  function playIntroMovie() {
    return new Promise(resolve => {
      if (!introMovie) { console.error("intro-movie が見つかりません"); resolve(); return; }
      introMovie.style.display = "block";
      introMovie.currentTime = 0;
      // iOS等の自動再生対策でcatchして握りつぶす
      const p = introMovie.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
      introMovie.onended = () => {
        introMovie.onended = null;
        introMovie.style.display = "none";
        resolve();
      };
    });
  }

  function startGame() {
    if (gameScreen) gameScreen.style.display = "block";
    if (scrollWrapper) scrollWrapper.style.display = "none";
    if (backgroundOverlay) backgroundOverlay.style.display = "none"; // タイトル背景を消す
    // 必要ならゲーム初期化を呼ぶ
    if (typeof initGame === "function") initGame();
  }
});
