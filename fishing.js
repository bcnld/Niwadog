// 犬データを先に読み込む
window.allDogs = [];
fetch("dog.json")
  .then(res => res.json())
  .then(data => {
    window.allDogs = data;
    console.log("犬データ読み込み完了:", window.allDogs);
  })
  .catch(err => {
    console.error("犬データの読み込みに失敗:", err);
  });

const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CANVAS_SIZE / 2 - 20;

const SEGMENTS = 12; // 12分割（30度ずつ）

let isFishing = false;
let selectedDogId = null;

let needleAngle = 0; // ラジアンで右を0°
let needleSpeed = 0.1;
let isSpinning = false;

const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
const sfxWheelStop = document.getElementById('sfx-wheel-stop');
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxHit = document.getElementById('sfx-hit');
const sfxMiss = document.getElementById('sfx-miss');
const sfxCatch = document.getElementById('sfx-catch');

let redZones = [];

function getCatchRate(dogId) {
  const dogData = window.allDogs.find(d => String(d.number) === String(dogId));
  return dogData ? (dogData.catchRate || 0.2) : 0.2;
}

function degToRad(deg) {
  return deg * Math.PI / 180;
}

function radToDeg(rad) {
  return (rad * 180 / Math.PI + 360) % 360;
}

function isAngleInRange(angle, start, end) {
  if (start <= end) return angle >= start && angle <= end;
  return angle >= start || angle <= end;
}

function generateRedZones(catchRate) {
  redZones = [];
  const segmentDeg = 360 / SEGMENTS;
  const baseWidth = segmentDeg * (0.6 + catchRate * 0.4); 
  const zoneCount = Math.floor(Math.random() * 2) + 1; // 1〜2個

  for (let i = 0; i < zoneCount; i++) {
    let start = (i * (360 / zoneCount) + Math.random() * segmentDeg) % 360;
    let end = (start + baseWidth) % 360;
    redZones.push({ start, end });
  }
}

function drawRoulette() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const segmentAngle = (2 * Math.PI) / SEGMENTS;
  const segmentDeg = 360 / SEGMENTS;

  for (let i = 0; i < SEGMENTS; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    const segStartDeg = (i * segmentDeg) % 360;
    const segEndDeg = (segStartDeg + segmentDeg) % 360;

    const inRedZone = redZones.some(zone =>
      isAngleInRange(segStartDeg, zone.start, zone.end) ||
      isAngleInRange(segEndDeg, zone.start, zone.end)
    );

    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fillStyle = inRedZone ? '#ff4444' : '#eeeeee';
    ctx.strokeStyle = '#666';
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

  if (isSpinning) {
    needleSpeed *= 0.98;
    needleAngle += needleSpeed;
    if (needleSpeed < 0.002) {
      isSpinning = false;
      needleSpeed = 0;
      reelButton.disabled = false;
      if (sfxRouletteLoop) sfxRouletteLoop.pause();
      if (sfxWheelStop) { sfxWheelStop.currentTime = 0; sfxWheelStop.play(); }
      checkResult();
    }
  } else {
    needleAngle += needleSpeed;
  }

  needleAngle %= (2 * Math.PI);
  drawRoulette();
  requestAnimationFrame(update);
}

function startSpin() {
  if (!isSpinning) {
    isSpinning = true;
    reelButton.disabled = true;
  }
}

function checkResult() {
  // 針の先端の角度を計算（右0°基準）
  let needleDeg = radToDeg(needleAngle);
  const isHit = redZones.some(zone => isAngleInRange(needleDeg, zone.start, zone.end));

  if (isHit) {
    fishingResult.textContent = "ヒット！";
    if (sfxHit) { sfxHit.currentTime = 0; sfxHit.play(); }
    setTimeout(() => {
      fishingResult.textContent = "";
      showCatchOverlay(selectedDogId); // 先に表示
      removeCaughtDog(); // 表示後に削除
      isFishing = false;
    }, 1000);
  } else {
    fishingResult.textContent = "ハズレ...";
    if (sfxMiss) { sfxMiss.currentTime = 0; sfxMiss.play(); }
    setTimeout(() => {
      fishingResult.textContent = "";
      fishingUI.style.display = 'none';
      isFishing = false;
    }, 1000);
  }
}

function startFishing(dogElement) {
  if (isFishing) return;
  if (!window.allDogs.length) {
    alert("犬データがまだ読み込まれていません！");
    return;
  }

  isFishing = true;
  selectedDogId = dogElement.dataset.dogId;
  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  needleAngle = 0;
  needleSpeed = 0.4;
  isSpinning = false;

  generateRedZones(getCatchRate(selectedDogId));
  drawRoulette();
  update();

  if (sfxRouletteLoop) { sfxRouletteLoop.currentTime = 0; sfxRouletteLoop.play(); }
}

reelButton.addEventListener('click', () => {
  if (isFishing) {
    startSpin();
    if (sfxStopClick) { sfxStopClick.currentTime = 0; sfxStopClick.play(); }
  }
});

function removeCaughtDog() {
  document.querySelectorAll(`[data-dog-id="${selectedDogId}"]`).forEach(el => el.remove());
}

function showCatchOverlay(dogId) {
  const overlay = document.getElementById('catch-overlay');
  const img = document.getElementById('caught-dog-img');
  const msg = document.getElementById('caught-message');

  const rarityColors = {
    "かす": "#353839", "ごみ": "#b5a642", "いらない": "#b08d57",
    "まあまあ": "#00a86b", "ふつう": "#26619c", "甘えんなって": "#9966cc",
    "ちらちら見てたよな？": "#f0d36d", "ふーん、えっちじゃん": "#8a2d2d",
    "どしたん話聞こか": "#40e0d0", "じゃあ挿れるね": "#b22222"
  };

  const dogData = window.allDogs.find(d => String(d.number) === String(dogId));

  if (!dogData) {
    img.src = 'no_image.png';
    msg.textContent = '犬のデータが読み込まれませんでした。';
    img.style.boxShadow = '';
  } else {
    console.log("捕まえた犬データ:", dogData);
    img.src = dogData.image || 'no_image.png';
    msg.textContent = `${dogData.name || '名無し'}をつかまえた！`;
    const auraColor = rarityColors[dogData.rarity] || '#fff';
    img.style.boxShadow = `
      0 0 15px 4px ${auraColor},
      0 0 30px 8px ${auraColor},
      0 0 50px 12px ${auraColor}
    `;
    img.style.borderRadius = '12px';
  }

  overlay.style.display = 'flex';
  if (sfxCatch) { sfxCatch.currentTime = 0; sfxCatch.play(); }
}

document.getElementById('catch-close').addEventListener('click', () => {
  document.getElementById('catch-overlay').style.display = 'none';
  fishingUI.style.display = 'none';
});
