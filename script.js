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
