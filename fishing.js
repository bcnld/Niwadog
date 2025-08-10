const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CANVAS_SIZE / 2 - 20;

const SEGMENTS = 12; // 分割数を増やす（48等分）

let isFishing = false;
let selectedDogId = null;

let needleAngle = 0;       
let needleSpeed = 0.1;     
let isSpinning = false;    

// 効果音
const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
const sfxWheelStop = document.getElementById('sfx-wheel-stop');
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxHit = document.getElementById('sfx-hit');
const sfxMiss = document.getElementById('sfx-miss');
const sfxCatch = document.getElementById('sfx-catch');

// 赤ゾーン配列 [{start: 度, end: 度}, ...]
let redZones = [];

// キャッチレート取得
function getCatchRate(dogId) {
  const dogData = window.allDogs ? window.allDogs.find(d => d.id.toString() === dogId.toString()) : null;
  return dogData ? (dogData.catchRate || 0.2) : 0.2;
}

function degToRad(deg) {
  return deg * Math.PI / 180;
}

// 角度範囲判定（360度またぎ対応）
function isAngleInRange(angle, start, end) {
  if (start <= end) {
    return angle >= start && angle <= end;
  } else {
    return angle >= start || angle <= end;
  }
}

// 赤ゾーン生成（最低1個必ず生成）
function generateRedZones(catchRate) {
  redZones = [];
  const baseWidth = 20; // 基本の赤ゾーン幅（度）
  const width = baseWidth + (baseWidth * catchRate * 3); // キャッチレートで幅を調整（最大約80度くらい）

  const zoneCount = Math.floor(Math.random() * 3) + 1; // 1〜3個の赤ゾーン

  for (let i = 0; i < zoneCount; i++) {
    // 赤ゾーン開始角度は均等に散らばるように調整（0〜360をzoneCount分割して少しズラす）
    const baseStart = (360 / zoneCount) * i;
    // 少しランダムずらし
    const randomOffset = (Math.random() * (360 / zoneCount - width));
    let start = (baseStart + randomOffset) % 360;
    let end = (start + width) % 360;
    redZones.push({ start, end });
  }

  // 念のため最低1つ赤ゾーンあるかチェック（あればOK）
  if (redZones.length === 0) {
    redZones.push({ start: 0, end: width });
  }
}

// ルーレット描画
function drawRoulette() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const segmentAngle = (2 * Math.PI) / SEGMENTS;
  const segmentDeg = 360 / SEGMENTS;

  for(let i=0; i<SEGMENTS; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = startAngle + segmentAngle;

    const segStartDeg = (i * segmentDeg) % 360;
    const segEndDeg = (segStartDeg + segmentDeg) % 360;

    // セグメントが赤ゾーンと少しでも重なっているか判定
    const inRedZone = redZones.some(zone => {
      return isAngleInRange(segStartDeg, zone.start, zone.end) ||
             isAngleInRange(segEndDeg, zone.start, zone.end) ||
             (zone.start > zone.end && (segStartDeg >= zone.start || segEndDeg <= zone.end));
    });

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

  // 針描画
  ctx.save();
  ctx.translate(CENTER, CENTER);
  ctx.rotate(needleAngle);
  ctx.beginPath();
  ctx.moveTo(0, -RADIUS - 10);
  ctx.lineTo(-10, -RADIUS + 20);
  ctx.lineTo(10, -RADIUS + 20);
  ctx.closePath();
  ctx.fillStyle = '#ff6600';
  ctx.fill();
  ctx.restore();
}

function update() {
  if (!isFishing) return;

  if (!isSpinning) {
    needleAngle += needleSpeed;
  } else {
    needleSpeed *= 0.98;
    needleAngle += needleSpeed;

    if (needleSpeed < 0.002) {
      needleSpeed = 0;
      isSpinning = false;
      reelButton.disabled = false;

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
  let needleDeg = (needleAngle * 180 / Math.PI) % 360;
  if (needleDeg < 0) needleDeg += 360;

  const isHit = redZones.some(zone => isAngleInRange(needleDeg, zone.start, zone.end));

  if (isHit) {
    fishingResult.textContent = "ヒット！";
    if (sfxHit) { sfxHit.currentTime = 0; sfxHit.play(); }
    setTimeout(() => {
      fishingResult.textContent = "";
      removeCaughtDog();
      showCatchOverlay(selectedDogId);
      isFishing = false;
    }, 1000);
  } else {
    fishingResult.textContent = "ハズレ...";
    if (sfxMiss) { sfxMiss.currentTime = 0; sfxMiss.play(); }
    setTimeout(() => {
      fishingResult.textContent = "";
      fishingUI.style.display = 'none';
      removeCaughtDog();
      isFishing = false;
    }, 1000);
  }
}

function startFishing(dogElement) {
  if (isFishing) return;
  isFishing = true;
  selectedDogId = dogElement.dataset.dogId;

  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  needleAngle = 0;
  needleSpeed = 0.4;
  isSpinning = false;

  const catchRate = getCatchRate(selectedDogId);
  generateRedZones(catchRate);

  drawRoulette();
  update();

  if (sfxRouletteLoop) {
    sfxRouletteLoop.currentTime = 0;
    sfxRouletteLoop.play();
  }
}

reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  startSpin();
  if (sfxStopClick) { sfxStopClick.currentTime = 0; sfxStopClick.play(); }
});

function removeCaughtDog() {
  const dogElements = document.querySelectorAll(`[data-dog-id="${selectedDogId}"]`);
  dogElements.forEach(dogEl => dogEl.remove());
}

function showCatchOverlay(dogId) {
  const catchOverlay = document.getElementById('catch-overlay');
  const caughtDogImg = document.getElementById('caught-dog-img');
  const caughtMessage = document.getElementById('caught-message');

  const rarityColors = {
    "かす": "#353839",
    "ごみ": "#b5a642",
    "いらない": "#b08d57",
    "まあまあ": "#00a86b",
    "ふつう": "#26619c",
    "甘えんなって": "#9966cc",
    "ちらちら見てたよな？": "#f0d36d",
    "ふーん、えっちじゃん": "#8a2d2d",
    "どしたん話聞こか": "#40e0d0",
    "じゃあ挿れるね": "#b22222"
  };

  // 文字列化して厳密一致
  const dogData = window.allDogs ? window.allDogs.find(d => String(d.id) === String(dogId)) : null;

  if (!dogData) {
    caughtDogImg.src = '';
    caughtMessage.textContent = '犬データが読み込まれませんでした。';
    caughtDogImg.style.boxShadow = '';
  } else {
    caughtDogImg.src = dogData.image || '';
    caughtMessage.textContent = `${dogData.name || '名無し'}をつかまえた！`;

    const rarity = dogData.rarity || 'common';
    const auraColor = rarityColors[rarity] || '#ffffff';

    caughtDogImg.style.boxShadow = `
      0 0 15px 4px ${auraColor},
      0 0 30px 8px ${auraColor},
      0 0 50px 12px ${auraColor}
    `;
    caughtDogImg.style.borderRadius = '12px';
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
