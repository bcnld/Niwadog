// 完全版JS（質問モーダル制御）
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("question-overlay");
  const yesBtn = document.getElementById("question-yes-btn");

  yesBtn.addEventListener("click", () => {
    // モーダル非表示にする
    overlay.classList.remove("active");
  });
});
