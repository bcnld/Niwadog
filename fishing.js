// dog.jsonから犬データを先読み込み
window.allDogs = [];
fetch("dog.json")
  .then(res => res.json())
  .then(data => {
    window.allDogs = data;
    console.log("犬データ読み込み完了:", window.allDogs);
    attachFishingEvents(); // 犬画像クリックイベント付与
  })
  .catch(err => {
    console.error("犬データの読み込みに失敗:", err);
  });

// 所持している釣った犬IDのリスト（重複あり）
window.caughtDogsInventory = [];

// プレイヤーの所持金（釣りとは別に管理）
window.playerMoney = 0;

// UI要素取得
const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = CANVAS_SIZE / 2 - 20;
const SEGMENTS = 12;

let isFishing = false;
let selectedDogElement = null; // 変更: 犬のDOM要素を保持
let selectedDogId = null;
let needleAngle = 0;
let needleSpeed = 0;
let isSpinning = false;

let stopPressed = false; // 追加: 「止める」ボタン押下状態管理

// 効果音
const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
const sfxWheelStop = document.getElementById('sfx-wheel-stop');
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxHit = document.getElementById('sfx-hit');
const sfxMiss = document.getElementById('sfx-miss');
const sfxCatch = document.getElementById('sfx-catch');

// 赤ゾーン（180度幅、開始角度ランダム）
let redZone = { start: 0, end: 180 };

function radToDeg(rad) {
  return (rad * 180 / Math.PI + 360) % 360;
}

function isAngleInRange(angle, start, end) {
  if (start <= end) {
    return angle >= start && angle <= end;
  } else {
    return angle >= start || angle <= end;
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

function setRandomRedZone() {
  redZone.start = Math.floor(Math.random() * 180);
  redZone.end = (redZone.start + 180) % 360;
}

function update() {
  if (!isFishing) return;

  if (isSpinning) {
    needleSpeed *= 0.98;
    needleAngle += needleSpeed;
    if (needleSpeed < 0.002) {
      needleSpeed = 0;
      isSpinning = false;
      reelButton.disabled = false; // 回転終了後ボタン復活（ただしstopPressed管理で再押下制御）
      if (sfxRouletteLoop) sfxRouletteLoop.pause();
      if (sfxWheelStop) {
        sfxWheelStop.currentTime = 0;
        sfxWheelStop.play();
      }
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
  if (isSpinning || stopPressed) return; // すでに止め押下済みなら何もしない
  isSpinning = true;
  needleSpeed = 0.4;
  reelButton.disabled = true; // 押せなくする
  stopPressed = true;         // 押されたフラグを立てる
  if (sfxRouletteLoop) {
    sfxRouletteLoop.currentTime = 0;
    sfxRouletteLoop.play();
  }
  if (sfxStopClick) {
    sfxStopClick.currentTime = 0;
    sfxStopClick.play();
  }
}

function checkResult() {
  const needleDeg = radToDeg(needleAngle);
  const hit = isAngleInRange(needleDeg, redZone.start, redZone.end);

  if (hit) {
    fishingResult.textContent = "ヒット！";
    if (sfxHit) { sfxHit.currentTime = 0; sfxHit.play(); }
    addCaughtDog(selectedDogId);
    if (typeof registerDog === "function") {
      registerDog(selectedDogId); // 図鑑登録も行う
    }

    setTimeout(() => {
      fishingResult.textContent = "";
      removeCaughtDog();
      showCatchOverlay(selectedDogId);

      if (typeof renderZukanPage === "function") {
        renderZukanPage();
      }
      if (typeof renderShopInventory === "function") {
        renderShopInventory();
      }

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

function startFishing(dogElement) {
  if (isFishing) return;
  if (!window.allDogs.length) {
    alert("犬データがまだ読み込まれていません！");
    return;
  }
  isFishing = true;
  selectedDogElement = dogElement;       // クリックした犬DOMを保持
  selectedDogId = dogElement.dataset.dogId;

  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  needleAngle = 0;
  needleSpeed = 0.1;
  isSpinning = false;

  stopPressed = false;   // 釣り開始時にリセット
  reelButton.disabled = false;

  setRandomRedZone();
  drawRoulette();
  update();
}

function removeCaughtDog() {
  // 選択された犬のDOM要素だけ削除する
  if (selectedDogElement && selectedDogElement.parentElement) {
    selectedDogElement.parentElement.removeChild(selectedDogElement);
  }
}

function showCatchOverlay(dogId) {
  const overlay = document.getElementById('catch-overlay');
  const img = document.getElementById('caught-dog-img');
  const msg = document.getElementById('caught-message');

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

document.getElementById('catch-close').addEventListener('click', () => {
  document.getElementById('catch-overlay').style.display = 'none';
  fishingUI.style.display = 'none';
});

reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  startSpin();
});

// 犬画像クリックイベントを付与（既存犬に対して）
function attachFishingEvents() {
  const dogElements = document.querySelectorAll('[data-dog-id]');
  dogElements.forEach(el => {
    el.removeEventListener('click', dogClickHandler);
    el.addEventListener('click', dogClickHandler);
  });
}

function dogClickHandler(event) {
  if (isFishing) return;
  startFishing(event.currentTarget);
}

// 釣った犬を所持リストに追加
function addCaughtDog(dogId) {
  window.caughtDogsInventory.push(dogId);
  console.log(`犬ID ${dogId} を所持リストに追加しました。`);
}

// ショップ所持犬リストを再描画（簡易版）
function renderShopInventory() {
  const listDiv = document.getElementById('sell-dogs-list');
  if (!listDiv) return;

  listDiv.innerHTML = '';

  if (window.caughtDogsInventory.length === 0) {
    listDiv.textContent = '所持している犬はいません。';
    return;
  }

  const counts = {};
  window.caughtDogsInventory.forEach(id => {
    counts[id] = (counts[id] || 0) + 1;
  });

  Object.entries(counts).forEach(([dogId, count]) => {
    const dog = window.allDogs.find(d => String(d.number) === String(dogId));
    if (!dog) return;

    const itemDiv = document.createElement('div');
    itemDiv.textContent = `${dog.name} × ${count}`;
    listDiv.appendChild(itemDiv);
  });
}
