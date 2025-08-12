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
  let scrollWrapper = null; // 背景スクロールラッパー参照保持

  logos.forEach(logo => {
    logo.style.position = "fixed";
    logo.style.top = "50%";
    logo.style.left = "50%";
    logo.style.transform = "translate(-50%, -50%)";
    logo.style.zIndex = "9998";
  });

  // --- fadeIn/fadeOut関数は省略せず再掲 ---
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

  // --- 他の関数は省略せず保持 ---
  async function showFullscreenEffect() { /* ...省略... */ }
  async function fadeInBackgroundImage() { /* ...省略... */ }
  async function showTitleImages() { /* ...省略... */ }
  function waitForPressKey() { /* ...省略... */ }
  async function showNextLogo() { /* ...省略... */ }
  function createBgDiv(x) { /* ...省略... */ }
  function animateScrollingBackground() { /* ...省略... */ }
  function startBackgroundScroll() {
    backgroundOverlay.style.display = "none";
    scrollWrapper = document.createElement("div");
    scrollWrapper.id = "scroll-wrapper";
    scrollWrapper.style.position = "fixed";
    scrollWrapper.style.top = "0";
    scrollWrapper.style.left = "0";
    scrollWrapper.style.width = `${window.innerWidth}px`;
    scrollWrapper.style.height = `${window.innerHeight}px`;
    scrollWrapper.style.overflow = "hidden";
    scrollWrapper.style.zIndex = "1";
    scrollWrapper.style.pointerEvents = "none";

    // 背景画像2つ設置
    const bgImageWidth = 3600;
    const bgImageHeight = window.innerHeight;

    function createDiv(x) {
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

    let bgElements = [];
    bgElements.push(createDiv(0));
    bgElements.push(createDiv(bgImageWidth));
    bgElements.forEach(div => scrollWrapper.appendChild(div));

    document.body.appendChild(scrollWrapper);

    function scroll() {
      for (let i = 0; i < bgElements.length; i++) {
        const div = bgElements[i];
        let currentX = parseFloat(div.style.left);
        let newX = currentX - 1; // scrollSpeed=1
        div.style.left = `${newX}px`;
      }

      const firstDiv = bgElements[0];
      if (parseFloat(firstDiv.style.left) + bgImageWidth <= 0) {
        const removed = bgElements.shift();
        if (removed.parentNode) removed.parentNode.removeChild(removed);
      }

      const lastDiv = bgElements[bgElements.length - 1];
      const lastRight = parseFloat(lastDiv.style.left) + bgImageWidth;
      if (lastRight <= window.innerWidth) {
        const newDiv = createDiv(lastRight);
        scrollWrapper.appendChild(newDiv);
        bgElements.push(newDiv);
      }
      requestAnimationFrame(scroll);
    }
    animateScrollingBackground = scroll; // 外部から呼べるように
    animateScrollingBackground();
  }

  // --- メニュー作成・選択 ---
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

    menuWrapper.style.zIndex = "10000";
    menuWrapper.style.display = "flex";
    menuWrapper.style.flexDirection = "column";
    menuWrapper.style.gap = "12px";
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
      if (isInputMode) {
        isInputMode = false;
        updateMenuHighlight();
      }
    }
  }

  // --- ここがNew Game押したときの処理 ---
  async function onNewGameClicked() {
    // 1. メニュー非表示
    if (menuWrapper) {
      menuWrapper.style.display = "none";
    }
    // 2. 背景スクロール（scrollWrapper）があればフェードアウト
    if (!scrollWrapper) {
      alert("背景がありません");
      return;
    }

    await fadeOut(scrollWrapper, 2000);

    // 3. BGMをフェードアウト（ゆっくり音量を下げる）
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
      bgm.volume = 1; // 次回のために元に戻す
    }

    // 4. 動画を表示・再生
    let video = document.getElementById("intro-video");
    if (!video) {
      video = document.createElement("video");
      video.id = "intro-video";
      video.src = "videos/intro.mp4"; // 動画ファイルパスは適宜変更してください
      video.style.position = "fixed";
      video.style.top = "50%";
      video.style.left = "50%";
      video.style.transform = "translate(-50%, -50%)";
      video.style.zIndex = "30000";
      video.style.width = "80vw";
      video.style.height = "auto";
      video.style.backgroundColor = "black";
      video.setAttribute("playsinline", ""); // モバイル対応
      document.body.appendChild(video);
    } else {
      video.style.display = "block";
    }

    try {
      await video.play();
    } catch (e) {
      alert("動画の再生に失敗しました。ブラウザの設定をご確認ください。");
      console.error(e);
    }

    // 5. 動画再生終了を待つ
    await new Promise(resolve => {
      video.onended = () => resolve();
      // 念のため再生が止まった場合にも終了判定
      video.onpause = () => {
        if (video.currentTime >= video.duration) resolve();
      };
    });

    // 6. 動画非表示にして削除
    video.style.display = "none";
    video.pause();
    video.currentTime = 0;
    if (video.parentNode) {
      video.parentNode.removeChild(video);
    }

    // 7. ゲーム本編開始関数呼び出し
    if (typeof startGameMain === "function") {
      startGameMain();
    } else {
      alert("ゲーム開始関数 startGameMain がありません");
    }
  }
