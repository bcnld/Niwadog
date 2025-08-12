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

  // 4秒フェードイン暗転後、1秒待ち、BGMを1秒フェードアウトしてから動画再生開始
  setTimeout(() => {
    setTimeout(() => {
      if (titleBgm) {
        fadeOutAudio(titleBgm, 1000).then(() => {
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

function playIntroMovie() {
  let video = document.getElementById("intro-movie");
  if (!video) {
    video = document.createElement("video");
    video.id = "intro-movie";
    video.src = "movie/intro.mp4"; // 動画パスを確認してください
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

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn("動画再生失敗:", error);
      // ユーザー操作待ちなどで再生を試みる処理を入れてもよい
    });
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
