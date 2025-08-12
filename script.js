document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("fullscreen-toggle");

  btn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        alert(`全画面にできませんでした: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      btn.textContent = "全画面解除";
    } else {
      btn.textContent = "全画面切替";
    }
  });

  const newGameBtn = document.getElementById("newgame-btn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      startFadeOutAndPlayMovie();
    });
  }
});

function startFadeOutAndPlayMovie() {
  const titleBgm = document.getElementById("bgm");

  let fadeOverlay = document.getElementById("fade-overlay");
  if (!fadeOverlay) {
    fadeOverlay = document.createElement("div");
    fadeOverlay.id = "fade-overlay";
    Object.assign(fadeOverlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "black",
      opacity: "0",
      transition: "opacity 4s ease",
      zIndex: "5000",
      pointerEvents: "none",
    });
    document.body.appendChild(fadeOverlay);
  }

  fadeOverlay.style.pointerEvents = "auto";
  fadeOverlay.style.opacity = "1";

  // BGMフェードアウト用
  function startFadeOutAndPlayMovie() {
  const titleBgm = document.getElementById("bgm");

  let fadeOverlay = document.getElementById("fade-overlay");
  if (!fadeOverlay) {
    fadeOverlay = document.createElement("div");
    fadeOverlay.id = "fade-overlay";
    Object.assign(fadeOverlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "black",
      opacity: "0",
      transition: "opacity 4s ease",
      zIndex: "5000",
      pointerEvents: "none",
    });
    document.body.appendChild(fadeOverlay);
  }

  fadeOverlay.style.pointerEvents = "auto";
  fadeOverlay.style.opacity = "1";

  // 4秒フェードイン暗転後 → 1秒待ち → BGMを1秒フェードアウト → 1秒待ち → 動画再生開始
  setTimeout(() => {
    setTimeout(() => {
      if (titleBgm) {
        fadeOutAudio(titleBgm, 1000).then(() => {
          // ここに1秒の遅延追加
          setTimeout(() => {
            playIntroMovie();
          }, 1000);
        });
      } else {
        setTimeout(() => {
          playIntroMovie();
        }, 1000);
      }
    }, 1000);
  }, 4000);
}
  
async function playIntroMovie() {
  let video = document.getElementById("intro-movie");
  if (!video) {
    video = document.createElement("video");
    video.id = "intro-movie";
    video.src = "movie/intro.mp4";
    video.style.position = "fixed";
    video.style.top = "50%";
    video.style.left = "50%";
    video.style.transform = "translate(-50%, -50%)";
    video.style.width = "80vw";
    video.style.height = "auto";
    video.style.zIndex = "6000";
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    document.body.appendChild(video);
  }

  video.style.display = "block";
  video.style.visibility = "visible";
  video.style.pointerEvents = "auto";

  video.muted = true; // 自動再生許可のためにミュート
  try {
    await video.play();
    video.muted = false; // ここで音戻したければ戻す
  } catch (error) {
    console.warn("動画自動再生失敗:", error);
  }

  video.onended = () => {
    video.style.display = "none";
    const fadeOverlay = document.getElementById("fade-overlay");
    if (fadeOverlay) {
      fadeOverlay.style.opacity = "0";
      fadeOverlay.style.pointerEvents = "none";
    }
    startGameMain();
  };
}

function startGameMain() {
  document.getElementById("menu-wrapper")?.remove();
  document.getElementById("title-images")?.style.display = "none";
  document.getElementById("press-any-key")?.style.display = "none";
  document.getElementById("background-overlay")?.style.display = "none";
  document.querySelectorAll(".company-logo").forEach(el => el.style.display = "none");
  document.getElementById("center-text")?.style.display = "none";

  // title-img2 をフェードアウトして非表示に
  const titleImg2 = document.getElementById("title-img2");
  if (titleImg2) {
    titleImg2.style.transition = "opacity 1s ease";
    titleImg2.style.opacity = "0";
    setTimeout(() => {
      titleImg2.style.display = "none";
    }, 1000);
  }

  const gameScreen = document.getElementById("game-screen");
  if (gameScreen) {
    gameScreen.style.display = "block";
  }

  if (typeof spawnDogs === "function") {
    spawnDogs();
  }
}


