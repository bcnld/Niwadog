document.addEventListener("DOMContentLoaded", () => {
  const logos = document.querySelectorAll(".company-logo");
  const pressAnyKey = document.getElementById("press-any-key");
  const background = document.getElementById("background");

  // 最初に全部のロゴを透明にする
  logos.forEach(logo => {
    logo.style.opacity = 0;
  });

  let index = 0;

  function showNextLogo() {
    if (index >= logos.length) {
      background.style.filter = "blur(0px)";
      background.style.transform = "scale(1)";
      setTimeout(() => {
        pressAnyKey.style.opacity = 1;
        blinkPressText();
      }, 2000);
      return;
    }

    const logo = logos[index];
    logo.style.opacity = 1;

    setTimeout(() => {
      logo.style.opacity = 0;
      index++;
      setTimeout(showNextLogo, 1000);
    }, 2000);
  }

  function blinkPressText() {
    setInterval(() => {
      pressAnyKey.style.opacity = pressAnyKey.style.opacity == 1 ? 0 : 1;
    }, 800);
  }

  showNextLogo();
});
