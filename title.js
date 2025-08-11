document.addEventListener("DOMContentLoaded", () => {
  const scrollSpeed = 1;

  let containerWidth = window.innerWidth;
  let containerHeight = window.innerHeight;

  function calcBgSize() {
    containerWidth = window.innerWidth;
    containerHeight = window.innerHeight;
  }

  calcBgSize();

  const bgImageHeight = containerHeight;
  const bgImageWidth = bgImageHeight * 4;

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
    div.style.backgroundRepeat = "no-repeat";
    div.style.backgroundSize = `${bgImageWidth}px ${bgImageHeight}px`;
    div.style.backgroundPosition = "left top";
    return div;
  }

  function animateScrollingBackground() {
    for (let i = 0; i < bgElements.length; i++) {
      const div = bgElements[i];
      let currentX = parseFloat(div.style.left);
      let newX = currentX + scrollSpeed; // ← 左→右なので増やす
      div.style.left = `${newX}px`;
    }

    const leftmostDiv = bgElements[0];
    const leftmostX = parseFloat(leftmostDiv.style.left);

    // 画面左端まで左端が来たら左側に追加
    if (leftmostX >= 0) {
      const newDiv = createBgDiv(leftmostX - bgImageWidth);
      scrollWrapper.appendChild(newDiv);
      bgElements.unshift(newDiv); // 配列の先頭に追加
    }

    const rightmostDiv = bgElements[bgElements.length - 1];
    const rightmostX = parseFloat(rightmostDiv.style.left);

    // 右端が画面右端を超えたら削除
    if (rightmostX >= containerWidth) {
      const removed = bgElements.pop();
      if (removed && removed.parentNode) {
        removed.parentNode.removeChild(removed);
      }
    }

    requestAnimationFrame(animateScrollingBackground);
  }

  function startBackgroundScroll() {
    document.body.appendChild(scrollWrapper);

    // 初期に2枚設置（左端とその左隣）
    bgElements.push(createBgDiv(0));
    bgElements.push(createBgDiv(-bgImageWidth));
    bgElements.forEach(div => scrollWrapper.appendChild(div));

    animateScrollingBackground();
  }

  // クリックで開始の例（必要に応じて変更してください）
  const centerText = document.getElementById("center-text");
  let started = false;

  centerText.addEventListener("click", () => {
    if (started) return;
    started = true;
    centerText.style.transition = "opacity 0.5s ease";
    centerText.style.opacity = "0";
    setTimeout(() => {
      centerText.style.display = "none";
      startBackgroundScroll();
    }, 500);
  });

  // リサイズ対応（必要に応じて）
  window.addEventListener("resize", () => {
    while(bgElements.length) {
      const div = bgElements.pop();
      if (div.parentNode) div.parentNode.removeChild(div);
    }
    if (scrollWrapper.parentNode) scrollWrapper.parentNode.removeChild(scrollWrapper);

    calcBgSize();

    scrollWrapper.style.width = `${containerWidth}px`;
    scrollWrapper.style.height = `${containerHeight}px`;

    startBackgroundScroll();
  });
});
