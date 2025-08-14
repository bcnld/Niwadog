let introVideo;

document.addEventListener("DOMContentLoaded", () => {
  // 全画面切替
  document.getElementById("fullscreen-toggle")?.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => alert(err.message));
    } else {
      document.exitFullscreen();
    }
  });

  // New Game
  document.getElementById("newgame-btn")?.addEventListener("click", () => {
    prepareIntroMovie();
    fadeOutTitleAndShowPrompt(); // ← テロップを挟む処理に変更
  });
});

// 動画準備
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
  }).catch(() => {});
}

// タイトルフェードアウト → テロップ → 動画再生
function fadeOutTitleAndShowPrompt() {
  const fadeOverlay = document.getElementById("fade-overlay");
  const titleBgm = document.getElementById("bgm");

  fadeOverlay.style.transition = "opacity 1s ease";
  fadeOverlay.style.opacity = "1";
  fadeOverlay.style.pointerEvents = "auto";

  // タイトル・ロゴを非表示
  document.getElementById("center-text")?.style.display = "none";
  document.getElementById("title-images")?.style.display = "none";
  document.getElementById("press-any-key")?.style.display = "none";
  document.querySelectorAll(".company-logo").forEach(el => el.style.display = "none");

  if (titleBgm) fadeOutAudio(titleBgm, 1000);

  fadeOverlay.addEventListener("transitionend", function handler() {
    fadeOverlay.removeEventListener("transitionend", handler);
    showVideoPrompt(); // ← フェード完了後にテロップ表示
  });
}

// テロップ表示
function showVideoPrompt() {
  const prompt = document.createElement("div");
  prompt.textContent = "動画を再生しますか？";
  prompt.style.position = "fixed";
  prompt.style.top = "50%";
  prompt.style.left = "50%";
  prompt.style.transform = "translate(-50%, -50%)";
  prompt.style.fontSize = "2rem";
  prompt.style.color = "#fff";
  prompt.style.background = "rgba(0,0,0,0.7)";
  prompt.style.padding = "20px 40px";
  prompt.style.borderRadius = "8px";
  prompt.style.zIndex = "1000";
  prompt.style.textAlign = "center";
  document.body.appendChild(prompt);

  // 2秒後に消して動画再生
  setTimeout(() => {
    prompt.remove();
    playIntroVideo();
  }, 2000);
}

// BGMフェードアウト
function fadeOutAudio(audio, duration = 1000) {
  if (!audio) return;
  const stepTime = 50;
  const steps = duration / stepTime;
  let currentStep = 0;
  const initialVolume = audio.volume || 1;

  const interval = setInterval(() => {
    currentStep++;
    audio.volume = initialVolume * (1 - currentStep / steps);
    if (currentStep >= steps) {
      clearInterval(interval);
      audio.volume = 0;
      audio.pause();
      audio.currentTime = 0;
    }
  }, stepTime);
}

// 動画再生
function playIntroVideo() {
  if (!introVideo) return;
  introVideo.style.display = "block";
  introVideo.currentTime = 0;
  introVideo.muted = false;
  introVideo.play().catch(() => {});

  introVideo.onended = () => {
    introVideo.style.display = "none";
    document.getElementById("fade-overlay").style.opacity = "0";
    document.getElementById("fade-overlay").style.pointerEvents = "none";
    startGameMain();
  };
}

// ゲーム画面表示
function startGameMain() {
  document.getElementById("menu-wrapper")?.remove();
  document.getElementById("game-screen").style.display = "block";
  if (typeof spawnDogs === "function") spawnDogs();
}
