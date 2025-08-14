let introVideo;

document.addEventListener("DOMContentLoaded", () => {
  // ---------- 全画面切替 ----------
  document.getElementById("fullscreen-toggle")?.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => alert(err.message));
    } else {
      document.exitFullscreen();
    }
  });

  // ---------- New Gameボタン ----------
  document.getElementById("newgame-btn")?.addEventListener("click", () => {
    prepareIntroMovie();
    fadeOutTitleAndShowPrompt();
  });
});

// ---------- 動画準備 ----------
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

// ---------- タイトルフェードアウト → テロップ → 動画再生 ----------
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

  // transitionend が確実に発火しない場合があるので timeout で代替
  setTimeout(() => {
    showVideoPrompt();
  }, 1100);
}

// ---------- テロップ表示 ----------
function showVideoPrompt() {
  const prompt = document.createElement("div");
  prompt.textContent = "動画を再生しますか？";
  Object.assign(prompt.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "2rem",
    color: "#fff",
    background: "rgba(0,0,0,0.7)",
    padding: "20px 40px",
    borderRadius: "8px",
    zIndex: "6001",
    textAlign: "center",
    pointerEvents: "none",
  });
  document.body.appendChild(prompt);

  setTimeout(() => {
    prompt.remove();
    playIntroVideo();
  }, 2000);
}

// ---------- BGMフェードアウト ----------
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

// ---------- 動画再生 ----------
function playIntroVideo() {
  if (!introVideo) return;
  introVideo.style.display = "block";
  introVideo.currentTime = 0;
  introVideo.muted = false;
  introVideo.play().catch(() => {});

  introVideo.onended = () => {
    introVideo.style.display = "none";
    const fadeOverlay = document.getElementById("fade-overlay");
    fadeOverlay.style.opacity = "0";
    fadeOverlay.style.pointerEvents = "none";
    startGameMain();
  };
}

// ---------- ゲーム画面表示 ----------
function startGameMain() {
  document.getElementById("menu-wrapper")?.remove();
  document.getElementById("game-screen").style.display = "block";
  if (typeof spawnDogs === "function") spawnDogs();
}
