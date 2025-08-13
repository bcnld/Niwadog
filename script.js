let introVideo; // グローバル変数で保持

document.addEventListener("DOMContentLoaded", () => {
  // 全画面切替ボタン
  const btn = document.getElementById("fullscreen-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          alert(`全画面にできませんでした: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  // 既存のNew Gameボタン
  const newGameBtn = document.getElementById("newgame-btn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      prepareIntroMovie();      // 動画事前ロード
      startFadeOutAndPlayMovie(); // フェードアウト＋動画再生
    });
  }
});

/**
 * 動画の準備（最初はミュートでロード）
 */
function prepareIntroMovie() {
  introVideo = document.getElementById("intro-movie");
  if (!introVideo) {
    console.error("intro-movie 要素が見つかりません");
    return;
  }

  introVideo.style.display = "none";
  introVideo.muted = true;  // 自動再生制限対策
  introVideo.currentTime = 0;
  introVideo.load();

  // 一度再生して即停止（ブラウザに読み込みさせる）
  introVideo.play()
    .then(() => {
      introVideo.pause();
      introVideo.currentTime = 0;
      introVideo.muted = false; // 本再生は音あり
    })
    .catch(err => console.warn("動画事前再生失敗:", err));
}

/**
 * フェードアウト処理＆BGMフェード → 動画再生
 */
function startFadeOutAndPlayMovie() {
  const titleBgm = document.getElementById("bgm");
  const fadeOverlay = document.getElementById("fade-overlay");

  if (!fadeOverlay) {
    console.error("fade-overlay 要素が存在しません");
    return;
  }

  fadeOverlay.style.pointerEvents = "auto";
  fadeOverlay.style.transition = "opacity 1s ease";
  fadeOverlay.style.opacity = "1";

  function fadeOutAudio(audio, duration = 1000) {
    return new Promise((resolve) => {
      if (!audio) return resolve();
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

  // フェードアウト後に動画再生
  setTimeout(() => {
    if (titleBgm) {
      fadeOutAudio(titleBgm, 1000).then(() => {
        setTimeout(showIntroMovie, 500);
      });
    } else {
      setTimeout(showIntroMovie, 500);
    }
  }, 1000);
}

/**
 * 動画表示＆再生
 */
function showIntroMovie() {
  if (!introVideo) return;

  introVideo.style.display = "block";
  introVideo.currentTime = 0;

  introVideo.play().catch(err => {
    console.error("動画再生失敗:", err);
  });

  introVideo.onended = () => {
    introVideo.style.display = "none";
    const fadeOverlay = document.getElementById("fade-overlay");
    if (fadeOverlay) {
      fadeOverlay.style.opacity = "0";
      fadeOverlay.style.pointerEvents = "none";
    }
    startGameMain();
  };
}

/**
 * ゲーム画面へ切り替え
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
