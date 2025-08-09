window.addEventListener('DOMContentLoaded', () => {
  const bgm = document.getElementById('bgm');
  if (!bgm) return;

  bgm.volume = 0.5;
  bgm.loop = true;

  const tryPlay = () => {
    bgm.play().catch(() => {
      // 自動再生失敗。ユーザー操作待機。
      console.log('BGM自動再生失敗。ユーザー操作を待機します。');
    });
  };

  tryPlay();

  const userPlay = () => {
    bgm.play().catch(e => console.error('ユーザー操作による再生エラー:', e));
    window.removeEventListener('click', userPlay);
    window.removeEventListener('touchstart', userPlay);
  };

  window.addEventListener('click', userPlay);
  window.addEventListener('touchstart', userPlay);
});
