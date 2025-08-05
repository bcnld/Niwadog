const waterArea = document.getElementById('water-area');
const bgm = document.getElementById('bgm');
const zukanBtn = document.getElementById('zukan-btn');
const shopBtn = document.getElementById('shop-btn');
const zukanPanel = document.getElementById('zukan-panel');
const shopPanel = document.getElementById('shop-panel');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');
const zukanList = document.getElementById('zukan-list');
const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const pointer = document.getElementById('pointer');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

let dogData = [], weightedDogs = [], spawnedDogs = [];
let caughtDogsMap = {};
let isFishing = false, selectedDog = null;
const maxDogs = 6, bottomLandHeight = 100;

let angle = 0;
let spinSpeed = 0;
let spinning = false;
let slowingDown = false;
let animationFrameId;
let hitZoneStart = 0;
let hitZoneEnd = 0;

// BGM 初回再生
document.body.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

// パネル開閉
function togglePanel(panel) {
  if (fishingUI.style.display === 'block') return;
  const isOpen = panel.style.display === 'block';
  if (isOpen) {
    panel.style.display = 'none';
    sfxClose.play().catch(() => {});
  } else {
    [zukanPanel, shopPanel].forEach(p => {
      if (p !== panel) p.style.display = 'none';
    });
    panel.style.display = 'block';
    sfxOpen.play().catch(() => {});
  }
}

zukanBtn.addEventListener('click', () => togglePanel(zukanPanel));
shopBtn.addEventListener('click', () => togglePanel(shopPanel));

// 図鑑更新
function updateZukan() {
  zukanList.innerHTML = '';
  for (const name in caughtDogsMap) {
    const dog = caughtDogsMap[name];
    const div = document.createElement('div');
    div.textContent = dog.name;
    div.style.cursor = 'pointer';
    div.style.border = '1px solid #ccc';
    div.style.margin = '5px';
    div.style.padding = '5px';
    div.addEventListener('click', () => alert(dog.description));
    zukanList.appendChild(div);
  }
}

// 重み付き犬配列
function createWeightedDogs(dogs) {
  const weighted = [];
  dogs.forEach(dog => {
    const times = Math.max(1, Math.round(100 * dog.probability));
    for (let i = 0; i < times; i++) weighted.push(dog);
  });
  return weighted;
}

// 犬出現
function spawnDogs() {
  waterArea.innerHTML = '';
  spawnedDogs = [];
  const isMobile = window.innerWidth <= 600;
  const dogSize = isMobile ? 50 : 70;
  const maxX = waterArea.clientWidth - dogSize;
  const maxY = waterArea.clientHeight - bottomLandHeight - dogSize;

  for (let i = 0; i < maxDogs; i++) {
    const dog = weightedDogs[Math.floor(Math.random() * weightedDogs.length)];
    const img = document.createElement('img');
    img.src = dog.image;
    img.alt = dog.name;
    img.title = `${dog.name}（${dog.rarity}）\n${dog.description}`;
    img.className = 'dog';
    img.style.position = 'absolute';
    img.style.width = `${dogSize}px`;
    img.style.height = `${dogSize}px`;
    img.style.pointerEvents = 'auto';

    let posX = Math.random() * maxX;
    let posY = Math.random() * maxY;
    let vx = (Math.random() * 2 - 1) * 0.5;
    let vy = (Math.random() * 2 - 1) * 0.5;

    img.style.left = `${posX}px`;
    img.style.top = `${posY}px`;

    function move() {
      posX += vx;
      posY += vy;
      if (posX < 0 || posX > maxX) vx = -vx;
      if (posY < 0 || posY > maxY) vy = -vy;
      img.style.left = `${Math.max(0, Math.min(maxX, posX))}px`;
      img.style.top = `${Math.max(0, Math.min(maxY, posY))}px`;
      requestAnimationFrame(move);
    }
    move();

    img.addEventListener('click', () => {
      if (isFishing || zukanPanel.style.display === 'block' || shopPanel.style.display === 'block') return;
      selectedDog = { img, dog };
      startFishing();
    });

    waterArea.appendChild(img);
    spawnedDogs.push(img);
  }
}

function startFishing() {
  isFishing = true;
  fishingResult.textContent = '';
  fishingUI.style.display = 'block';

  // ランダムな当たり範囲を設定（0.3rad分）
  const randomCenter = Math.random() * 2 * Math.PI;
  const zoneSize = Math.PI / 5; // 約36度
  hitZoneStart = randomCenter - zoneSize / 2;
  hitZoneEnd = randomCenter + zoneSize / 2;

  angle = 0;
  spinSpeed = 0.25 + Math.random() * 0.25;
  spinning = true;

  cancelAnimationFrame(animationFrameId); // 前回のループ停止
  drawRoulette();
}

function drawRoulette() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const center = canvas.width / 2;

  // 背景円
  ctx.beginPath();
  ctx.arc(center, center, center - 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#eef';
  ctx.fill();

  // ヒットゾーン
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(center, center, center - 10, hitZoneStart, hitZoneEnd);
  ctx.fillStyle = '#f00';
  ctx.fill();

  // 針
  const needleLength = center - 20;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(
    center + needleLength * Math.cos(angle),
    center + needleLength * Math.sin(angle)
  );
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.stroke();

  if (spinning) {
    angle += spinSpeed;
    animationFrameId = requestAnimationFrame(drawRoulette);
  }
}

// 減速処理
function stopRoulette() {
  function decelerate() {
    if (spinSpeed > 0.01) {
      spinSpeed *= 0.97; // 減速
      angle += spinSpeed;
      drawRoulette();
      animationFrameId = requestAnimationFrame(decelerate);
    } else {
      spinning = false;
      checkHit();
    }
  }
  cancelAnimationFrame(animationFrameId);
  decelerate();
}

// リールボタン押下
reelButton.addEventListener('click', () => {
  if (!spinning) return;
  stopRoulette();
});

// 当たり判定
function checkHit() {
  const normalizedAngle = angle % (2 * Math.PI);

  const isHit =
    hitZoneStart < hitZoneEnd
      ? normalizedAngle >= hitZoneStart && normalizedAngle <= hitZoneEnd
      : normalizedAngle >= hitZoneStart || normalizedAngle <= hitZoneEnd;

  if (isHit) {
    fishingResult.textContent = '🎯 ヒット！犬が釣れた！';
    if (!caughtDogsMap[selectedDog.dog.name]) {
      caughtDogsMap[selectedDog.dog.name] = selectedDog.dog;
      updateZukan();
    }
    selectedDog.img.remove();
  } else {
    fishingResult.textContent = '💨 のがした…';
    selectedDog.img.remove();
  }

  setTimeout(() => {
    fishingUI.style.display = 'none';
    isFishing = false;
  }, 1500);
}

// 犬データ読み込み
window.addEventListener('load', () => {
  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      weightedDogs = createWeightedDogs(dogData);
      spawnDogs();
    });
});




