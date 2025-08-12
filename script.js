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
  document.getElementById("title-images").style.display = "none";
  document.getElementById("press-any-key").style.display = "none";
  document.getElementById("background-overlay").style.display = "none";
  document.querySelectorAll(".company-logo").forEach(el => el.style.display = "none");
  document.getElementById("center-text").style.display = "none";

  // ゲーム画面を表示
  const gameScreen = document.getElementById("game-screen");
  if (gameScreen) gameScreen.style.display = "block";

  // タイトルBGM停止
  const titleBgm = document.getElementById("bgm");

