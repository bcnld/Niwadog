document.addEventListener("DOMContentLoaded", () => {
  const questionOverlay = document.getElementById("question-overlay");
  const yesBtn = document.getElementById("question-yes-btn");

  yesBtn.addEventListener("click", () => {
    questionOverlay.classList.remove("active");
    // ここで次の処理を入れてもOK
    console.log("質問モーダルを閉じました");
  });
});
