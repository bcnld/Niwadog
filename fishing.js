const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CANVAS_SIZE / 2 - 20;

const SEGMENTS = 12; // 12分割

// 赤ゾーン幅（度数法）
const RED_ZONE_WIDTH = 30;

// 赤ゾーン開始・終了・中心角度は釣り開始時にランダム設定
let RED_ZONE_START = 0;
let RED_ZONE_END = 0;
let RED_ZONE_CENTER = 0;

let isFishing = false;
let selectedDogId = null;

let needleAngle = 0;       // 針の角度（ラジアン）
let needleSpeed = 0.1;     // 針の回転速度（初期は速め）
let isSpinning = false;    // リールボタン押して減速中フラグ

// 効果音要素
const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxHit = document.getElementById('sfx-hit');
const sfxMiss = document.getElementById('sfx-miss');
const sfxCatch = document.getElementById('sfx-catch');
const sfxWheelStop = document.getElementById('sfx-wheel-stop');

function degToRad(deg) {
  return deg * Math.PI / 180;
}

// 360度をまたぐかもしれない範囲内か判定する関数
function isAngleInRange(angle, start, end) {
  if (start <= end) {
    return angle >= start && angle <= end;
  } else {
    // 360度をまたぐ場合
    return angle >= start || angle <= end;
  }
}

// ルーレット描画
function drawRoulette() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const segmentAngle = (2 * Math.PI) / SEGMENTS;

  for(let i=0; i<SEGMENTS; i++) {
    let startAngle = i * segmentAngle;
    let endAngle = startAngle + segmentAngle;

    // セグメントの開始角度を度数に変換(0～360)
    let segStartDeg = (i * 360/SEGMENTS) % 360;
    if (segStartDeg < 0) segStartDeg += 360;

    // 赤ゾーン判定（セグメントの開始角度が赤ゾーンに含まれるか）
    let inRedZone = isAngleInRange(segStartDeg, RED_ZONE_START, RED_ZONE_END);

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

  // 針を描く（針の先端を赤ゾーン中心に向ける）
  ctx.save();
  ctx.translate(CENTER, CENTER);

  // 針の角度に赤ゾーン中心角度を足して回転（ラジアン変換）
  ctx.rotate(needleAngle + degToRad(RED_ZONE_CENTER));

  ctx.beginPath();
  ctx.moveTo(0, -RADIUS - 10);      // 尖った先端
  ctx.lineTo(-10, -RADIUS + 20);    // 左下
  ctx.lineTo(10, -RADIUS + 20);     // 右下
  ctx.closePath();

  ctx.fillStyle = '#ff6600';  // 見やすいオレンジ色
  ctx.fill();

  ctx.restore();
}

function update() {
  if (!isFishing) return; // 釣り中でなければ停止

  if (!isSpinning) {
    // 普通に針は回り続ける
    needleAngle += needleSpeed;
  } else {
    // 減速中
    needleSpeed *= 0.98;  // 滑らかに減速
    needleAngle += needleSpeed;

    if (needleSpeed < 0.002) {
      needleSpeed = 0;
      isSpinning = false;
      reelButton.disabled = false;

      // 効果音停止とホイールストップ音
      if (sfxRouletteLoop) sfxRouletteLoop.pause();

      if (sfxWheelStop) {
        sfxWheelStop.currentTime = 0;
        sfxWheelStop.play();
      }

      checkResult();
    }
  }
  needleAngle %= (2 * Math.PI);
  drawRoulette();

  requestAnimationFrame(update);
}

function startSpin() {
  if (isSpinning) return;

  isSpinning = true;
  reelButton.disabled = true;
}

function checkResult() {
  // 針の角度を度に変換（0～360度に収める）
  let needleDeg = (needleAngle * 180 / Math.PI) % 360;
  if (needleDeg < 0) needleDeg += 360;

  const isHit = isAngleInRange(needleDeg, RED_ZONE_START, RED_ZONE_END);

  if (isHit) {
    fishingResult.textContent = "ヒット！";
    if (sfxHit) {
      sfxHit.currentTime = 0;
      sfxHit.play();
    }
    setTimeout(() => {
      fishingResult.textContent = "";
      removeCaughtDog();
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
      removeCaughtDog(); // 釣れなくても消す場合はこのままでOK
      isFishing = false;
    }, 1000);
  }
}

function startFishing(dogElement) {
  if (isFishing) return;
  isFishing = true;

  // 赤ゾーンランダム設定
  RED_ZONE_START = Math.random() * 360;
  RED_ZONE_END = (RED_ZONE_START + RED_ZONE_WIDTH) % 360;
  RED_ZONE_CENTER = (RED_ZONE_START + RED_ZONE_WIDTH / 2) % 360;

  selectedDogId = dogElement.dataset.dogId;
  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  needleAngle = 0;
  needleSpeed = 0.4;  // 少し速めに設定
  isSpinning = false;
  drawRoulette();
  update(); // アニメーション開始

  if (sfxRouletteLoop) {
    sfxRouletteLoop.currentTime = 0;
    sfxRouletteLoop.play();
  }
}

reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  startSpin();

  if (sfxStopClick) {
    sfxStopClick.currentTime = 0;
    sfxStopClick.play();
  }
});

function removeCaughtDog() {
  const dogElements = document.querySelectorAll(`[data-dog-id="${selectedDogId}"]`);
  dogElements.forEach(dogEl => {
    dogEl.remove();
  });
}

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

document.getElementById('catch-close').addEventListener('click', () => {
  const catchOverlay = document.getElementById('catch-overlay');
  catchOverlay.style.display = 'none';
  fishingUI.style.display = 'none';
});
