// title.js
document.addEventListener("DOMContentLoaded", () => {
  // ---------- 要素取得 ----------
  const centerText       = document.getElementById("center-text");
  const logos            = document.querySelectorAll(".company-logo");
  const backgroundOverlay= document.getElementById("background-overlay");
  const bgm              = document.getElementById("bgm");
  const titleImg1        = document.getElementById("title-img1");
  const titleImg2        = document.getElementById("title-img2");
  const pressKeyText     = document.getElementById("press-any-key");
  const fullscreenEffect = document.getElementById("fullscreen-effect");
  const effectSfx        = document.getElementById("effect-sfx");
  const selectSfx        = document.getElementById("select-sfx");
  const gameScreen       = document.getElementById("game-screen");

  // 動画とフェード（HTMLは id="intro-movie" を想定。万一 "intro-video" でも拾う）
  const introMovie       = document.getElementById("intro-movie") || document.getElementById("intro-video");
  const fadeOverlay      = document.getElementById("fade-overlay");

  // ---------- 状態 ----------
  let currentIndex = 0;
  let started = false;
  let menuWrapper, selectedIndex = 0, isInputMode = false;

  // ---------- 初期スタイル整備 ----------
  // ロゴ
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

  // 背景オーバーレイ（ロゴの背景/タイトル用背景）
  if (backgroundOverlay) {
    Object.assign(backgroundOverlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "9997",              // ロゴ(9998)の一段下
      display: "none",
      opacity: 0,
      backgroundColor: "transparent",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat"
    });
  }

  // そのほか
  if (titleImg1) titleImg1.style.display = "none";
  if (titleImg2) titleImg2.style.display = "none";
  if (pressKeyText) { pressKeyText.style.display = "none"; pressKeyText.style.opacity = 0; }
  if (fullscreenEffect) { fullscreenEffect.style.display = "none"; fullscreenEffect.style.opacity = 0; }
  if (introMovie) { introMovie.style.display = "none"; }
  if (fadeOverlay) {
    Object.assign(fadeOverlay.style, {
      opacity: "0",
      display: "none",
      pointerEvents: "none",
      transition: "opacity 1s ease"
    });
  }

  // ---------- 汎用フェード関数 ----------
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
    el.style.opacity = el.style.opacity || 1;
    let start = null;
    return new Promise(resolve => {
      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        el.style.opacity = 1 - p;
        if (p < 1) requestAnimationFrame(step);
        else { el.style.display = "none"; resolve(); }
      }
      requestAnimationFrame(step);
    });
  }

  // ---------- ロゴシーケンス ----------
  async function showNextLogo() {
    // ロゴ背景（ここで必ず表示させる）← これで2回目以降の白背景が出ない問題を解決
    if (backgroundOverlay) {
      backgroundOverlay.style.display = "block";
      backgroundOverlay.style.opacity = 1;
      backgroundOverlay.style.backgroundImage = ""; // ロゴ時は単色
      backgroundOverlay.style.filter = "none";
      backgroundOverlay.style.transform = "none";
      backgroundOverlay.style.transition = "none";
      // 1枚目は透明、2枚目以降は白
      backgroundOverlay.style.backgroundColor = (currentIndex > 0) ? "rgba(255,255,255,0.85)" : "transparent";
    }

    if (currentIndex >= logos.length) {
      await showTitleSequence();
      return;
    }

    const logo = logos[currentIndex];
    await fadeIn(logo, 1000);
    await wait(2000);
    await fadeOut(logo, 1000);

    currentIndex++;
    showNextLogo();
  }

  // ---------- タイトル表示（Title1と全画面エフェクトを同時に） ----------
  async function showTitleSequence() {
    // タイトル背景へ切り替え（フェードイン）
    if (backgroundOverlay) {
      backgroundOverlay.style.display = "block";
      backgroundOverlay.style.opacity = 0;
      backgroundOverlay.style.backgroundColor = "transparent";
      backgroundOverlay.style.backgroundImage = "url('images/press_bg.png')";
      backgroundOverlay.style.filter = "blur(5px)";
      backgroundOverlay.style.transform = "scale(1.2)";
      await nextFrame();
      backgroundOverlay.style.transition = "opacity 2000ms ease, filter 2000ms ease, transform 2000ms ease";
      backgroundOverlay.style.opacity = 1;
      backgroundOverlay.style.filter = "blur(0)";
      backgroundOverlay.style.transform = "scale(1)";
      await wait(2100);
    }

    // BGM
    if (bgm) {
      try { bgm.loop = true; bgm.volume = 1; await bgm.play(); } catch {}
    }

    // Title1 と 全画面エフェクトを同時に開始
    const effectPromise = showFullscreenEffect(); // ← awaitしない（同時再生）
    if (titleImg1) {
      titleImg1.style.display = "block";
      titleImg1.style.opacity = 0;
      titleImg1.style.filter = "drop-shadow(0 0 20px white)";
      await fadeIn(titleImg1, 1000);
      await wait(3000);
      await fadeOut(titleImg1, 1000);
      titleImg1.style.filter = "none";
    }
    // エフェクト終わり待ちは不要。失敗しても落ちないようにしておく
    effectPromise.catch(()=>{});

    // Title2
    if (titleImg2) {
      titleImg2.style.display = "block";
      titleImg2.style.opacity = 0;
      titleImg2.style.transform = "translate(-50%, -60%) scale(1.5)";
      titleImg2.style.transition = "transform 1s ease";
      await fadeIn(titleImg2, 1000);
      // ゆっくりズームダウン
      requestAnimationFrame(() => {
        titleImg2.style.transform = "translate(-50%, -60%) scale(1)";
      });
    }

    // PRESS ANY KEY
    if (pressKeyText) {
      pressKeyText.style.display = "block";
      pressKeyText.style.opacity = 0;
      await nextFrame();
      pressKeyText.style.opacity = 1;
    }

    waitForPressKey();
  }

  // ---------- 全画面エフェクト ----------
  async function showFullscreenEffect() {
    if (!fullscreenEffect) return;
    try {
      if (effectSfx) { effectSfx.currentTime = 0; await effectSfx.play(); }
    } catch {}
    fullscreenEffect.style.display = "block";
    fullscreenEffect.style.opacity = 0;
    fullscreenEffect.style.transform = "translate(-50%, -50%) scale(2)";
    fullscreenEffect.style.transition = "none";
    await nextFrame();
    fullscreenEffect.style.transition = "opacity 3s ease, transform 3s ease";
    fullscreenEffect.style.opacity = 1;
    fullscreenEffect.style.transform = "translate(-50%, -50%) scale(1)";
    await wait(2000);
    fullscreenEffect.style.transition = "opacity 3s ease";
    fullscreenEffect.style.opacity = 0;
    await wait(3000);
    fullscreenEffect.style.display = "none";
  }

  // ---------- PRESS ANY KEY ----------
  function waitForPressKey() {
    async function onInput() {
      window.removeEventListener("keydown", onInput, true);
      window.removeEventListener("touchstart", onInput, true);
      if (pressKeyText) await fadeOut(pressKeyText, 800);
      if (backgroundOverlay) await fadeOut(backgroundOverlay, 1500);
      startBackgroundScroll();          // ← バックグラウンドスクロール開始
      createMenu();
      attachMenuKeyboardListeners();
    }
    window.addEventListener("keydown", onInput, { capture: true });
    window.addEventListener("touchstart", onInput, { capture: true });
  }

  // ---------- センターテキストクリック開始 ----------
  if (centerText) {
    centerText.addEventListener("click", () => {
      if (started) return;
      started = true;
      fadeOut(centerText, 500).then(showNextLogo);
    });
  }

  // ---------- 背景スクロール ----------
  const scrollSpeed = 1;
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
      backgroundPosition: "center center"
    });
    return div;
  }

  // ウィンドウサイズを使うので、開始時に毎回最新値で作る
  let scrollWrapper = null;
  let bgElements = [];
  let bgImageWidth = 3600;
  let bgImageHeight = window.innerHeight;

  function startBackgroundScroll() {
    // 既存があれば一旦除去して再構築（安全）
    if (scrollWrapper && scrollWrapper.parentNode) scrollWrapper.parentNode.removeChild(scrollWrapper);

    bgImageHeight = window.innerHeight;
    const containerWidth = window.innerWidth;

    scrollWrapper = document.createElement("div");
    scrollWrapper.id = "scroll-wrapper";
    Object.assign(scrollWrapper.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: `${containerWidth}px`,
      height: `${bgImageHeight}px`,
      overflow: "hidden",
      zIndex: "1",            // 背景として最背面寄り
      pointerEvents: "none",
      display: "block"
    });

    bgElements = [createBgDiv(0), createBgDiv(bgImageWidth)];
    bgElements.forEach(div => scrollWrapper.appendChild(div));

    document.body.appendChild(scrollWrapper);
    animateScrollingBackground(containerWidth);
  }

  function animateScrollingBackground(containerWidth) {
    // ループ
    function tick() {
      if (!scrollWrapper) return;
      // 左へ流す
      for (let i = 0; i < bgElements.length; i++) {
        const div = bgElements[i];
        div.style.left = `${parseFloat(div.style.left) - scrollSpeed}px`;
      }
      // 先頭を捨てる
      if (bgElements.length && (parseFloat(bgElements[0].style.left) + bgImageWidth <= 0)) {
        const removed = bgElements.shift();
        if (removed && removed.parentNode) removed.parentNode.removeChild(removed);
      }
      // 末尾の右端位置
      if (bgElements.length) {
        const lastDiv = bgElements[bgElements.length - 1];
        const lastRight = parseFloat(lastDiv.style.left) + bgImageWidth;
        if (lastRight <= containerWidth) {
          const newDiv = createBgDiv(lastRight);
          scrollWrapper.appendChild(newDiv);
          bgElements.push(newDiv);
        }
      } else {
        // 念のため要素が0になったら復元
        const newA = createBgDiv(0);
        const newB = createBgDiv(bgImageWidth);
        scrollWrapper.appendChild(newA);
        scrollWrapper.appendChild(newB);
        bgElements.push(newA, newB);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- メニュー ----------
  const menuItems = ["New Game", "Load", "Settings"];

  function createMenu() {
    if (menuWrapper && menuWrapper.parentNode) menuWrapper.parentNode.removeChild(menuWrapper);

    menuWrapper = document.createElement("div");
    const rect = titleImg2 ? titleImg2.getBoundingClientRect() : { bottom: window.innerHeight * 0.55 };
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
      userSelect: "none"
    });

    selectedIndex = 0;
    isInputMode = false;

    menuItems.forEach((text, i) => {
      const item = document.createElement("div");
      item.textContent = text;
      Object.assign(item.style, {
        cursor: "pointer",
        padding: "10px 20px",
        borderRadius: "8px",
        transition: "background-color 0.3s ease, color 0.3s ease"
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

    // メニュー外クリックで選択解除
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
        if (isInputMode) { item.style.backgroundColor = "#f90"; item.style.color = "#000"; }
        else { item.style.backgroundColor = "#555"; item.style.color = "#fff"; }
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

  // ---------- New Game → 黒フェード → 動画 → ゲーム ----------
  async function onNewGameClicked() {
    // メニュー非表示
    if (menuWrapper) menuWrapper.style.display = "none";

    // Title2と背景スクロールをフェード
    const fades = [];
    if (titleImg2 && titleImg2.style.display !== "none") {
      titleImg2.style.transition = "opacity 600ms ease";
      titleImg2.style.opacity = "0";
      fades.push(wait(650).then(() => (titleImg2.style.display = "none")));
    }
    if (scrollWrapper && scrollWrapper.style.display !== "none") {
      fades.push(fadeOut(scrollWrapper, 600));
    }

    // タイトルBGMフェードアウト
    if (bgm && !bgm.paused) {
      const fadeDuration = 600;
      const steps = 12;
      const stepTime = Math.max(10, Math.floor(fadeDuration / steps));
      for (let i = 0; i < steps; i++) {
        await wait(stepTime);
        bgm.volume = Math.max(0, bgm.volume - 1 / steps);
      }
      bgm.pause();
      bgm.currentTime = 0;
      bgm.volume = 1;
    }

    await Promise.all(fades);

    // 黒フェードアウト（=暗転）→ 動画再生開始
    if (fadeOverlay) {
      fadeOverlay.style.display = "block";
      await nextFrame();
      fadeOverlay.style.opacity = "1";
      await wait(1000); // フェード時間
    }

    await playIntroMovieThenStartGame();
  }

  async function playIntroMovieThenStartGame() {
    if (!introMovie) {
      console.error("intro-movie 要素が見つかりません");
      // 動画が無い場合はそのままゲームへ
      enterGame();
      return;
    }
    introMovie.style.display = "block";
    try {
      introMovie.currentTime = 0;
    } catch {}
    try {
      await introMovie.play();
    } catch (e) {
      console.warn("動画の自動再生がブロックされました。ユーザー操作で再生してください。", e);
      // ここでクリックで再再生を促す処理を入れてもよい
    }

    introMovie.onended = () => {
      introMovie.style.display = "none";
      // 黒フェード解除
      if (fadeOverlay) {
        fadeOverlay.style.opacity = "0";
        setTimeout(() => { fadeOverlay.style.display = "none"; }, 300);
      }
      enterGame();
    };
  }

  function enterGame() {
    // タイトル系を念のため非表示
    if (menuWrapper) menuWrapper.style.display = "none";
    if (titleImg1) titleImg1.style.display = "none";
    if (titleImg2) titleImg2.style.display = "none";
    if (pressKeyText) pressKeyText.style.display = "none";
    if (scrollWrapper) scrollWrapper.style.display = "none";
    if (backgroundOverlay) backgroundOverlay.style.display = "none";

    // ゲーム画面へ
    if (gameScreen) gameScreen.style.display = "block";

    // ゲーム初期化が別スクリプトにあるなら呼ぶ
    if (typeof window.initGame === "function") {
      try { window.initGame(); } catch (e) { console.error(e); }
    }
  }

  // ---------- ユーティリティ ----------
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function nextFrame() { return new Promise(r => requestAnimationFrame(r)); }
});
