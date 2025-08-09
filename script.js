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

// --- BGM起動処理（確実に鳴らす版） ---
bgm.volume = 0.5;

document.addEventListener('DOMContentLoaded', () => {
  bgm.play().catch(() => {
    console.warn('自動再生失敗：クリック/タップで再生待機');
    const playBgm = () => {
      bgm.play().catch(e => console.error('BGM再生エラー:', e));
      document.removeEventListener('click', playBgm);
      document.removeEventListener('touchstart', playBgm);
    };
    document.addEventListener('click', playBgm);
    document.addEventListener('touchstart', playBgm);
  });

  // ローカルストレージから捕まえた犬データを読み込み
  const stored = localStorage.getItem('caughtDogs');
  if (stored) caughtDogsMap = JSON.parse(stored);
});

// --- キャッチ画面の閉じるボタン ---
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    catchOverlay.classList.remove('active');
    if (sfxStopClick) {
      sfxStopClick.currentTime = 0;
      sfxStopClick.play();
    }
  });
}

// --- 犬を捕まえたときの表示 ---
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
