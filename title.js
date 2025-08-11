document.addEventListener("DOMContentLoaded", () => {
  const logos = document.querySelectorAll(".company-logo");
  let index = 0;

  function showLogo(i) {
    if (i >= logos.length) {
      // すべて表示終わったら処理終了または次の処理へ
      return;
    }
    const logo = logos[i];

    // 表示開始
    logo.classList.add("active");

    // 2秒表示した後フェードアウト
    setTimeout(() => {
      logo.classList.remove("active");

      // 次のロゴ表示まで少し待つ
      setTimeout(() => {
        showLogo(i + 1);
      }, 500);
    }, 2000);
  }

  showLogo(index);
});
