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
