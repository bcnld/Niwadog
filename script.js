const waterArea = document.getElementById('water-area');
const bgm = document.getElementById('bgm');

const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
sfxRouletteLoop.volume = 0.5;
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxWheelStop = document.getElementById('sfx-wheel-stop');
sfxWheelStop.volume = 0.3;
const sfxHit = document.getElementById('sfx-hit');
sfxHit.volume = 1.0;
const sfxMiss = document.getElementById('sfx-miss');
const sfxCatch = document.getElementById('sfx-catch');

const catchOverlay = document.getElementById('catch-overlay');
const closeBtn = document.getElementById('catch-close');

let caughtDogsMap = {};

// ページ読み込み時にBGM自動再生を試みる
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

  // ローカルストレージから捕まえた犬データを読み込み
  const stored = localStorage.getItem('caughtDogs');
  if (stored) caughtDogsMap = JSON.parse(stored);
});

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    catchOverlay.classList.remove('active');
    if (sfxStopClick) {
      sfxStopClick.currentTime = 0;
      sfxStopClick.play();
    }
  });
}

function showCatchOverlay(dogImageSrc, dogName) {
  const caughtImg = document.getElementById('caught-dog-img');
  const caughtMessage = document.getElementById('caught-message');

  if (caughtImg && caughtMessage && catchOverlay) {
    caughtImg.src = dogImageSrc;
    caughtMessage.textContent = `${dogName} をつかまえた！`;
    catchOverlay.classList.add('active');

    if (sfxCatch) {
      sfxCatch.currentTime = 0;
      sfxCatch.play();
    }
  }
}




