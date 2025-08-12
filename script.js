document.addEventListener("DOMContentLoaded", () => {
  // --- 既存コード ---
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

  // New Gameボタン処理を追加
  const newGameBtn = document.getElementById("newgame-btn");
  if (newGameBtn) {
    newGameBtn.addEventListener("click", () => {
      startFadeOutAndPlayMovie();
    });
  }
});

// フェードアウト→BGM停止→ムービー→ゲーム開始
function startFadeOutAndPlayMovie() {
  const titleBgm = document.getElementById("bgm");

  // フェードアウト用オーバーレイ
  let fadeOverlay = document.getElementById("fade-overlay");
  if (!fadeOverlay) {
    fadeOverlay = document.createElement("div");
    fadeOverlay.id = "fade-overlay";
    Object.assign(fadeOverlay.style, {
      position: "fixed",
      top: "0", left: "0",
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

  // フェードアウト開始
  fadeOverlay.style.pointerEvents = "auto";
  fadeOverlay.style.opacity = "1";

  // 4秒後（フェード完了）
  setTimeout(() => {
    // さらに1秒間真っ黒保持 → BGM停止
    setTimeout(() => {
      if (titleBgm) {
        titleBgm.pause();
        titleBgm.currentTime = 0;
      }

      // さらに1秒後にムービー開始
      setTimeout(() => {
        let video = document.getElementById("intro-movie");
        if (!video) {
          video = document.createElement("video");
          video.id = "intro-movie";
          video.src = "movie/intro.mp4"; // ムービーのパス
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
        video.play();

        // ムービー終了時
        video.onended = () => {
          video.style.display = "none";
          fadeOverlay.style.opacity = "0";
          fadeOverlay.style.pointerEvents = "none";

          startGameMain();
        };
      }, 1000); // BGM停止後さらに1秒
    }, 1000); // フェード後の暗転キープ
  }, 4000); // フェード時間
}

// ゲーム本編開始処理
function startGameMain() {
  document.getElementById("menu-wrapper")?.remove();
  document.getElementById("title-images")?.style.setProperty("display", "none");
  document.getElementById("press-any-key")?.style.setProperty("display", "none");
  document.getElementById("background-overlay")?.style.setProperty("display", "none");
  document.querySelectorAll(".company-logo").forEach(el => el.style.display = "none");
  document.getElementById("center-text")?.style.setProperty("display", "none");

  const gameScreen = document.getElementById("game-screen");
  if (gameScreen) gameScreen.style.display = "block";

  if (typeof spawnDogs === "function") {
    spawnDogs();
  }
}
