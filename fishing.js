// fishingUI.js

const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

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

let angle = 0, spinSpeed = 0;
let spinning = false, slowingDown = false;
let hitZoneStart = 0, hitZoneEnd = 0;
let animationId = null;

let isFishing = false;

// 釣り開始処理（dogSpawn.jsのクリック時に呼ばれる）
window.startFishing = function () {
  if (isFishing) return;
  isFishing = true;
  window.isFishing = true;

  fishingResult.textContent = '';
  fishingUI.style.display = 'block';

  // 当たり判定は180度固定。開始角度はランダム
  hitZoneStart = Math.random() * 2 * Math.PI;
  hitZoneEnd = hitZoneStart + Math.PI;
  if (hitZoneEnd > 2 * Math.PI) {
    hitZoneEnd -= 2 * Math.PI;
  }

  angle = 0;
  spinSpeed = 0.3;
  spinning = true;
  slowingDown = false;

  sfxRouletteLoop.currentTime = 0;
  sfxRouletteLoop.play();

  drawRoulette();
};

reelButton.addEventListener('click', () => {
  if (!spinning || slowingDown) return;
  slowingDown = true;

  sfxStopClick.currentTime = 0;
  sfxStopClick.play();
});

function drawRoulette() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const center = canvas.width / 2;

  // ベース円
  ctx.beginPath();
  ctx.arc(center, center, center - 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#eef';
  ctx.fill();

  // 当たり判定（赤い扇形）
  ctx.beginPath();
  ctx.moveTo(center, center);
  if (hitZoneStart < hitZoneEnd) {
    ctx.arc(center, center, center - 10, hitZoneStart, hitZoneEnd);
  } else {
    ctx.arc(center, center, center - 10, hitZoneStart, 2 * Math.PI);
    ctx.lineTo(center, center);
    ctx.closePath();
    ctx.fillStyle = '#f00';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, center - 10, 0, hitZoneEnd);
  }
  ctx.lineTo(center, center);
  ctx.closePath();
  ctx.fillStyle = '#f00';
  ctx.fill();

  // 針の描画
  const needleLength = center - 20;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + needleLength * Math.cos(angle), center + needleLength * Math.sin(angle));
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.stroke();

  if (spinning) {
    angle += spinSpeed;
    angle %= 2 * Math.PI;  // 追加：angleを2π以内に丸める

    if (slowingDown) {
      spinSpeed -= 0.005;
      if (spinSpeed <= 0) {
        spinSpeed = 0;
        spinning = false;
        slowingDown = false;
        cancelAnimationFrame(animationId);

        sfxRouletteLoop.pause();
        sfxWheelStop.currentTime = 0;
        sfxWheelStop.play();

        checkHit();

        return;
      }
    }

    animationId = requestAnimationFrame(drawRoulette);
  }
}

function checkHit() {
  const normalized = angle % (2 * Math.PI);
  let hit = false;

  if (hitZoneStart < hitZoneEnd) {
    hit = normalized >= hitZoneStart && normalized <= hitZoneEnd;
  } else {
    hit = normalized >= hitZoneStart || normalized <= hitZoneEnd;
  }

  if (hit) {
    fishingResult.textContent = "ヒット！";

    sfxHit.currentTime = 0;
    sfxHit.play();

    setTimeout(() => {
      fishingUI.style.display = 'none';
      fishingResult.textContent = "";

      // 捕まえた犬の情報はdogSpawn.jsのselectedDogを参照
      const dog = window.selectedDog?.dog;
      const img = window.selectedDog?.img;

      if (!dog || !img) {
        isFishing = false;
        window.isFishing = false;
        return;
      }

      showCatchOverlay(img.src, dog.name);

      // 図鑑更新用の保存処理（必要に応じて）
      if (!window.caughtDogsMap) window.caughtDogsMap = {};
      if (!window.caughtDogsMap[dog.number]) {
        window.caughtDogsMap[dog.number] = dog;
        localStorage.setItem('caughtDogs', JSON.stringify(window.caughtDogsMap));
      }

      // 動きを止めて犬を消す
      if (img._moveAnimationId) {
        cancelAnimationFrame(img._moveAnimationId);
      }
      img.remove();

      isFishing = false;
      window.isFishing = false;
      window.selectedDog = null;

      if (typeof updateZukan === 'function') {
        updateZukan();
      }
    }, 1500);
  } else {
    fishingResult.textContent = "逃げられた…";

    sfxMiss.currentTime = 0;
    sfxMiss.play();

    setTimeout(() => {
      fishingUI.style.display = 'none';
      fishingResult.textContent = "";

      // 逃げられた場合も犬は消す
      const img = window.selectedDog?.img;
      if (img && img._moveAnimationId) {
        cancelAnimationFrame(img._moveAnimationId);
      }
      if (img) img.remove();

      isFishing = false;
      window.isFishing = false;
      window.selectedDog = null;
    }, 1500);
  }
}

closeBtn?.addEventListener('click', () => {
  catchOverlay.classList.remove('active');
  if (sfxStopClick) {
    sfxStopClick.currentTime = 0;
    sfxStopClick.play();
  }
});

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
