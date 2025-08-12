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

  // BGMを徐々にフェードアウトする関数
  function fadeOutAudio(audio, duration = 1000) {
    return new Promise(resolve => {
      if (!audio) {
        resolve();
        return;
      }
      const startVolume = audio.volume;
      const startTime = performance.now();
      function step(timestamp) {
        const elapsed = timestamp - startTime;
        if (elapsed >= duration) {
          audio.volume = 0;
          resolve();
        } else {
          audio.volume = startVolume * (1 - elapsed / duration);
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    });
  }

  // New Gameボタン作成
  const newGameBtn = document.createElement("div");
  newGameBtn.id = "newgame-btn";
  newGameBtn.textContent = "New Game";
  Object.assign(newGameBtn.style, {
    position: "fixed",
    bottom: "50px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "28px",
    padding: "12px 30px",
    backgroundColor: "#f90",
    color: "#000",
    borderRadius: "12px",
    cursor: "pointer",
    zIndex: "10001",
    userSelect: "none",
    textAlign: "center",
  });
  document.body.appendChild(newGameBtn);

  newGameBtn.addEventListener("click", async () => {
    await onNewGameClicked();
  });

  async function onNewGameClicked() {
    // 黒オーバーレイ作成 or 取得
    let blackOverlay = document.getElementById("black-overlay");
    if (!blackOverlay) {
      blackOverlay = document.createElement("div");
      blackOverlay.id = "black-overlay";
      Object.assign(blackOverlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        opacity: "0",
        pointerEvents: "auto",
        zIndex: "20000",
      });
      document.body.appendChild(blackOverlay);
    }

    // 4秒かけてフェードイン（真っ黒）
    await new Promise(resolve => {
      blackOverlay.style.transition = "opacity 4s ease";
      blackOverlay.style.opacity = "1";
      blackOverlay.addEventListener("transitionend", function te() {
        blackOverlay.removeEventListener("transitionend", te);
        resolve();
      });
    });

    // BGMを1秒かけてフェードアウト
    if (bgm && !bgm.paused) {
      await fadeOutAudio(bgm, 1000);
      bgm.pause();
      bgm.currentTime = 0;
    }

    // 黒い画面のまま1秒キープ
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ムービー用video要素作成 or 取得
    let video = document.getElementById("intro-movie");
    if (!video) {
      video = document.createElement("video");
      video.id = "intro-movie";
      video.src = "movie/intro.mp4"; // 動画パスは環境に応じて調整
      Object.assign(video.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "80vw",
        height: "auto",
        backgroundColor: "black",
        zIndex: "21000",
        display: "none",
      });
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      document.body.appendChild(video);
    }

    video.style.display = "block";

    try {
      await video.play();
      console.log("動画再生開始");
    } catch (err) {
      console.error("動画再生失敗:", err);
      alert("動画再生に失敗しました。画面をクリックして再試行してください。");
      return;
    }

    video.onended = () => {
      console.log("動画終了");
      video.style.display = "none";

      // 黒オーバーレイ1秒かけてフェードアウト
      blackOverlay.style.transition = "opacity 1s ease";
      blackOverlay.style.opacity = "0";
      blackOverlay.style.pointerEvents = "none";

      blackOverlay.addEventListener("transitionend", () => {
        if (typeof startGameMain === "function") {
          startGameMain();
        }
      }, { once: true });
    };
  }

  // 以下、タイトル画面既存の動作

  // 初期非表示設定
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = "0";
  });
  if (titleImg1) titleImg1.style.display = "none";
  if (titleImg2) titleImg2.style.display = "none";
  if (pressKeyText) {
    pressKeyText.style.display = "none";
    pressKeyText.style.opacity = "0";
  }
  if (fullscreenEffect) {
    fullscreenEffect.style.display = "none";
    fullscreenEffect.style.opacity = "0";
  }

  // センターテキストクリックで開始
  if (centerText) {
    centerText.addEventListener("click", () => {
      if (started) return;
      started = true;
      fadeOut(centerText, 500).then(() => {
        showNextLogo();
      });
    });
  }

  // ロゴの順番表示
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

  // 全画面効果
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
    if (!backgroundOverlay) return;

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

    if (bgm) {
      bgm.loop = true;
      try {
        await bgm.play();
      } catch {}
    }

    await new Promise(resolve => setTimeout(resolve, 2100));
  }

  // タイトル画像表示
  async function showTitleImages() {
    if (!titleImg1 || !titleImg2 || !pressKeyText) return;

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
    if (backgroundOverlay) backgroundOverlay.style.display = "none";
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

    const rect = titleImg2 ? titleImg2.getBoundingClientRect() : { bottom: window.innerHeight / 2 };

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
      item.style.cursor = "pointer";
      item.style.padding = "10px 20px";
      item.style.borderRadius = "8px";
      item.style.userSelect = "none";
      item.dataset.index = i;
      item.style.transition = "background-color 0.3s ease, color 0.3s ease";

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
    for (let i = 0; i < children.length; i++) {
      const item = children[i];
      if (i === selectedIndex) {
        if (isInputMode) {
          item.style.backgroundColor = "#f90";
          item.style.color = "#000";
        } else {
          item.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
          item.style.color = "#fff";
        }
      } else {
        item.style.backgroundColor = "transparent";
        item.style.color = "#ccc";
      }
    }
  }

  // キーボード操作でメニュー選択
  function attachMenuKeyboardListeners() {
    window.addEventListener("keydown", e => {
      if (!menuWrapper) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length;
        isInputMode = false;
        updateMenuHighlight();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % menuItems.length;
        isInputMode = false;
        updateMenuHighlight();
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex === -1) return;
        if (!isInputMode) {
          isInputMode = true;
          updateMenuHighlight();
        } else {
          if (menuItems[selectedIndex] === "New Game") {
            onNewGameClicked();
          } else {
            alert(`"${menuItems[selectedIndex]}" が選択されました！`);
          }
        }
      } else if (e.key === "Escape") {
        if (isInputMode) {
          isInputMode = false;
          updateMenuHighlight();
        }
      }
    });
  }

});
