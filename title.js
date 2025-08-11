window.addEventListener('load', () => {
  const companyName = document.getElementById('company-name');
  const pressAnyKey = document.getElementById('press-any-key');
  const background = document.getElementById('background');
  const bgm = document.getElementById('bgm');

  // 企業ロゴフェードイン
  setTimeout(() => {
    companyName.style.opacity = '1';
  }, 500);

  // 3秒後フェードアウト
  setTimeout(() => {
    companyName.style.opacity = '0';
  }, 3500);

  // 背景ズームアウト + BGM再生
  setTimeout(() => {
    background.style.transform = 'scale(1.0)';
    background.style.filter = 'blur(0px)';
    bgm.play().catch(err => console.log("BGM自動再生ブロック:", err));
  }, 4500);

  // Press Any Key表示
  setTimeout(() => {
    pressAnyKey.style.opacity = '1';
  }, 6000);
});
