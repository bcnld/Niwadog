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
const targetZone = document.getElementById('target-zone');
const reelButton = document.getElementById('reel-button');

let dogData = [], weightedDogs = [], spawnedDogs = [];
let caughtDogsMap = {};
let isFishing = false, selectedDog = null;
const maxDogs = 6, bottomLandHeight = 100;

// BGM初回再生
document.body.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

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

function createWeightedDogs(dogs) {
  const weighted = [];
  dogs.forEach(dog => {
    const times = Math.max(1, Math.round(100 * dog.probability));
    for (let i = 0; i < times; i++) weighted.push(dog);
  });
  return weighted;
}

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
      isFishing = true;
      selectedDog = { img, dog };
      fishingUI.style.display = 'block';
      pointer.style.animation = 'movePointer 2s linear infinite';
      pointer.style.animationPlayState = 'running';
    });

    waterArea.appendChild(img);
    spawnedDogs.push(img);
  }
}

// ルーレット釣り開始
function startFishing() {
  isFishing = true;
  fishingResult.textContent = '';
  fishingUI.style.display = 'block';
  angle = 0;
  spinSpeed = 0.25 + Math.random() * 0.25;
  spinning = true;
  drawRoulette();
}

// リールボタン押下時
reelButton.addEventListener('click', () => {
  if (!spinning) return;
  spinning = false;

  const hitZoneStart = Math.PI * 1.2;
  const hitZoneEnd = Math.PI * 1.5;
  const normalizedAngle = angle % (2 * Math.PI);

  if (normalizedAngle >= hitZoneStart && normalizedAngle <= hitZoneEnd) {
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
});

// ルーレット描画
function drawRoulette() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const center = canvas.width / 2;

  // 背景サークル
  ctx.beginPath();
  ctx.arc(center, center, center - 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#eef';
  ctx.fill();

  // ヒットゾーン（赤）
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(center, center, center - 10, Math.PI * 1.2, Math.PI * 1.5);
  ctx.fillStyle = '#f00';
  ctx.fill();

  // 回転針
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
    requestAnimationFrame(drawRoulette);
  }
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
