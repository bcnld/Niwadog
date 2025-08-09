const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CANVAS_SIZE / 2 - 40; // 少し小さめに調整

const SEGMENTS = 12; // 12分割
const RED_ZONE_START = 30;  // 赤い当たりゾーンの開始角度 (度数法)
const RED_ZONE_END = 60;    // 赤い当たりゾーンの終了角度

let isFishing = false;
let selectedDogId = null;

let currentAngle = 0;      // 針の角度（ラジアン）
let spinSpeed = 0;         // 回転速度
const spinDeceleration = 0.0005; // 減速量
let spinning = false;

// 効果音要素
const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxHit = document.getElementById('sfx-hit');
const sfxMiss = document.getElementById('sfx-miss');
const sfxCatch = document.getElementById('sfx-catch');

function degToRad(deg) {
  return deg * Math.PI / 180;
}

// 円盤固定描画
function drawRoulette() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const segmentAngle = (2 * Math.PI) / SEGMENTS;

  // 円盤（セグメント）描画
  for(let i=0; i<SEGMENTS; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = startAngle + segmentAngle;

    // セグメント角度を度数に変換
    let deg = (i * 360 / SEGMENTS) % 360;
    let inRedZone = (deg >= RED_ZONE_START && deg < RED_ZONE_END);

    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle, false);
    ctx.closePath();

    ctx.fillStyle = inRedZone ? '#ff4444' : '#eeeeee';
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }

  // 針の描画（円盤の外周を回る）
  const needleLength = RADIUS + 20; // 盤より外に出す
  const needleWidth = 15;

  // 針の先端座標
  const needleX = CENTER + needleLength * Math.cos(currentAngle);
  const needleY = CENTER + needleLength * Math.sin(currentAngle);

  ctx.save();
  ctx.translate(needleX, needleY);
  ctx.rotate(currentAngle + Math.PI / 2); // 針の向きを回転に合わせる

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-needleWidth / 2, needleWidth);
  ctx.lineTo(needleWidth / 2, needleWidth);
  ctx.closePath();
  ctx.fillStyle = 'black';
  ctx.fill();

  ctx.restore();
}

// 回転開始
function startSpin() {
  if (spinning) return;
  spinSpeed = 0.3 + Math.random() * 0.2; // ランダム初速
  spinning = true;
  fishingResult.textContent = '';
  reelButton.disabled = true;

  // 効果音再生
  if (sfxRouletteLoop) {
    sfxRouletteLoop.currentTime = 0;
    sfxRouletteLoop.play();
  }

  animateSpin();
}

function animateSpin() {
  if (!spinning) return;

  currentAngle += spinSpeed;
  currentAngle %= (2 * Math.PI);

  spinSpeed -= spinDeceleration;
  if (spinSpeed <= 0) {
    spinSpeed = 0;
    spinning = false;
    reelButton.disabled = false;

    // 効果音停止
    if (sfxRouletteLoop) sfxRouletteLoop.pause();
    if (sfxStopClick) {
      sfxStopClick.currentTime = 0;
      sfxStopClick.play();
    }

    checkResult();
  } else {
    requestAnimationFrame(animateSpin);
  }

  drawRoulette();
}

function checkResult() {
  // 針の角度を度数に変換(0～360)
  let needleDeg = (currentAngle * 180 / Math.PI) % 360;
  if (needleDeg < 0) needleDeg += 360;

  // 赤ゾーンは [RED_ZONE_START, RED_ZONE_END) なので判定
  const isHit = (needleDeg >= RED_ZONE_START && needleDeg < RED_ZONE_END);

  if (isHit) {
    fishingResult.textContent = "ヒット！";
    if (sfxHit) {
      sfxHit.currentTime = 0;
      sfxHit.play();
    }
    setTimeout(() => {
      fishingResult.textContent = "";
      showCatchOverlay(selectedDogId);
      isFishing = false;
    }, 1000);
  } else {
    fishingResult.textContent = "ハズレ...";
    if (sfxMiss) {
      sfxMiss.currentTime = 0;
      sfxMiss.play();
    }
    setTimeout(() => {
      fishingResult.textContent = "";
      fishingUI.style.display = 'none';
      isFishing = false;
    }, 1000);
  }
}

function startFishing(dogElement) {
  if (isFishing) return;
  isFishing = true;
  selectedDogId = dogElement.dataset.dogId;  // dogElementにdata-dog-id属性が必要
  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  currentAngle = 0;
  drawRoulette();
}

reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  startSpin();
});

function showCatchOverlay(dogId) {
  const catchOverlay = document.getElementById('catch-overlay');
  const caughtDogImg = document.getElementById('caught-dog-img');
  const caughtMessage = document.getElementById('caught-message');

  const dogData = window.allDogs ? window.allDogs.find(d => d.id.toString() === dogId.toString()) : null;

  if (!dogData) {
    caughtDogImg.src = '';
    caughtMessage.textContent = '犬データがありません';
  } else {
    caughtDogImg.src = dogData.image;
    caughtMessage.textContent = `${dogData.name}をつかまえた！`;
  }

  catchOverlay.style.display = 'flex';

  if (sfxCatch) {
    sfxCatch.currentTime = 0;
    sfxCatch.play();
  }
}

// 閉じるボタンの処理
document.getElementById('catch-close').addEventListener('click', () => {
  const catchOverlay = document.getElementById('catch-overlay');
  catchOverlay.style.display = 'none';
  fishingUI.style.display = 'none';
});
