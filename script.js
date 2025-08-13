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

  // New Gameボタン
  const newGameBtn = document.getElementById("newgame-btn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      prepareIntroMovie(); // 動画事前ロード
      showVideoConfirm();  // 再生確認テロップ表示
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
  introVideo.muted = true; // 自動再生制限対策
  introVideo.currentTime = 0;
  introVideo.load();

  // 一度再生して即停止してブラウザに読み込ませる
  introVideo.play()
    .then(() => {
      introVideo.pause();
      introVideo.currentTime = 0;
      introVideo.muted = false; // 本再生は音あり
    })
    .catch(err => console.warn("動画事前再生失敗:", err));
}

/**
 * 動画再生確認テロップ
 */
function showVideoConfirm() {
  const overlay = document.createElement("div");
  overlay.id = "video-confirm-overlay";
  overlay.style.cssText = `
    position: fixed;
    top:0; left:0; width:100%; height:100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 28px;
    text-align: center;
    z-index: 10000;
    cursor: pointer;
  `;
  overlay.innerHTML = `動画を再生しますか？<br>クリックで再生`;

  document.body.appendChild(overlay);

  overlay.addEventListener("click", () => {
    overlay.remove();
    startFadeOutAndPlayMovie();
  });
}

/**
 * フェードアウト処理＆BGMフェード → 動画再生
 */
function startFadeOutAndPlayMovie() {
  const fadeOverlay = document.getElementById("fade-overlay");
  const titleBgm = document.getElementById("bgm");

  if (!fadeOverlay) {
    console.error("fade-overlay 要素が存在しません");
    return;
  }

  // フェードイン
  fadeOverlay.style.pointerEvents = "auto";
  fadeOverlay.style.transition = "opacity 1s ease";
  fadeOverlay.style.opacity = "1";

  // BGMフェードアウト
  if (titleBgm) fadeOutAudio(titleBgm, 1000);

  // 1秒後に動画表示
  setTimeout(showIntroMovie, 1000);
}

/**
 * BGMをフェードアウト
 */
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

/**
 * 動画表示＆再生
 */
function showIntroMovie() {
  if (!introVideo) return;

  introVideo.style.display = "block";
  introVideo.currentTime = 0;
  introVideo.muted = false; // 音あり再生

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

  const gameScreen = document.getElementById("game-screen");
  if (gameScreen) gameScreen.style.display = "block";

  if (typeof spawnDogs === "function") spawnDogs();
}
