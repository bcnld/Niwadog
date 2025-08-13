let introVideo;

document.addEventListener("DOMContentLoaded", () => {
  // 全画面切替
  const btn = document.getElementById("fullscreen-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => alert(`全画面にできませんでした: ${err.message}`));
      } else {
        document.exitFullscreen();
      }
    });
  }

  // New Gameボタン
  const newGameBtn = document.getElementById("newgame-btn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      prepareIntroMovie();      // 動画事前ロード
      showVideoConfirm();       // 再生確認テロップ
    });
  }
});

function prepareIntroMovie() {
  introVideo = document.getElementById("intro-movie");
  if (!introVideo) return;

  introVideo.style.display = "none";
  introVideo.muted = true;
  introVideo.currentTime = 0;
  introVideo.load();

  introVideo.play().then(() => {
    introVideo.pause();
    introVideo.currentTime = 0;
    introVideo.muted = false;
  }).catch(err => console.warn("動画事前再生失敗:", err));
}

function showVideoConfirm() {
  const overlay = document.createElement("div");
  overlay.id = "video-confirm-overlay";
  overlay.style.cssText = `
    position: fixed; top:0; left:0; width:100%; height:100%;
    background: rgba(0,0,0,0.8);
    display: flex; justify-content: center; align-items: center;
    color: white; font-size: 28px; text-align: center;
    z-index: 10000; cursor: pointer;
  `;
  overlay.innerHTML = `動画を再生しますか？<br>クリックで再生`;

  document.body.appendChild(overlay);

  overlay.addEventListener("click", () => {
    overlay.remove();
    startFadeOutAndPlayMovie();
  });
}

function startFadeOutAndPlayMovie() {
  const fadeOverlay = document.getElementById("fade-overlay");
  const titleBgm = document.getElementById("bgm");
  if (!fadeOverlay) return;

  fadeOverlay.style.pointerEvents = "auto";
  fadeOverlay.style.transition = "opacity 1s ease";
  fadeOverlay.style.opacity = "1";

  if (titleBgm) fadeOutAudio(titleBgm, 1000);

  setTimeout(showIntroMovie, 1000);
}

function fadeOutAudio(audio, duration = 1000) {
  if (!audio) return;
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
    }
  }, stepTime);
}

function showIntroMovie() {
  if (!introVideo) return;

  introVideo.style.display = "block";
  introVideo.currentTime = 0;
  introVideo.muted = false;

  introVideo.play().catch(err => console.error("動画再生失敗:", err));

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

function startGameMain() {
  document.getElementById("menu-wrapper")?.remove();
  document.getElementById("title-images")?.style.display = "none";
  document.getElementById("press-any-key")?.style.display = "none";
  document.getElementById("background-overlay")?.style.display = "none";
  document.querySelectorAll(".company-logo").forEach(el => el.style.display = "none");
  document.getElementById("center-text")?.style.display = "none";

  const gameScreen = document.getElementById("game-screen");
  if (gameScreen) gameScreen.style.display = "block";

  if (typeof spawnDogs === "function") spawnDogs();
}
