let introVideo; // グローバルで保持

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
    btn.textContent = document.fullscreenElement ? "全画面解除" : "全画面切替";
  });

  const newGameBtn = document.getElementById("newgame-btn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      prepareIntroMovie(); // 動画要素作成
      startFadeOutAndPlayMovie();
    });
  }
});

/**
 * 動画作成＆自動再生保険（ミュートで一瞬再生→停止）
 */
function prepareIntroMovie() {
  introVideo = document.createElement("video");
  introVideo.id = "intro-movie";
  introVideo.src = "movie/intro.mp4";
  Object.assign(introVideo.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80vw",
    height: "auto",
    zIndex: "6000",
    display: "none",
  });
  introVideo.playsInline = true;
  introVideo.autoplay = false;
  introVideo.preload = "auto";
  introVideo.muted = true; // 一瞬だけミュート
  document.body.appendChild(introVideo);

  // 再生制限回避のために一瞬再生してすぐ停止
  introVideo.play().then(() => {
    introVideo.pause();
    introVideo.currentTime = 0;
    introVideo.muted = false; // 本再生は音あり
  }).catch(err => {
    console.warn("動画の事前再生失敗:", err);
  });
}

/**
 * フェードアウトとBGMフェード
 */
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

  function fadeOutAudio(audio, duration = 1000) {
    return new Promise((resolve) => {
      const stepTime = 50;
      const steps = duration / stepTime;
      let currentStep = 0;
      const initialVolume = audio.volume || 1;
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = initialVolume * (1 - currentStep / steps);
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          audio.volume = 0;
          audio.pause();
          audio.currentTime = 0;
          resolve();
        }
      }, stepTime);
    });
  }

  // 暗転4秒 → 1秒待機 → BGMフェード → 1秒後動画再生
  setTimeout(() => {
    setTimeout(() => {
      if (titleBgm) {
        fadeOutAudio(titleBgm, 1000).then(() => {
          setTimeout(showIntroMovie, 1000);
        });
      } else {
        setTimeout(showIntroMovie, 1000);
      }
    }, 1000);
  }, 4000);
}

/**
 * 動画を表示＆本再生
 */
function showIntroMovie() {
  if (introVideo) {
    introVideo.style.display = "block";
    introVideo.currentTime = 0;
    introVideo.play().catch(err => {
      console.error("動画再生失敗:", err);
    });

    introVideo.onended = () => {
      introVideo.remove();
      const fadeOverlay = document.getElementById("fade-overlay");
      if (fadeOverlay) {
        fadeOverlay.style.opacity = "0";
        fadeOverlay.style.pointerEvents = "none";
      }
      startGameMain();
    };
  }
}

/**
 * ゲーム画面に切り替え
 */
function startGameMain() {
  document.getElementById("menu-wrapper")?.remove();
  document.getElementById("title-images")?.style.display = "none";
  document.getElementById("press-any-key")?.style.display = "none";
  document.getElementById("background-overlay")?.style.display = "none";
  document.querySelectorAll(".company-logo").forEach(el => el.style.display = "none");
  document.getElementById("center-text")?.style.display = "none";

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
