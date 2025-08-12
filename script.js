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
  if(newGameBtn){
    newGameBtn.addEventListener("click", () => {
      startFadeOutAndPlayMovie();
    });
  }
});

// フェードアウト→ムービー→ゲーム開始の関数
function startFadeOutAndPlayMovie(){
  // フェードアウト用オーバーレイ作成または取得
  let fadeOverlay = document.getElementById("fade-overlay");
  if(!fadeOverlay){
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

  // フェードアウト開始（4秒かけてopacity 0→1）
  fadeOverlay.style.pointerEvents = "auto"; // 操作ブロック
  fadeOverlay.style.opacity = "1";

  // 4秒後に1秒真っ黒をキープしてムービー再生
  setTimeout(() => {
    // ムービー再生用video要素を作るか既存要素を取得
    let video = document.getElementById("intro-movie");
    if(!video){
      video = document.createElement("video");
      video.id = "intro-movie";
      video.src = "movie/intro.mp4"; // ここにムービーファイルのパス
      video.style.position = "fixed";
      video.style.top = "50%";
      video.style.left = "50%";
      video.style.transform = "translate(-50%, -50%)";
      video.style.width = "80vw";
      video.style.height = "auto";
      video.style.zIndex = "6000";
      document.body.appendChild(video);
    }

    // 1秒の真っ黒キープ後にムービー再生開始
    setTimeout(() => {
      video.style.display = "block";
      video.play();

      // ムービー終わったらゲーム画面開始＆フェードアウト解除
      video.onended = () => {
        video.style.display = "none";
        fadeOverlay.style.opacity = "0";
        fadeOverlay.style.pointerEvents = "none";

        // ゲーム開始関数呼び出し
        startGameMain();
      };
    }, 1000);

  }, 4000);
}
