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
const maxDogs = 6;
const bottomLandHeight = 100;

let dogData = [], weightedDogs = [], spawnedDogs = [], caughtDogsMap = {}, currentDog = null;

function checkOrientation() {
  const portrait = window.matchMedia("(orientation: portrait)").matches;
  orientationWarning.style.display = portrait ? 'flex' : 'none';
  document.body.style.overflow = portrait ? 'hidden' : 'auto';
}

document.body.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

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
zukanBtn.onclick = () => togglePanel(zukanPanel);
shopBtn.onclick = () => togglePanel(shopPanel);

function updateZukan() {
  zukanList.innerHTML = '';
  Object.values(caughtDogsMap).forEach(dog => {
    const div = document.createElement('div');
    div.textContent = dog.name;
    div.style.cssText = 'cursor:pointer;border:1px solid #ccc;margin:5px;padding:5px;';
    div.onclick = () => alert(dog.description);
    zukanList.appendChild(div);
  });
}

function createWeightedDogs(dogs) {
  return dogs.flatMap(dog => Array(Math.max(1, Math.round(dog.probability * 100))).fill(dog));
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
    img.style.pointerEvents = 'auto';  // クリック判定を有効にする（cssでも可）
    Object.assign(img.style, {
      position: 'absolute',
      width: dogSize + 'px',
      height: 'auto',
      pointerEvents: 'auto',
      cursor: 'pointer',
      left: `${Math.random() * maxX}px`,
      top: `${Math.random() * maxY}px`
    });

    let posX = parseFloat(img.style.left), posY = parseFloat(img.style.top);
    let vx = (Math.random() * 2 - 1) * 0.5, vy = (Math.random() * 2 - 1) * 0.5;

    (function move() {
      posX += vx; posY += vy;
      if (posX < 0 || posX > maxX) vx = -vx;
      if (posY < 0 || posY > maxY) vy = -vy;
      img.style.left = Math.min(Math.max(posX, 0), maxX) + 'px';
      img.style.top = Math.min(Math.max(posY, 0), maxY) + 'px';
      requestAnimationFrame(move);
    })();

    img.onclick = () => {
      currentDog = dog;
      startFishing();
    };

    waterArea.appendChild(img);
    spawnedDogs.push({ img, dog });
  }
}

/* --- ここからルーレット釣りシステム --- */

const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

let rotation = 0;
let rotating = false;
let decelerating = false;
let animationId = null;

const successStartAngle = Math.PI / 4;      // 成功範囲開始（45度）
const successEndAngle = Math.PI / 2;        // 成功範囲終了（90度）

function resizeCanvas() {
  canvas.width = 300;
  canvas.height = 300;
}
resizeCanvas();

function drawRoulette() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 140;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景円
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#a0d8f7';
  ctx.fill();

  // 成功ゾーン
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, successStartAngle, successEndAngle);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.fill();

  // セグメント分割線（8分割）
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  for(let i = 0; i < 8; i++) {
    const angle = i * (Math.PI * 2 / 8) + rotation;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.stroke();
  }

  // 外円の縁
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 針（赤い線）
  const needleLength = radius + 20;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + needleLength * Math.cos(rotation), cy + needleLength * Math.sin(rotation));
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 5;
  ctx.stroke();
}

function animate() {
  if (!rotating) return;
  rotation += 0.05;
  if (rotation > Math.PI * 2) rotation -= Math.PI * 2;
  drawRoulette();
  animationId = requestAnimationFrame(animate);
}

function startFishing() {
  rotating = true;
  decelerating = false;
  rotation = 0;
  drawRoulette();
  document.getElementById('fishing-result').textContent = '';
  document.getElementById('fishing-ui').style.display = 'block';
  animate();
}

function stopFishing() {
  if (!rotating || decelerating) return;
  decelerating = true;

  let currentSpeed = 0.05;
  const deceleration = 0.0007;

  function decelerate() {
    if (currentSpeed > 0) {
      currentSpeed -= deceleration;
      if (currentSpeed < 0) currentSpeed = 0;

      rotation += currentSpeed;
      if (rotation > Math.PI * 2) rotation -= Math.PI * 2;

      drawRoulette();
      requestAnimationFrame(decelerate);
    } else {
      rotating = false;
      decelerating = false;

      const fishingResult = document.getElementById('fishing-result');

      // 成功判定（rotationは針の角度）
      let normalizedAngle = rotation % (Math.PI * 2);
      // successゾーンは successStartAngle 〜 successEndAngle
      if (normalizedAngle >= successStartAngle && normalizedAngle <= successEndAngle) {
        fishingResult.textContent = '🎯 ヒット！犬が釣れた！';
        if (currentDog && !caughtDogsMap[currentDog.name]) {
          caughtDogsMap[currentDog.name] = currentDog;
          updateZukan();
        }
      } else {
        fishingResult.textContent = '💨 のがした…';
      }

      setTimeout(() => {
        document.getElementById('fishing-ui').style.display = 'none';
        currentDog = null;
      }, 1500);
    }
  }
  decelerate();
}

document.getElementById('reel-button').onclick = stopFishing;

/* --- 初期化 --- */
window.addEventListener('load', () => {
  checkOrientation();

  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      weightedDogs = createWeightedDogs(dogData);
      spawnDogs();
    })
    .catch(console.error);
});

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
