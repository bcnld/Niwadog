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
  const selectSfx = document.getElementById("select-sfx"); // 追加：選択時効果音

  let currentIndex = 0;
  let started = false;

  // 企業ロゴ中央固定、前面に表示
  logos.forEach(logo => {
    logo.style.position = "fixed";
    logo.style.top = "50%";
    logo.style.left = "50%";
    logo.style.transform = "translate(-50%, -50%)";
    logo.style.zIndex = "9998";
  });

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
    // フェードインをゆっくり3秒に変更
    fullscreenEffect.style.transition = "opacity 3s ease, transform 3s ease";
    fullscreenEffect.style.opacity = "1";
    fullscreenEffect.style.transform = "translate(-50%, -50%) scale(1)";

    // 表示時間はそのまま2秒待機
    await new Promise(resolve => setTimeout(resolve, 2000));

    // フェードアウトも3秒かけてゆっくり消える
    fullscreenEffect.style.transition = "opacity 3s ease";
    fullscreenEffect.style.opacity = "0";

    await new Promise(resolve => setTimeout(resolve, 3000));
    fullscreenEffect.style.display = "none";
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
    pressKeyText.style.opacity = "0";
    requestAnimationFrame(() => {
      pressKeyText.style.opacity = "1";
    });

    waitForPressKey();
  }

  function waitForPressKey() {
    async function onInput() {
      window.removeEventListener("keydown", onInput, true);
      window.removeEventListener("touchstart", onInput, true);

      await fadeOut(pressKeyText, 800);
      await fadeOut(backgroundOverlay, 1500);

      startBackgroundScroll();
      createMenu();  // メニュー作成
    }
    window.addEventListener("keydown", onInput, { capture: true });
    window.addEventListener("touchstart", onInput, { capture: true });
  }

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

  // --- スクロール背景 ---

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
      let newX = currentX - scrollSpeed; // 左スクロール
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

  // --- メニュー作成と選択処理 ---

  const menuItems = ["New Game", "Load", "Settings"];
  let selectedIndex = null;
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

    menuWrapper.style.zIndex = "10000";
    menuWrapper.style.display = "flex";
    menuWrapper.style.flexDirection = "column"; // 縦並びに変更
    menuWrapper.style.gap = "12px";              // 間隔調整
    menuWrapper.style.fontSize = "24px";
    menuWrapper.style.fontWeight = "bold";
    menuWrapper.style.color = "#fff";
    menuWrapper.style.textShadow = "0 0 5px black";

    menuItems.forEach((text, i) => {
      const item = document.createElement("div");
      item.textContent = text;
      item.style.cursor = "pointer";
      item.style.padding = "10px 20px";
      item.style.borderRadius = "8px";
      item.style.userSelect = "none";
      item.dataset.index = i;

      item.style.transition = "background-color 0.3s ease, color 0.3s ease";

      // クリック処理
      item.addEventListener("click", () => {
        if (selectedIndex === i && isInputMode) {
          // 2回目クリックで「決定」処理
          alert(`"${menuItems[i]}" が選択されました！`);
          // 必要ならここにゲーム開始や設定画面など処理追加
        } else {
          // 1回目クリックで選択切替
          selectedIndex = i;
          isInputMode = true;
          updateMenuHighlight();
        }
      });

      // マウスホバーで選択切替（PC用）
      item.addEventListener("mouseenter", () => {
        if (selectedIndex !== i) {
          selectedIndex = i;
          isInputMode = false; // ホバー時は入力モード解除（決定待ちじゃない状態）
          updateMenuHighlight();
        }
      });

      menuWrapper.appendChild(item);
    });

    document.body.appendChild(menuWrapper);

    // 画面外クリックで選択解除＆入力モード解除
    window.addEventListener("click", (e) => {
      if (!menuWrapper.contains(e.target)) {
        selectedIndex = null;
        isInputMode = false;
        updateMenuHighlight();
      }
    });

    updateMenuHighlight();
  }

  function updateMenuHighlight() {
    if (!menuWrapper) return;
    const children = menuWrapper.children;
    let playedSfxThisUpdate = false; // 連続再生防止用フラグ
    for (let i = 0; i < children.length; i++) {
      const item = children[i];
      if (i === selectedIndex) {
        if (isInputMode) {
          item.style.backgroundColor = "#f90"; // 入力モード強調色
          item.style.color = "#000";
        } else {
          item.style.backgroundColor = "#555"; // 選択モード色
          item.style.color = "#fff";
        }
        // 効果音再生（選択が変わったタイミングで）
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

  // 初期非表示セット
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

  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(() => {
      showNextLogo();
    });
  });
});
