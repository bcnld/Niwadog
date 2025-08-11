document.addEventListener("DOMContentLoaded", () => {
  const pressAnyKey = document.getElementById("press-any-key");
  const bgm = document.getElementById("bgm");

  // 点滅アニメーション
  setInterval(() => {
    pressAnyKey.style.opacity = pressAnyKey.style.opacity == '1' ? '0' : '1';
  }, 700);

  // BGM自動再生（許可されていれば）
  if (bgm) {
    bgm.volume = 0.5;
    const playPromise = bgm.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        console.log("自動再生がブロックされました。ユーザー操作で再生してください。");
      });
    }
  }
});
