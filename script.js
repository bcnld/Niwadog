const bgm = document.getElementById('bgm');

window.addEventListener('load', () => {
  if (!bgm) return;

  bgm.volume = 0.5;

  bgm.play().catch(() => {
    const playOnUserGesture = () => {
      bgm.play().catch(() => {});
      window.removeEventListener('click', playOnUserGesture);
      window.removeEventListener('touchstart', playOnUserGesture);
    };
    window.addEventListener('click', playOnUserGesture);
    window.addEventListener('touchstart', playOnUserGesture);
  });
});
