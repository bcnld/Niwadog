document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  let currentIndex = 0;
  let started = false; // クリックで開始済みフラグ

  // 初期非表示
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = 0;
  });

  function showNextLogo() {
    if (currentIndex >= logos.length) {
      console.log("全てのロゴ表示終了");
      return;
    }

    const logo = logos[currentIndex];
    logo.style.display = "block";

    setTimeout(() => {
      logo.classList.add("active");
      console.log(`ロゴ${currentIndex + 1}フェードイン`);
    }, 50);

    setTimeout(() => {
      logo.classList.remove("active");
      console.log(`ロゴ${currentIndex + 1}フェードアウト`);
      setTimeout(() => {
        logo.style.display = "none";
        currentIndex++;
        showNextLogo();
      }, 1000);
    }, 2000);
  }

  centerText.addEventListener("click", () => {
    if (started) return; // 2回以上押せないように
    started = true;

    console.log("文字クリックでスタート");
    centerText.style.opacity = 0;
    setTimeout(() => {
      centerText.style.display = "none";
      showNextLogo();
    }, 500);
  });
});
