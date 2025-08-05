// 要素取得
const waterArea = document.getElementById('water-area');
const orientationWarning = document.getElementById('orientation-warning');
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
const reelButton = document.getElementById('reel-button');
const rouletteCanvas = document.getElementById('roulette-canvas');
const ctx = rouletteCanvas.getContext('2d');

const maxDogs = 6;
const bottomLandHeight = 100;

let dogData = [];
let weightedDogs = [];
let spawnedDogs = [];
let caughtDogsMap = {};
let isFishing = false;
let selectedDog = null;
let angle = 0;
let spinSpeed = 0.2;
let isSpinning = false;

// 向きチェック
function checkOrientation() {
  if (window.matchMedia("(orientation: portrait)").matches) {
    orientationWarning.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    orientationWarning.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// パネル開閉
function togglePanel(panel) {
  const isOpen = panel.style.display === 'block';
  if (isOpen) {
    panel.style.display = 'none';
    sfxClose.play().catch(() => {});
  } else {
    [zukanPanel, shopPanel].forEach(p => {
      if (p !== panel && p.style.display === 'block') {
        p.style.display = 'none';
        sfxClose.play().catch(() => {});
      }
    });
    panel.style.display = 'block';
    sfxOpen.play().catch(() => {});
  }
}
zukanBtn.addEventListener('click', () => togglePanel(zukanPanel));
shopBtn.addEventListener('click', () => togglePanel(shopPanel));

// BGM再生
document.body.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

function updateZukan() {
  zukanList.innerHTML = '';
  for (const dogName in caughtDogsMap) {
    const dog = caughtDogsMap[dogName];
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

  for (let i = 0; i < maxDogs; i++) {
    const dog = weightedDogs[Math.floor(Math.random() * weightedDogs.length)];
    const img = document.createElement('img');
    img.src = dog.image;
    img.alt = dog.name;
    img.title = `${dog.name}（${dog.rarity}）\n${dog.description}`;
    img.className = 'dog';
    img.style.width = `${dogSize}px`;
    img.style.height = `${dogSize}px`;

    const maxX = waterArea.clientWidth - dogSize;
    const maxY = waterArea.clientHeight - bottomLandHeight - dogSize;

    let posX = Math.random() * maxX;
    let posY = Math.random() * maxY;
    img.style.left = `${posX}px`;
    img.style.top = `${posY}px`;

    let vx = (Math.random() * 2 - 1) * 0.5;
    let vy = (Math.random() * 2 - 1) * 0.5;

    function move() {
      if (!img.parentNode) return;
      posX += vx;
      posY += vy;
      if (posX < 0 || posX > maxX) vx = -vx;
      if (posY < 0 || posY > maxY) vy = -vy;
      img.style.left = Math.max(0, Math.min(maxX, posX)) + 'px';
      img.style.top = Math.max(0, Math.min(maxY, posY)) + 'px';
      requestAnimationFrame(move);
    }
    move();

    img.addEventListener('click', () => {
      if (isFishing) return;
      isFishing = true;
      startFishing(img, dog);
    });

    waterArea.appendChild(img);
    spawnedDogs.push({ img, dog });
  }
}

function drawRoulette() {
  ctx.clearRect(0, 0, rouletteCanvas.width, rouletteCanvas.height);
  const centerX = rouletteCanvas.width / 2;
  const centerY = rouletteCanvas.height / 2;
  const radius = 140;

  // 的ゾーンを描く
  ctx.beginPath();
  ctx.fillStyle = '#ff0000';
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, Math.PI / 3, Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  // ポインターを描く
  const pointerX = centerX + Math.cos(angle) * radius;
  const pointerY = centerY + Math.sin(angle) * radius;
  ctx.beginPath();
  ctx.fillStyle = '#0000ff';
  ctx.arc(pointerX, pointerY, 10, 0, Math.PI * 2);
  ctx.fill();
}

function animateRoulette() {
  if (!isSpinning) return;
  angle += spinSpeed;
  drawRoulette();

  // 徐々に減速して最終的に止まる
  if (spinSpeed > 0.002) {
    spinSpeed *= 0.985;
    requestAnimationFrame(animateRoulette);
  } else {
    checkFishingResult();
  }
}

function startFishing(img, dog) {
  selectedDog = { img, dog };
  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  spinSpeed = 0.2;
  isSpinning = true;
  angle = 0;
  animateRoulette();
}

function checkFishingResult() {
  // 成功ゾーンに角度があるか確認（30度〜90度）
  const normalizedAngle = angle % (Math.PI * 2);
  if (normalizedAngle >= Math.PI / 3 && normalizedAngle <= Math.PI / 2) {
    fishingResult.textContent = '🎯 ヒット！犬が釣れた！';
    if (selectedDog && !caughtDogsMap[selectedDog.dog.name]) {
      caughtDogsMap[selectedDog.dog.name] = selectedDog.dog;
      updateZukan();
    }
  } else {
    fishingResult.textContent = '💨 のがした…';
  }

  if (selectedDog) {
    selectedDog.img.remove();
  }

  setTimeout(() => {
    fishingUI.style.display = 'none';
    isFishing = false;
  }, 1500);
}

reelButton.addEventListener('click', () => {
  isSpinning = false;
});

window.addEventListener('load', () => {
  checkOrientation();

  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      weightedDogs = createWeightedDogs(dogData);
      spawnDogs();
    })
    .catch(err => console.error('dog.json 読み込みエラー:', err));
});

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
