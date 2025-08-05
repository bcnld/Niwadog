// 改善点：
// - startFishing時に多重起動を防止
// - stopFishing時に釣れた or 外れた犬を waterArea から削除
// - pointer の速度が加速しないよう毎回アニメーションをリセット
// - 横向き警告あり

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
const pointer = document.getElementById('pointer');
const targetZone = document.getElementById('target-zone');
const reelButton = document.getElementById('reel-button');

const maxDogs = 6;
const bottomLandHeight = 100;

let dogData = [], weightedDogs = [], spawnedDogs = [], caughtDogsMap = {}, currentDog = null, currentDogImg = null;
let fishingActive = false;

function checkOrientation() {
  const portrait = window.matchMedia("(orientation: portrait)").matches;
  orientationWarning.style.display = portrait ? 'flex' : 'none';
  document.body.style.overflow = portrait ? 'hidden' : 'auto';
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

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

document.body.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

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

    img.addEventListener('click', () => {
      if (!fishingActive) {
        currentDog = dog;
        currentDogImg = img;
        startFishing();
      }
    });

    waterArea.appendChild(img);
    spawnedDogs.push({ img, dog });
  }
}

function startFishing() {
  fishingActive = true;
  fishingResult.textContent = '';

  // アニメーションをリセット（高速化防止）
  pointer.style.animation = 'none';
  void pointer.offsetWidth; // 強制再描画
  pointer.style.animation = 'movePointer 2s linear infinite';

  fishingUI.style.display = 'block';
}

function stopFishing() {
  if (!fishingActive) return;
  fishingActive = false;

  pointer.style.animation = 'none';
  const pRect = pointer.getBoundingClientRect();
  const tRect = targetZone.getBoundingClientRect();

  let hit = (pRect.left >= tRect.left && pRect.right <= tRect.right);
  fishingResult.textContent = hit ? '🎯 ヒット！犬が釣れた！' : '💨 のがした…';

  if (hit && currentDog && !caughtDogsMap[currentDog.name]) {
    caughtDogsMap[currentDog.name] = currentDog;
    updateZukan();
  }

  if (currentDogImg) {
    currentDogImg.remove();
    currentDogImg = null;
  }

  setTimeout(() => {
    fishingUI.style.display = 'none';
    currentDog = null;
  }, 1500);
}

reelButton.onclick = stopFishing;

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
