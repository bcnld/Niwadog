document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");

  centerText.addEventListener("click", () => {
    centerText.style.display = "none";
    // ここに「次に進む」処理を書く
    console.log("クリックされたので非表示にしました");
  });
});
