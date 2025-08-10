// 犬データ先読み込み
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

// UI要素取得
const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CANVAS_SIZE / 2 - 20;

const SEGMENTS = 12; // 12分割(30度ずつ)

let isFishing = false;
let selectedDogId = null;

let needleAngle = 0; // 針角度（ラジアン）
let needleSpeed = 0;
let isSpinning = false;

// 効果音
const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
const sfxWheelStop = document.getElementById('sfx-wheel-stop');
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxHit = document.getElementById('sfx-hit');
const sfxMiss = document.getElementById('sfx-miss');
const sfxCatch = document.getElementById('sfx-catch');

// 赤ゾーン（固定180度幅、開始角度はランダム）
let redZone = { start: 0, end: 180 }; // degで管理

// 角度を度数に変換（0～360）
function radToDeg(rad) {
  return (rad * 180 / Math.PI + 360) % 360;
}

// 角度範囲内か判定（360度またぎ対応）
function isAngleInRange(angle, start, end) {
  if (start <= end) {
    return angle >= start && angle <= end;
  } else {
    return angle >= start || angle <= end;
  }
}

// 赤ゾーン描画（180度幅の赤いセグメント）
function drawRoulette() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const segmentAngle = (2 * Math.PI) / SEGMENTS;
  const segmentDeg = 360 / SEGMENTS;

  for (let i = 0; i < SEGMENTS; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    const segStartDeg = (i * segmentDeg) % 360;
    const segEndDeg = (segStartDeg + segmentDeg) % 360;

    // 赤ゾーンと重なる部分は赤で塗る
    const inRed = isAngleInRange(segStartDeg + 1, redZone.start, redZone.end) ||
                  isAngleInRange(segEndDeg - 1, redZone.start, redZone.end) ||
                  (redZone.start > redZone.end && (segStartDeg >= redZone.start || segEndDeg <= redZone.end));

    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.arc(CENTER, CENTER, RADIUS, startAngle, endAngle, false);
    ctx.closePath();

    ctx.fillStyle = inRed ? '#ff4444' : '#eeeeee';
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }

  // 針を描画
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

// 赤ゾーンの開始角度をランダムにセット（0～360-180）
function setRandomRedZone() {
  redZone.start = Math.floor(Math.random() * 180);
  redZone.end = (redZone.start + 180) % 360;
}

// ルーレット更新ループ
function update() {
  if (!isFishing) return;

  if (isSpinning) {
    needleSpeed *= 0.98; // 徐々に減速
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
  } else {
    needleAngle += needleSpeed; // 微速回転（任意）
  }

  needleAngle %= (2 * Math.PI);
  drawRoulette();
  requestAnimationFrame(update);
}

// スピン開始
function startSpin() {
  if (isSpinning) return;
  isSpinning = true;
  needleSpeed = 0.4; // 初速
  reelButton.disabled = true;

  if (sfxRouletteLoop) {
    sfxRouletteLoop.currentTime = 0;
    sfxRouletteLoop.play();
  }
}

// 結果判定
function checkResult() {
  const needleDeg = radToDeg(needleAngle);
  const hit = isAngleInRange(needleDeg, redZone.start, redZone.end);

  if (hit) {
    fishingResult.textContent = "ヒット！";
    if (sfxHit) { sfxHit.currentTime = 0; sfxHit.play(); }

    setTimeout(() => {
      fishingResult.textContent = "";
      removeCaughtDog();
      showCatchOverlay(selectedDogId);
      isFishing = false;
    }, 1000);

  } else {
    fishingResult.textContent = "逃げられた...";
    if (sfxMiss) { sfxMiss.currentTime = 0; sfxMiss.play(); }

    setTimeout(() => {
      fishingResult.textContent = "";
      fishingUI.style.display = 'none';
      isFishing = false;
    }, 1000);
  }
}

// 釣り開始（犬画像のクリックで呼ばれる）
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
  needleSpeed = 0.1;
  isSpinning = false;

  setRandomRedZone();

  drawRoulette();
  update();
}

// 釣れた犬を消す
function removeCaughtDog() {
  document.querySelectorAll(`[data-dog-id="${selectedDogId}"]`).forEach(el => el.remove());
}

// 捕獲オーバーレイ表示
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
    img.src = '';
    msg.textContent = '犬のデータが読み込まれませんでした。';
    img.style.boxShadow = '';
  } else {
    img.src = dogData.image || '';
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
  if (sfxCatch) {
    sfxCatch.currentTime = 0;
    sfxCatch.play();
  }
}

// 閉じるボタン処理
document.getElementById('catch-close').addEventListener('click', () => {
  document.getElementById('catch-overlay').style.display = 'none';
  fishingUI.style.display = 'none';
});

// リールボタンクリック
reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  startSpin();
  if (sfxStopClick) {
    sfxStopClick.currentTime = 0;
    sfxStopClick.play();
  }
});
