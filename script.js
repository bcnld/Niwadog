// bgm.js
document.addEventListener('DOMContentLoaded', () => {
  const bgm = document.getElementById('bgm');
  if (!bgm) return;
  bgm.volume = 0.5;
  bgm.loop = true;

  bgm.play().catch(() => {
    const playOnUserGesture = () => {
      bgm.currentTime = 0;
      bgm.play().catch(() => {});
      document.removeEventListener('click', playOnUserGesture);
      document.removeEventListener('touchstart', playOnUserGesture);
    };
    document.addEventListener('click', playOnUserGesture);
    document.addEventListener('touchstart', playOnUserGesture);
  });
});
