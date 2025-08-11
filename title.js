document.addEventListener("DOMContentLoaded", () => {
  const questionOverlay = createQuestionOverlay();
  document.body.appendChild(questionOverlay);

  const logos = document.querySelectorAll(".company-logo");
  const pressAnyKey = document.getElementById("press-any-key");
  const background = document.getElementById("background");
  const bgm = document.getElementById("bgm");

  // ロゴ最初は非表示
  logos.forEach(logo => {
    logo.style.opacity = 0;
    logo.style.display = "none";
  });

  // 背景ぼかしと拡大初期状態
  background.style.filter = "blur(8px)";
  background.style.transform = "scale(1.2)";

  pressAnyKey.style.opacity = 0;

  // 「はい」ボタン押した時の処理
  questionOverlay.querySelector("button").addEventListener("click", () => {
    questionOverlay.remove();  // モーダル非表示（DOMから削除）

    // 会社ロゴの順次表示を開始
    showCompanyLogosSequentially();
  });

  function showCompanyLogosSequentially() {
    let index = 0;

    function showNextLogo() {
      if (index >= logos.length) {
        // 3つのロゴ表示が終わったら背景効果解除
        background.style.transition = "transform 3s ease-out, filter 3s ease-out";
        background.style.filter = "blur(0px)";
        background.style.transform = "scale(1)";

        // BGMをユーザー操作待ちなしで再生
        try {
          bgm.play().catch(() => {
            // 自動再生ブロックされた場合は、ユーザー操作待ちにしたいならここで処理を追加
          });
        } catch {}

        // Press Any Keyをフェードインさせ点滅開始
        fadeIn(pressAnyKey, 1000);
        blinkPressText();

        return;
      }

      const logo = logos[index];
      fadeIn(logo, 1000, () => {
        setTimeout(() => {
          fadeOut(logo, 1000, () => {
            logo.style.display = "none";
            index++;
            setTimeout(showNextLogo, 500);
          });
        }, 2000);
      });
    }

    showNextLogo();
  }

  function fadeIn(element, duration, callback) {
    element.style.opacity = 0;
    element.style.display = "block";
    let opacity = 0;
    const interval = 50;
    const increment = interval / duration;

    function step() {
      opacity += increment;
      if (opacity >= 1) {
        opacity = 1;
        element.style.opacity = opacity;
        if (callback) callback();
      } else {
        element.style.opacity = opacity;
        setTimeout(step, interval);
      }
    }
    step();
  }

  function fadeOut(element, duration, callback) {
    let opacity = 1;
    const interval = 50;
    const decrement = interval / duration;

    function step() {
      opacity -= decrement;
      if (opacity <= 0) {
        opacity = 0;
        element.style.opacity = opacity;
        if (callback) callback();
      } else {
        element.style.opacity = opacity;
        setTimeout(step, interval);
      }
    }
    step();
  }

  function blinkPressText() {
    setInterval(() => {
      pressAnyKey.style.opacity = pressAnyKey.style.opacity == 1 ? 0 : 1;
    }, 800);
  }

  // 質問モーダルのDOMを生成する関数
  function createQuestionOverlay() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.color = "white";
    overlay.style.fontSize = "28px";
    overlay.style.userSelect = "none";
    overlay.style.zIndex = "9999";

    const text = document.createElement("p");
    text.textContent = "あなたは日本人ですか？";
    overlay.appendChild(text);

    const btn = document.createElement("button");
    btn.textContent = "はい";
    btn.style.marginTop = "20px";
    btn.style.padding = "12px 40px";
    btn.style.fontSize = "22px";
    btn.style.fontWeight = "bold";
    btn.style.borderRadius = "8px";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.backgroundColor = "#2196F3";
    btn.style.color = "white";
    btn.style.userSelect = "none";
    btn.style.transition = "background-color 0.3s ease";
    btn.addEventListener("mouseenter", () => btn.style.backgroundColor = "#1976d2");
    btn.addEventListener("mouseleave", () => btn.style.backgroundColor = "#2196F3");

    overlay.appendChild(btn);

    return overlay;
  }
});
