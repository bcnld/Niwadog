document.addEventListener("DOMContentLoaded", () => {
  const centerText = document.getElementById("center-text");
  const logos = document.querySelectorAll(".company-logo");
  const backgroundOverlay = document.getElementById("background-overlay");
  const bgm = document.getElementById("bgm");

  const titleImg1 = document.getElementById("title-img1");
  const titleImg2 = document.getElementById("title-img2");
  const pressKeyText = document.getElementById("press-any-key");

  // 全画面演出用要素（HTMLに用意してください）
  // <img id="fullscreen-effect" src="images/fullscreen_effect.png" style="display:none; position:fixed; top:50%; left:50%; transform: translate(-50%, -50%) scale(1.2); opacity:0; z-index:9999; pointer-events:none;" />
  const fullscreenEffect = document.getElementById("fullscreen-effect");
  // 効果音（HTMLに用意してください）
  // <audio id="effect-sfx" src="sounds/effect.mp3"></audio>
  const effectSfx = document.getElementById("effect-sfx");

  let currentIndex = 0;
  let started = false;

  // 企業ロゴは中央固定、前面に出す
  logos.forEach(logo => {
    logo.style.position = "fixed";
    logo.style.top = "50%";
    logo.style.left = "50%";
    logo.style.transform = "translate(-50%, -50%)";
    logo.style.zIndex = "9998"; // fullscreenEffectの手前
  });

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

  // 全画面演出表示（約2秒表示、ゆっくりフェードアウト）
  async function showFullscreenEffect() {
    if (!fullscreenEffect) return;
    if (effectSfx) {
      try {
        effectSfx.currentTime = 0;
        await effectSfx.play();
      } catch {
        // 再生できない場合は無視
      }
    }
    fullscreenEffect.style.display = "block";
    fullscreenEffect.style.opacity = "0";
    fullscreenEffect.style.transform = "translate(-50%, -50%) scale(1.2)";
    fullscreenEffect.style.transition = "none";

    await new Promise(requestAnimationFrame);
    fullscreenEffect.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    fullscreenEffect.style.opacity = "1";
    fullscreenEffect.style.transform = "translate(-50%, -50%) scale(1.0)";

    await new Promise(resolve => setTimeout(resolve, 2000));

    fullscreenEffect.style.transition = "opacity 1.5s ease";
    fullscreenEffect.style.opacity = "0";

    await new Promise(resolve => setTimeout(resolve, 1500));
    fullscreenEffect.style.display = "none";
  }

  // 背景フェードイン演出
  async function fadeInBackgroundImage() {
    backgroundOverlay.style.backgroundImage = "url('images/press_bg.png')";
    backgroundOverlay.style.backgroundSize = "cover";
    backgroundOverlay.style.backgroundPosition = "center center";
    backgroundOverlay.style.backgroundRepeat = "no-repeat";

    backgroundOverlay.style.transition = "none";
    backgroundOverlay.style.opacity = 0;
    backgroundOverlay.style.filter = "blur(5px)";
    backgroundOverlay.style.transform = "scale(1.2)";
    backgroundOverlay.style.display = "block";

    await new Promise(requestAnimationFrame);
    backgroundOverlay.style.transition = "opacity 2s ease, filter 2s ease, transform 2s ease";
    backgroundOverlay.style.opacity = 1;
    backgroundOverlay.style.filter = "blur(0)";
    backgroundOverlay.style.transform = "scale(1)";

    bgm.loop = true;
    bgm.play();

    // 背景フェードイン待ち2.1秒
    await new Promise(resolve => setTimeout(resolve, 2100));
  }

  // タイトル画像表示シーケンス
  async function showTitleImages() {
    titleImg1.style.display = "block";
    titleImg1.style.opacity = 0;
    titleImg1.style.filter = "drop-shadow(0 0 20px white)";
    await fadeIn(titleImg1, 1000);
    await new Promise(r => setTimeout(r, 3000));
    await fadeOut(titleImg1, 1000);
    titleImg1.style.filter = "none";

    titleImg2.style.display = "block";
    titleImg2.style.opacity = 0;
    titleImg2.style.transform = "translate(-50%, -60%) scale(1.5)";
    titleImg2.style.transition = "transform 1s ease";
    await fadeIn(titleImg2, 1000);

    pressKeyText.style.display = "block";
    pressKeyText.style.opacity = "0";
    requestAnimationFrame(() => {
      pressKeyText.style.opacity = "1";
    });

    waitForPressKey();
  }

  // 「Press any key」待ちイベント設定
  function waitForPressKey() {
    async function onInput() {
      window.removeEventListener("keydown", onInput, true);
      window.removeEventListener("touchstart", onInput, true);

      await fadeOut(pressKeyText, 800);
      await fadeOut(backgroundOverlay, 1500);

      startBackgroundScroll();
    }
    window.addEventListener("keydown", onInput, { capture: true });
    window.addEventListener("touchstart", onInput, { capture: true });
  }

  // 企業ロゴを順に表示（3枚まで）
  async function showNextLogo() {
    if (currentIndex >= logos.length) {
      // 全企業ロゴ終了後、全画面演出と背景フェードインを並行で実行
      await Promise.all([
        showFullscreenEffect(),
        fadeInBackgroundImage()
      ]);
      await showTitleImages();
      return;
    }

    if (currentIndex > 0) {
      backgroundOverlay.style.transition = "none";
      backgroundOverlay.style.backgroundImage = "";
      backgroundOverlay.style.backgroundColor = "rgba(255,255,255,0.8)";
      backgroundOverlay.style.opacity = 1;
      setTimeout(() => {
        backgroundOverlay.style.transition = "opacity 1s ease";
      }, 10);
    } else {
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

  // ----------- スクロール背景関連 ------------

  const scrollSpeed = 1;
  const containerHeight = window.innerHeight;
  const containerWidth = window.innerWidth;
  const bgImageWidth = 3600;
  const bgImageHeight = containerHeight;

  const scrollWrapper = document.createElement("div");
  scrollWrapper.id = "scroll-wrapper";
  scrollWrapper.style.position = "fixed";
  scrollWrapper.style.top = "0";
  scrollWrapper.style.left = "0";
  scrollWrapper.style.width = `${containerWidth}px`;
  scrollWrapper.style.height = `${containerHeight}px`;
  scrollWrapper.style.overflow = "hidden";
  scrollWrapper.style.zIndex = "1";
  scrollWrapper.style.pointerEvents = "none";

  let bgElements = [];

  function createBgDiv(x) {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.top = "0";
    div.style.left = `${x}px`;
    div.style.width = `${bgImageWidth}px`;
    div.style.height = `${bgImageHeight}px`;
    div.style.backgroundImage = "url('images/menu.png')";
    div.style.backgroundSize = "cover";
    div.style.backgroundRepeat = "no-repeat";
    div.style.backgroundPosition = "center center";
    return div;
  }

  function animateScrollingBackground() {
  for (let i = 0; i < bgElements.length; i++) {
    const div = bgElements[i];
    let currentX = parseFloat(div.style.left);

    // 右方向にスクロール (x座標を増やす)
    let newX = currentX + scrollSpeed;
    div.style.left = `${newX}px`;
  }

  // 画面左端より右にずれすぎた画像を削除（完全に画面外）
  const firstDiv = bgElements[0];
  if (parseFloat(firstDiv.style.left) > containerWidth) {
    const removed = bgElements.shift();
    if (removed.parentNode) removed.parentNode.removeChild(removed);
  }

  // 画面右端を超えたら左端の左側に新しい画像を追加
  const lastDiv = bgElements[bgElements.length - 1];
  const lastRight = parseFloat(lastDiv.style.left) + bgImageWidth;
  if (lastRight >= 0) {
    const firstLeft = parseFloat(bgElements[0].style.left);
    const newDiv = createBgDiv(firstLeft - bgImageWidth);
    scrollWrapper.appendChild(newDiv);
    bgElements.unshift(newDiv);
  }

  requestAnimationFrame(animateScrollingBackground);
}

  function startBackgroundScroll() {
    backgroundOverlay.style.display = "none";
    document.body.appendChild(scrollWrapper);

    bgElements.push(createBgDiv(0));
    bgElements.push(createBgDiv(-bgImageWidth));
    bgElements.forEach(div => scrollWrapper.appendChild(div));

    animateScrollingBackground();
  }

  // 初期非表示セット
  logos.forEach(logo => {
    logo.style.display = "none";
    logo.style.opacity = "0";
  });
  titleImg1.style.display = "none";
  titleImg2.style.display = "none";
  pressKeyText.style.display = "none";
  pressKeyText.style.opacity = "0";

  if (fullscreenEffect) {
    fullscreenEffect.style.display = "none";
    fullscreenEffect.style.opacity = "0";
  }

  // 中央テキストクリックで開始
  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    fadeOut(centerText, 500).then(() => {
      showNextLogo();
    });
  });
});
