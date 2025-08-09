document.addEventListener('DOMContentLoaded', () => {
  const bgm = document.getElementById('bgm');
  if (!bgm) return;

  bgm.volume = 0.5;
  bgm.loop = true;

  // 自動再生を試みる
  bgm.play().catch(() => {
    console.log('自動再生失敗。画面タップで再生開始');
    const playOnUserGesture = () => {
      bgm.currentTime = 0;
      bgm.play().catch(e => console.error('再生エラー:', e));
      document.body.removeEventListener('click', playOnUserGesture);
      document.body.removeEventListener('touchstart', playOnUserGesture);
    };
    document.body.addEventListener('click', playOnUserGesture);
    document.body.addEventListener('touchstart', playOnUserGesture);
  });
});
