document.addEventListener('DOMContentLoaded', () => {
  const catchOverlay = document.getElementById('catch-overlay');
  const closeBtn = document.getElementById('catch-close');
  const caughtImg = document.getElementById('caught-dog-img');
  const caughtMessage = document.getElementById('caught-message');

  const sfxCatch = document.getElementById('sfx-catch');
  const sfxStopClick = document.getElementById('sfx-stop-click');

  // 閉じるボタン処理
  if (closeBtn && catchOverlay) {
    closeBtn.addEventListener('click', () => {
      catchOverlay.classList.remove('active');
      if (sfxStopClick) {
        sfxStopClick.currentTime = 0;
        sfxStopClick.play();
      }
    });
  }

  // 犬を捕まえたときの表示
  window.showCatchOverlay = function(dogImageSrc, dogName) {
    if (!catchOverlay || !caughtImg || !caughtMessage) return;

    caughtImg.src = dogImageSrc;
    caughtMessage.textContent = `${dogName} をつかまえた！`;
    catchOverlay.classList.add('active');

    if (sfxCatch) {
      sfxCatch.currentTime = 0;
      sfxCatch.play();
    }
  };
});
