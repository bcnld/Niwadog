import { calculateHitZones } from './fishingCalc.js';

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
let hitZones = []; // 複数の当たり判定ゾーン（start,endの配列）
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

  // ルーレットの当たり判定ゾーンを複数計算 (fishingCalc.jsの関数利用)
  hitZones = calculateHitZones(selectedDog.dog.probability);

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

function drawRoulette() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const center = canvas.width / 2;

  // ベース円
  ctx.beginPath();
  ctx.arc(center, center, center - 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#eef';
  ctx.fill();

  // 複数の当たり判定ゾーンを赤で表示
  for (const zone of hitZones) {
    ctx.beginPath();
    ctx.moveTo(center, center);

    if (zone.start < zone.end) {
      ctx.arc(center, center, center - 10, zone.start, zone.end, false);
      ctx.lineTo(center, center);
      ctx.closePath();
      ctx.fillStyle = '#f00';
      ctx.fill();
    } else {
      // 逆転している場合、2つに分けて描画

      // 1つめの扇形
      ctx.arc(center, center, center - 10, zone.start, 2 * Math.PI, false);
      ctx.lineTo(center, center);
      ctx.closePath();
      ctx.fillStyle = '#f00';
      ctx.fill();

      // 2つめの扇形
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, center - 10, 0, zone.end, false);
      ctx.lineTo(center, center);
      ctx.closePath();
      ctx.fillStyle = '#f00';
      ctx.fill();
    }
  }

  // 針の描画
  const needleLength = center - 20;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + needleLength * Math.cos(angle), center + needleLength * Math.sin(angle));
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 釣り中の回転処理は外部で行う想定
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

        const hit = checkHit();

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

        return;
      }
    }

    animationId = requestAnimationFrame(drawRoulette);
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

function checkHit() {
  const normalized = angle % (2 * Math.PI);
  let hit = false;

  for (const zone of hitZones) {
    if (zone.start < zone.end) {
      if (normalized >= zone.start && normalized <= zone.end) {
        hit = true;
        break;
      }
    } else {
      if (normalized >= zone.start || normalized <= zone.end) {
        hit = true;
        break;
      }
    }
  }

  return hit;
}

