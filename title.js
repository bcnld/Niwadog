document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  const backgroundOverlay = document.getElementById("background-overlay");
  const bgm = document.getElementById("bgm");

  // 追加：タイトル画像要素取得
  const titleImg1 = document.getElementById("title-img1");
  const titleImg2 = document.getElementById("title-img2");

  let currentIndex = 0;
  let started = false;

  // フェードイン関数
  function fadeIn(element, duration = 1000) {
    element.style.display = "block";
    element.style.opacity = 0;
    let start = null;
    return new Promise(resolve => {
      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.opacity = progress;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  // フェードアウト関数
  function fadeOut(element, duration = 1000) {
    element.style.opacity = 1;
    let start = null;
    return new Promise(resolve => {
      function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        element.style.opacity = 1 - progress;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.style.display = "none";
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  // 背景画像フェードイン＋ぼかし・拡大解除演出
  async function fadeInBackgroundImage() {
    backgroundOverlay.style.backgroundImage = "url('images/press_bg.png')";
    backgroundOverlay.style.backgroundSize = "cover";
    backgroundOverlay.style.backgroundPosition = "center center";
    backgroundOverlay.style.backgroundRepeat = "no-repeat";

    // 初期状態セット（非表示・ぼかし・拡大）
    backgroundOverlay.style.transition = "none";
    backgroundOverlay.style.opacity = 0;
    backgroundOverlay.style.filter = "blur(5px)";
    backgroundOverlay.style.transform = "scale(1.2)";
    backgroundOverlay.style.display = "block";

    // 次のフレームでトランジション設定と状態を戻す
    await new Promise(requestAnimationFrame);
    backgroundOverlay.style.transition = "opacity 2s ease, filter 2s ease, transform 2s ease";
    backgroundOverlay.style.opacity = 1;
    backgroundOverlay.style.filter = "blur(0)";
    backgroundOverlay.style.transform = "scale(1)";

    // BGMループ再生をここで早めに開始
    bgm.loop = true;
    bgm.play();

    // ここでタイトル画像1枚目表示開始
    await showTitleImage1();

    // トランジション完了まで待つ（背景フェードインは2秒）
    await new Promise(resolve => setTimeout(resolve, 2100));
  }

  // タイトル画像1枚目を光らせて表示、3秒後フェードアウト
  async function showTitleImage1() {
    titleImg1.style.display = "block";
    titleImg1.style.opacity = 0;
    titleImg1.style.filter = "drop-shadow(0 0 20px white)";
    titleImg1.style.transition = "opacity 1s ease, filter 1s ease";
    titleImg1.style.position = "fixed";
    titleImg1.style.top = "50%";
    titleImg1.style.left = "50%";
    titleImg1.style.transform = "translate(-50%, -50%) scale(1)";
    titleImg1.style.zIndex = 50;

    // フェードイン（1秒）
    await fadeIn(titleImg1, 1000);

    // 光のエフェクト（drop-shadowの強弱を周期的に変化させる）
    let glowIntensity = 20;
    let increasing = false;
    let glowInterval = setInterval(() => {
      if (increasing) {
        glowIntensity += 1;
        if (glowIntensity >= 30) increasing = false;
      } else {
        glowIntensity -= 1;
        if (glowIntensity <= 10) increasing = true;
      }
      titleImg1.style.filter = `drop-shadow(0 0 ${glowIntensity}px white)`;
    }, 50);

    // 3秒間待機
    await new Promise(r => setTimeout(r, 3000));

    clearInterval(glowInterval);

    // フェードアウト（1秒）
    await fadeOut(titleImg1, 1000);

    // 次のタイトル画像表示へ
    await showTitleImage2();
  }

  // タイトル画像2枚目を少し上に大きく表示（フェードイン）
  async function showTitleImage2() {
    titleImg2.style.display = "block";
    titleImg2.style.opacity = 0;
    titleImg2.style.position = "fixed";
    titleImg2.style.top = "40%"; // 真ん中より少し上
    titleImg2.style.left = "50%";
    titleImg2.style.transform = "translate(-50%, -50%) scale(1.1)";
    titleImg2.style.zIndex = 50;
    titleImg2.style.transition = "opacity 1.5s ease";

    await fadeIn(titleImg2, 1500);
  }

  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      // 3枚すべて表示終わったあと背景画像フェードイン＋BGM再生＋タイトル画像表示
      await fadeInBackgroundImage();
      return;
    }

    // 2枚目以降のロゴ表示前は背景を白く半透明に
    if (currentIndex > 0) {
      backgroundOverlay.style.transition = "none";
      backgroundOverlay.style.backgroundImage = "";
      backgroundOverlay.style.backgroundColor = "rgba(255,255,255,0.8)";
      backgroundOverlay.style.opacity = 1;

      // 少し遅延してトランジションを元に戻す
      setTimeout(() => {
        backgroundOverlay.style.transition = "opacity 1s ease";
      }, 10);
    } else {
      // 最初は背景透明に設定
      backgroundOverlay.style.backgroundColor = "transparent";
      backgroundOverlay.style.opacity = 1;
    }

    const logo = logos[currentIndex];
    await fadeIn(logo, 1000);
    await new Promise(r => setTimeout(r, 2000));
    await fadeOut(logo, 1000);

    currentIndex++;
    showNextLogo();
  }

  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(() => {
      showNextLogo();
    });
  });

  // 初期状態でロゴは全部非表示にしておく
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = 0;
  });

  // 初期状態でタイトル画像も非表示にしておく
  titleImg1.style.display = "none";
  titleImg1.style.opacity = 0;
  titleImg2.style.display = "none";
  titleImg2.style.opacity = 0;
});
