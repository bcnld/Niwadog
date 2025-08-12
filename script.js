document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("fullscreen-toggle");

  btn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      // 全画面でなければ全画面に切り替え
      document.documentElement.requestFullscreen().catch((err) => {
        alert(`全画面にできませんでした: ${err.message}`);
      });
    } else {
      // 全画面中なら解除
      document.exitFullscreen();
    }
  });

  // 全画面状態が変わったらボタンテキストを更新
  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      btn.textContent = "全画面解除";
    } else {
      btn.textContent = "全画面切替";
    }
  });
});

function startGameMain() {
  // タイトル画面系のUIを非表示
  document.getElementById("menu-wrapper")?.remove();
  const titleImages = document.getElementById("title-images");
  if (titleImages) titleImages.style.display = "none";
  const pressAnyKey = document.getElementById("press-any-key");
  if (pressAnyKey) pressAnyKey.style.display = "none";
  const backgroundOverlay = document.getElementById("background-overlay");
  if (backgroundOverlay) backgroundOverlay.style.display = "none";
  document.querySelectorAll(".company-logo").forEach(el => el.style.display = "none");
  const centerText = document.getElementById("center-text");
  if (centerText) centerText.style.display = "none";

  // ゲーム画面を表示
  const gameScreen = document.getElementById("game-screen");
  if (gameScreen) gameScreen.style.display = "block";

  // タイトルBGM停止
  const titleBgm = document.getElementById("bgm");
  if (titleBgm) {
    titleBgm.pause();
    titleBgm.currentTime = 0;
  }

  // ここからゲーム本編の初期化処理を開始する例
  // 例：犬を水中エリアに表示する処理呼び出し
  if (typeof spawnDogs === "function") {
    spawnDogs();
  }
  // 例：他にゲーム開始時に必要な処理があればここに書く
}
