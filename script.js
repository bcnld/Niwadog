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

// BGM 初回再生
window.addEventListener('load', () => {
  const bgm = document.getElementById('bgm');
  if (!bgm) {
    console.error('BGM要素がありません');
    return;
  }
  bgm.volume = 0.5;

  // ユーザーの最初のクリックで一度だけBGM再生開始
  const onFirstClick = () => {
    if (bgm.paused) {
      bgm.play()
        .then(() => console.log('BGM再生開始'))
        .catch(e => {
          console.error('BGM再生エラー:', e);
          alert('BGM再生エラー: ' + e.message);
        });
    }
    // 一度再生したらイベント解除
    document.body.removeEventListener('click', onFirstClick);
  };

  document.body.addEventListener('click', onFirstClick);

  // 他の初期化処理（例: localStorageの読み込み）
  const stored = localStorage.getItem('caughtDogs');
  if (stored) caughtDogsMap = JSON.parse(stored);

  // ここで他のサウンド要素のボリューム調整なども可能
});

window.addEventListener('load', () => {
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


