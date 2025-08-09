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

  // まずBGMを自動再生してみる
  bgm.play().catch((e) => {
    console.warn('BGM自動再生失敗:', e);

    // 自動再生失敗時は、ユーザー操作で再生開始を試みる
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
  if (stored) {
    try {
      caughtDogsMap = JSON.parse(stored);
    } catch {
      caughtDogsMap = {};
    }
  }
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

/**
 * 捕まえた犬のオーバーレイを表示し、捕獲音を鳴らす
 * @param {string} dogImageSrc - 犬画像のURL
 * @param {string} dogName - 犬の名前
 */
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

// ここに他の機能も追加できます
