document.addEventListener("DOMContentLoaded", () => {
  // ---------- 要素取得 ----------
  const centerText = document.getElementById("center-text");
  const bgm = document.getElementById("bgm");
  const titleImg1 = document.getElementById("title-img1");
  const titleImg2 = document.getElementById("title-img2");
  const pressKeyText = document.getElementById("press-any-key");
  const fullscreenBtn = document.getElementById("fullscreen-toggle");
  const selectSfx = document.getElementById("select-sfx");
  const introVideo = document.getElementById("intro-movie");
  const gameScreen = document.getElementById("game-screen");

  let menuWrapper, selectedIndex = 0, isInputMode = false;

  // ---------- センターテキストクリック ----------
  centerText.addEventListener("click", () => {
    centerText.style.display = "none";
    showTitleImages();
  });

  // ---------- タイトル画像表示 ----------
  function showTitleImages() {
    titleImg1.style.display = "block";
    titleImg2.style.display = "block";
    createMenu();
  }

  // ---------- メニュー ----------
  const menuItems = ["New Game", "Load", "Settings"];

  function createMenu() {
    menuWrapper = document.createElement("div");
    Object.assign(menuWrapper.style, {
      position: "fixed",
      top: "70%",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      fontSize: "24px",
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      zIndex: "10000",
    });

    menuItems.forEach((text, i) => {
      const item = document.createElement("div");
      item.textContent = text;
      item.dataset.index = i;
      item.style.cursor = "pointer";
      item.style.userSelect = "none";

      item.addEventListener("click", () => {
        selectedIndex = i;
        isInputMode = true;
        updateMenuHighlight();
        if (menuItems[i] === "New Game") startNewGame();
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
      if (i === selectedIndex) {
        item.style.backgroundColor = isInputMode ? "#f90" : "#555";
        item.style.color = isInputMode ? "#000" : "#fff";
        if (selectSfx) {
          try { selectSfx.currentTime = 0; selectSfx.play(); } catch {}
        }
      } else {
        item.style.backgroundColor = "transparent";
        item.style.color = "#fff";
      }
    }
  }

  function attachMenuKeyboardListeners() {
    window.addEventListener("keydown", (e) => {
      if (!menuWrapper) return;
      if (e.key === "ArrowDown") { selectedIndex = (selectedIndex + 1) % menuItems.length; isInputMode = false; updateMenuHighlight(); }
      else if (e.key === "ArrowUp") { selectedIndex = (selectedIndex - 1 + menuItems.length) % menuItems.length; isInputMode = false; updateMenuHighlight(); }
      else if (e.key === "Enter") {
        isInputMode = true;
        updateMenuHighlight();
        if (menuItems[selectedIndex] === "New Game") startNewGame();
      }
    });
  }

  // ---------- New Game: イントロ動画再生後ゲーム画面 ----------
  function startNewGame() {
    if (menuWrapper) menuWrapper.style.display = "none";
    if (bgm) { bgm.pause(); bgm.currentTime = 0; }

    introVideo.style.display = "block";
    introVideo.play();

    introVideo.addEventListener("ended", onVideoEnd);
    introVideo.addEventListener("click", onVideoEnd); // タップ/クリックでスキップ

    function onVideoEnd() {
      introVideo.pause();
      introVideo.style.display = "none";
      gameScreen.style.display = "block";
      if (typeof startIntroSequence === "function") startIntroSequence();
      introVideo.removeEventListener("ended", onVideoEnd);
      introVideo.removeEventListener("click", onVideoEnd);
    }
  }

  // ---------- 全画面切替 ----------
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
      else document.exitFullscreen().catch(()=>{});
    });
  }
});
