const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CANVAS_SIZE / 2 - 20;

const SEGMENTS = 12;
const RED_ZONE_WIDTH_DEG = 20; // 1つの赤ゾーンの幅（度）

let isFishing = false;
let selectedDogId = null;

let needleAngle = 0;       // 針の角度（ラジアン）
let needleSpeed = 0.1;     // 針の回転速度（初期は速め）
let isSpinning = false;    // リールボタン押して減速中フラグ

// 複数の赤ゾーンを格納する配列
let redZones = [];  // 例: [{start: 10, end: 30}, {start: 150, end:170}]

// 効果音要素
const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
const sfxWheelStop = document.getElementById('sfx-wheel-stop');
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxHit = document.getElementById('sfx-hit');
const sfxMiss = document.getElementById('sfx-miss');
const sfxCatch = document.getElementById('sfx-catch');

function degToRad(deg) {
  return deg * Math.PI / 180;
}

// 360度またぎも考慮した角度範囲チェック関数
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
  const segmentDeg = 360 / SEGMENTS;

  for(let i=0; i<SEGMENTS; i++) {
    let startAngle = i * segmentAngle;
    let endAngle = startAngle + segmentAngle;

    let segStartDeg = (i * segmentDeg) % 360;
    let segEndDeg = (segStartDeg + segmentDeg) % 360;

    // セグメントがどれかの赤ゾーンと重なっているか判定
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

  // 針を描く
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

  // 針の角度がどれかの赤ゾーン内に入っているか
  const isHit = redZones.some(zone => isAngleInRange(needleDeg, zone.start, zone.end));

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
      removeCaughtDog();
      isFishing = false;
    }, 1000);
  }
}

function startFishing(dogElement) {
  if (isFishing) return;
  isFishing = true;
  selectedDogId = dogElement.dataset.dogId;

  // 赤ゾーンをランダムに複数個作成（2〜4個）
  redZones = [];
  const count = Math.floor(Math.random() * 3) + 2;
  for(let i=0; i<count; i++) {
    const start = Math.random() * 360;
    const end = (start + RED_ZONE_WIDTH_DEG) % 360;
    redZones.push({start, end});
  }

  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  needleAngle = 0;
  needleSpeed = 0.4;
  isSpinning = false;

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

  // レアリティカラー定義（dog.jsonのレアリティ文字列に対応）
  const rarityColors = {
    "かす": "#353839",               // 黒曜石
    "ごみ": "#b5a642",               // 砂金（愚者の金）
    "いらない": "#b08d57",           // 青銅
    "まあまあ": "#00a86b",           // 翡翠
    "ふつう": "#26619c",             // ラピスラズリ
    "甘えんなって": "#9966cc",       // 紫水晶
    "ちらちら見てたよな？": "#f0d36d", // 黄鉄鉱
    "ふーん、えっちじゃん": "#8a2d2d", // 赤鉄鉱
    "どしたん話聞こか": "#40e0d0",     // ターコイズ
    "じゃあ挿れるね": "#b22222"          // ルビー
  };

  // dog.jsonデータから犬情報取得
  const dogData = window.allDogs ? window.allDogs.find(d => String(d.id) === String(dogId)) : null;

  if (!dogData) {
    caughtDogImg.src = '';
    caughtMessage.textContent = '犬データがありません';
    caughtDogImg.style.boxShadow = '';
  } else {
    caughtDogImg.src = dogData.image || '';
    caughtMessage.textContent = `${dogData.name || '名無し'}をつかまえた！`;

    // レアリティに応じた色取得（なければ白）
    const rarity = dogData.rarity || 'common';
    const auraColor = rarityColors[rarity] || '#ffffff';

    // オーラ（光彩）付けるCSS。大きな光と小さな光を重ねる感じ。
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
