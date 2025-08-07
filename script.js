const waterArea = document.getElementById('water-area');
const bgm = document.getElementById('bgm');
const shopBtn = document.getElementById('shop-btn');
const shopPanel = document.getElementById('shop-panel');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');
const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

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

function togglePanel(panel) {
  if (isFishing) return;
  const isOpen = panel.style.display === 'block';
  if (isOpen) {
    panel.style.display = 'none';
    sfxClose.play().catch(() => {});
  } else {
    [shopPanel].forEach(p => {
      if (p !== panel) p.style.display = 'none';
    });
    panel.style.display = 'block';
    sfxOpen.play().catch(() => {});
  }
}

shopBtn.addEventListener('click', () => togglePanel(shopPanel));

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
      if (isFishing || shopPanel.style.display === 'block') return;
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

  hitZoneStart = Math.random() * 2 * Math.PI;
  hitZoneEnd = hitZoneStart + Math.PI;
  if (hitZoneEnd > 2 * Math.PI) hitZoneEnd -= 2 * Math.PI;

  angle = 0;
  spinSpeed = 0.3;
  spinning = true;
  slowingDown = false;

  drawRoulette();
}

reelButton.addEventListener('click', () => {
  if (!spinning || slowingDown) return;
  slowingDown = true;
});

function drawRoulette() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const center = canvas.width / 2;

  ctx.beginPath();
  ctx.arc(center, center, center - 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#eef';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(center, center, center - 10, hitZoneStart, hitZoneEnd);
  ctx.fillStyle = '#f00';
  ctx.fill();

  const needleLength = center - 20;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + needleLength * Math.cos(angle), center + needleLength * Math.sin(angle));
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.stroke();

  if (spinning) {
    angle += spinSpeed;

    if (slowingDown) {
      spinSpeed -= 0.005;
      if (spinSpeed <= 0) {
        spinSpeed = 0;
        spinning = false;
        slowingDown = false;
        cancelAnimationFrame(animationId);
        checkHit();
        return;
      }
    }

    animationId = requestAnimationFrame(drawRoulette);
  }
}

function showCatchOverlay(dogName, dogImageUrl) {
  const overlay = document.getElementById('catch-overlay');
  const img = document.getElementById('caught-dog-img');
  const message = document.getElementById('caught-message');

  img.src = dogImageUrl;
  message.textContent = `${dogName} をつかまえた！`;

  overlay.style.display = 'block';
}

document.getElementById('catch-close').addEventListener('click', () => {
  document.getElementById('catch-overlay').style.display = 'none';
});

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

    setTimeout(() => {
      fishingUI.style.display = 'none';
      fishingResult.textContent = "";

      const dogName = selectedDog.dog.name;
      const dogImage = selectedDog.img.src;

      showCatchOverlay(dogName, dogImage);

      const dogId = selectedDog.dog.number;
      if (!caughtDogsMap[dogId]) {
        caughtDogsMap[dogId] = selectedDog.dog;
        localStorage.setItem('caughtDogs', JSON.stringify(caughtDogsMap));
      }

      isFishing = false;
      selectedDog.img.remove();
      selectedDog = null;
    }, 1500);
  } else {
    fishingResult.textContent = "逃げられた…";

    setTimeout(() => {
      fishingUI.style.display = 'none';
      fishingResult.textContent = "";

      if (selectedDog && selectedDog.img) {
        selectedDog.img.remove();
      }

      isFishing = false;
      selectedDog = null;
    }, 1500);
  }
}
  
// ✅ これを checkHit の外に完全に出す！
window.addEventListener('load', () => {
  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      weightedDogs = createWeightedDogs(data);
      spawnDogs();
    });
});







