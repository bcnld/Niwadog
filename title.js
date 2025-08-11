document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  let currentIndex = 0;

  // 最初は全てのロゴ非表示＆透明に
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = 0;
  });

  function showNextLogo() {
    if (currentIndex >= logos.length) {
      // ロゴ全部表示終わったら終わり
      return;
    }

    const logo = logos[currentIndex];
    logo.style.display = "block";

    // 少し遅延させてからフェードイン（opacity=1）
    setTimeout(() => {
      logo.classList.add("active");
    }, 50);

    // 2秒表示したあとフェードアウト
    setTimeout(() => {
      logo.classList.remove("active");
      // フェードアウト後に非表示にして次のロゴへ
      setTimeout(() => {
        logo.style.display = "none";
        currentIndex++;
        showNextLogo();
      }, 1000); // フェードアウトに合わせる
    }, 2000);
  }

  centerText.addEventListener("click", () => {
    // 文字をフェードアウトして非表示にする
    centerText.style.opacity = 0;
    setTimeout(() => {
      centerText.style.display = "none";
      // 企業ロゴの順番表示開始
      showNextLogo();
    }, 500);
  });
});
