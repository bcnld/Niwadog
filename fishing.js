const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CANVAS_SIZE / 2 - 20;

const SEGMENTS = 12; // 12分割
const RED_ZONE_START = 30;  // 赤い当たりゾーンの開始角度 (度数法)
const RED_ZONE_END = 60;    // 赤い当たりゾーンの終了角度

let isFishing = false;
let selectedDogId = null;

let needleAngle = 0;       // 針の角度（ラジアン）
let needleSpeed = 0.05;    // 針の回転速度（初期は一定）
let isSpinning = false;    // リールボタン押して減速中フラグ

// 効果音要素
const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxHit = document.getElementById('sfx-hit');
const sfxMiss = document.getElementById('sfx-miss');
const sfxCatch = document.getElementById('sfx-catch');

function degToRad(deg) {
  return deg * Math.PI / 180;
}

// ルーレット描画
function drawRoulette() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const segmentAngle = (2 * Math.PI) / SEGMENTS;

  for(let i=0; i<SEGMENTS; i++) {
    let startAngle = i * segmentAngle;
    let endAngle = startAngle + segmentAngle;

    // 赤ゾーン判定
    let segStartDeg = (i * 360/SEGMENTS) % 360;
    if (segStartDeg < 0) segStartDeg += 360;

    let inRedZone = (segStartDeg >= RED_ZONE_START && segStartDeg < RED_ZONE_END);

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

  // 針を描く
  ctx.save();
  ctx.translate(CENTER, CENTER);
  ctx.rotate(needleAngle);

  ctx.beginPath();
  // とんがった先端を上に（0度方向）向ける三角形
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

      // 効果音停止
      if (sfxRouletteLoop) sfxRouletteLoop.pause();

      if (sfxStopClick) {
        sfxStopClick.currentTime = 0;
        sfxStopClick.play();
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

  // ルーレットループ音再生開始
  if (sfxRouletteLoop) {
    sfxRouletteLoop.currentTime = 0;
    sfxRouletteLoop.play();
  }
}

function checkResult() {
  // 針は常に270度（真上）を指しているので、
  // ルーレットの回転角度（針の角度と反対向き）を計算して判定
  const needleAngleDeg = 270;
  let rotationDeg = (needleAngle * 180 / Math.PI) % 360;
  if(rotationDeg < 0) rotationDeg += 360;

  let pointerOnRouletteDeg = (needleAngleDeg - rotationDeg + 360) % 360;

  const isHit = (pointerOnRouletteDeg >= RED_ZONE_START && pointerOnRouletteDeg <= RED_ZONE_END);

  if (isHit) {
    fishingResult.textContent = "ヒット！";
    if (sfxHit) {
      sfxHit.currentTime = 0;
      sfxHit.play();
    }
    
    const dogImg = document.querySelector(`img[data-dog-id="${selectedDogId}"]`);
    if (dogImg) {
      dogImg.remove();
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
  needleAngle = 0;
  needleSpeed = 0.05;
  isSpinning = false;
  drawRoulette();
  update(); // アニメーション開始
}

reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  startSpin();
});

function showCatchOverlay(dogId) {
  const catchOverlay = document.getElementById('catch-overlay');
  const caughtDogImg = document.getElementById('caught-dog-img');
  const caughtMessage = document.getElementById('caught-message');

  // dogIdは文字列なので、idも文字列に変換して比較
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
