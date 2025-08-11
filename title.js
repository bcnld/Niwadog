window.addEventListener('load', () => {
  const companyLogos = document.querySelectorAll('.company-logo');
  const background = document.getElementById('background');
  const pressAnyKey = document.getElementById('press-any-key');
  const bgm = document.getElementById('bgm');

  let delay = 500; // 最初のロゴ表示までの遅延

  companyLogos.forEach((logo) => {
    setTimeout(() => {
      // フェードイン
      logo.style.opacity = '1';

      // 2秒後フェードアウト
      setTimeout(() => {
        logo.style.opacity = '0';
      }, 2000);

    }, delay);

    // 次のロゴ開始までの遅延更新（フェードイン1s + 表示2s + フェードアウト1s）
    delay += 4000;
  });

  // 全ロゴ後に背景フェードイン＆ズームアウト
  setTimeout(() => {
    background.style.opacity = '1';
    setTimeout(() => {
      background.style.transform = 'scale(1.0)';
      background.style.filter = 'blur(0px)';
    }, 200);

    // BGM再生
    bgm.play().catch(err => console.log("BGM自動再生ブロック:", err));
  }, delay);

  // Press Any Key表示
  setTimeout(() => {
    pressAnyKey.style.opacity = '1';
  }, delay + 1500);
});
