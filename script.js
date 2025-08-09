document.addEventListener('DOMContentLoaded', () => {
  const bgm = document.getElementById('bgm');
  if (!bgm) return;
  bgm.volume = 0.5;
  bgm.loop = true;

  bgm.play().catch(() => {
    console.log('自動再生失敗、ユーザー操作待機');
    const playOnUserGesture = () => {
      bgm.currentTime = 0;
      bgm.play().catch(e => console.error('再生エラー:', e));
      document.removeEventListener('click', playOnUserGesture);
      document.removeEventListener('touchstart', playOnUserGesture);
    };
    document.addEventListener('click', playOnUserGesture);
    document.addEventListener('touchstart', playOnUserGesture);
  });
});
