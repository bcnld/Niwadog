document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");

  // 会社ロゴは最初非表示かつ透明に設定
  logos.forEach(logo => {
    logo.style.opacity = 0;
    logo.style.display = "none";
  });

  function fadeIn(element, duration = 1000, callback) {
    element.style.display = "block";
    element.style.opacity = 0;
    let opacity = 0;
    const interval = 50;
    const increment = interval / duration;

    function animate() {
      opacity += increment;
      if (opacity >= 1) {
        element.style.opacity = 1;
        if (callback) callback();
      } else {
        element.style.opacity = opacity;
        setTimeout(animate, interval);
      }
    }
    animate();
  }

  function fadeOut(element, duration = 1000, callback) {
    let opacity = 1;
    const interval = 50;
    const decrement = interval / duration;

    function animate() {
      opacity -= decrement;
      if (opacity <= 0) {
        element.style.opacity = 0;
        element.style.display = "none";
        if (callback) callback();
      } else {
        element.style.opacity = opacity;
        setTimeout(animate, interval);
      }
    }
    animate();
  }

  // 会社ロゴを順番に表示していく関数
  function showLogosSequentially(index = 0) {
    if (index >= logos.length) {
      console.log("全ての会社ロゴを表示完了");
      return;
    }
    const logo = logos[index];
    fadeIn(logo, 1000, () => {
      setTimeout(() => {
        fadeOut(logo, 1000, () => {
          showLogosSequentially(index + 1);
        });
      }, 2000); // 2秒表示
    });
  }

  // 中央テキストクリック時の処理
  centerText.addEventListener("click", () => {
    centerText.style.display = "none";
    console.log("クリックされたので非表示にしました");
    showLogosSequentially();
  });
});
