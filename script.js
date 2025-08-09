const waterArea = document.getElementById('water-area');
const bgm = document.getElementById('bgm');
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

let dogData = [], weightedDogs = [], spawnedDogs = [];
let caughtDogsMap = {};
let isFishing = false, selectedDog = null;
const maxDogs = 6, bottomLandHeight = 100;

let angle = 0, spinSpeed = 0;
let spinning = false, slowingDown = false;
let hitZoneStart = 0, hitZoneEnd = 0;
let animationId = null;

// BGM 初回再生
document.body.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

function createWeightedDogs(dogs) {
  const weighted = [];
  dogs.forEach(dog => {
    const times = Math.max(1, Math.round(100 * dog.probability));
    for (let i = 0; i < times; i++) weighted.push(dog);
  });
  return weighted;
}

window.addEventListener('load', () => {
  const stored = localStorage.getItem('caughtDogs');
  if (stored) caughtDogsMap = JSON.parse(stored);

  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      weightedDogs = createWeightedDogs(data);
      spawnDogs();
    });
});

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

    let moveAnimationId;

    function move() {
      posX += vx;
      posY += vy;
      if (posX < 0 || posX > maxX) vx = -vx;
      if (posY < 0 || posY > maxY) vy = -vy;
      img.style.left = `${Math.max(0, Math.min(maxX, posX))}px`;
      img.style.top = `${Math.max(0, Math.min(maxY, posY))}px`;
      moveAnimationId = requestAnimationFrame(move);
    }
    move();

    img._moveAnimationId = moveAnimationId;

    img.addEventListener('click', () => {
      if (isFishing || window.isZukanOpen || window.isShopOpen) return;
      selectedDog = { img, dog };
      startFishing();
    });

    waterArea.appendChild(img);
    spawnedDogs.push(img);
  }
}

function startFishing() {
  isFishing = true;
  window.isFishing = isFishing;
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
}

reelButton.addEventListener('click', () => {
  if (!spinning || slowingDown) return;
  slowingDown = true;

  sfxStopClick.currentTime = 0;
  sfxStopClick.play();
});

const segments = 16; // 16分割
const hitIndices = [2, 5, 9, 14]; // 当たりのパネル番号例（好きに変更OK）

function drawRoulette() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const center = canvas.width / 2;
  const radius = center - 10;
  const segmentAngle = (2 * Math.PI) / segments;

  // 円本体（白っぽいベース）
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#fafafa';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#666';
  ctx.stroke();

  for (let i = 0; i < segments; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = startAngle + segmentAngle;

    // 扇形の側面を塗り分けるためにポリゴンっぽく描く（カジノホイールの区切りのイメージ）
    ctx.beginPath();
    // 円周上の2点
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    // 内側の少し小さな半径（側面の幅を作る）
    const innerRadius = radius - 20;
    const x3 = center + innerRadius * Math.cos(endAngle);
    const y3 = center + innerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(startAngle);
    const y4 = center + innerRadius * Math.sin(startAngle);

    // 順番に線を引いてポリゴン作成
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();

    // 当たり区間は赤、それ以外は交互に黒・白
    if (hitIndices.includes(i)) {
      ctx.fillStyle = '#e74c3c'; // 赤
    } else {
      ctx.fillStyle = (i % 2 === 0) ? '#fff' : '#000';
    }
    ctx.fill();

    // 黒の境界線
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 中心の円（穴のような部分）
  ctx.beginPath();
  ctx.arc(center, center, innerRadius - 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#444';
  ctx.fill();

  // 針の描画（中心から外に伸びる矢印みたいな形）
  const needleLength = radius - 10;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + needleLength * Math.cos(angle), center + needleLength * Math.sin(angle));
  ctx.strokeStyle = '#f1c40f'; // ゴールドっぽく
  ctx.lineWidth = 5;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 8;
  ctx.stroke();
}

  if (spinning) {
    angle += spinSpeed;

    if (slowingDown) {
      spinSpeed -= 0.005;
      if (spinSpeed <= 0) {
        spinSpeed = 0;
        spinning = false;
        slowingDown = false;
        cancelAnimationFrame(animationId);

        sfxRouletteLoop.pause();
        sfxWheelStop.currentTime = 0;
        sfxWheelStop.play();

        checkHit();

        return;
      }
    }

    animationId = requestAnimationFrame(drawRoulette);
  }
}

function checkHit() {
  const normalized = angle % (2 * Math.PI);
  let hit = false;

  if (hitZoneStart < hitZoneEnd) {
    hit = normalized >= hitZoneStart && normalized <= hitZoneEnd;
  } else {
    hit = normalized >= hitZoneStart || normalized <= hitZoneEnd;
  }

  if (hit) {
    fishingResult.textContent = "ヒット！";

    sfxHit.currentTime = 0;
    sfxHit.play();

    setTimeout(() => {
      fishingUI.style.display = 'none';
      fishingResult.textContent = "";

      const dogName = selectedDog.dog.name;
      const dogImage = selectedDog.img.src;
      const dogId = Number(selectedDog.dog.number);

      showCatchOverlay(dogImage, dogName);

      if (!caughtDogsMap[dogId]) {
        caughtDogsMap[dogId] = selectedDog.dog;
        localStorage.setItem('caughtDogs', JSON.stringify(caughtDogsMap));
      }

      if (selectedDog.img._moveAnimationId) {
        cancelAnimationFrame(selectedDog.img._moveAnimationId);
      }

      selectedDog.img.remove();

      isFishing = false;
      window.isFishing = isFishing;
      selectedDog = null;

      if (typeof updateZukan === 'function') {
        updateZukan();
      }
    }, 1500);
  } else {
    fishingResult.textContent = "逃げられた…";

    sfxMiss.currentTime = 0;
    sfxMiss.play();

    setTimeout(() => {
      fishingUI.style.display = 'none';
      fishingResult.textContent = "";

      if (selectedDog && selectedDog.img) {
        if (selectedDog.img._moveAnimationId) {
          cancelAnimationFrame(selectedDog.img._moveAnimationId);
        }
        selectedDog.img.remove();
      }

      isFishing = false;
      window.isFishing = isFishing;
      selectedDog = null;
    }, 1500);
  }
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    catchOverlay.classList.remove('active');
    if (sfxStopClick) {
      sfxStopClick.currentTime = 0;
      sfxStopClick.play();
    }
  });
}

function showCatchOverlay(dogImageSrc, dogName) {
  const caughtImg = document.getElementById('caught-dog-img');
  const caughtMessage = document.getElementById('caught-message');

  if (caughtImg && caughtMessage && catchOverlay) {
    caughtImg.src = dogImageSrc;
    caughtMessage.textContent = `${dogName} をつかまえた！`;
    catchOverlay.classList.add('active');

    if (sfxCatch) {
      sfxCatch.currentTime = 0;
      sfxCatch.play();
    }
  }
}

