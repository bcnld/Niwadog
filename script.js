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
let fishingActive = false; // 釣り中かどうか判定用

function handleOrientation() {
  if (window.innerHeight > window.innerWidth) {
    orientationWarning.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    orientationWarning.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
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

    // 犬クリックで釣り開始。ただし釣り中は無効化
    img.onclick = () => {
      if (fishingActive) return; // 釣り中は無視
      currentDog = dog;
      startFishing();
    };

    waterArea.appendChild(img);
    spawnedDogs.push({ img, dog });
  }
}

// 釣りUI起動（重複アニメーション防止）
function startFishing() {
  fishingActive = true;
  const fishingUI = document.getElementById('fishing-ui');
  const pointer = document.getElementById('pointer');
  document.getElementById('fishing-result').textContent = '';
  pointer.style.animationPlayState = 'running';

  // 釣りUI表示
  fishingUI.style.display = 'block';
}

// 釣り判定＆終了
function stopFishing() {
  if (!fishingActive) return; // 既に停止済みなら無視
  fishingActive = false;

  const fishingUI = document.getElementById('fishing-ui');
  const fishingResult = document.getElementById('fishing-result');
  const pointer = document.getElementById('pointer');
  const targetZone = document.getElementById('target-zone');

  pointer.style.animationPlayState = 'paused';

  const pRect = pointer.getBoundingClientRect();
  const tRect = targetZone.getBoundingClientRect();

  let caught = false;
  if (pRect.left >= tRect.left && pRect.right <= tRect.right) {
    fishingResult.textContent = '🎯 ヒット！犬が釣れた！';
    if (currentDog && !caughtDogsMap[currentDog.name]) {
      caughtDogsMap[currentDog.name] = currentDog;
      updateZukan();
    }
    caught = true;
  } else {
    fishingResult.textContent = '💨 のがした…';
  }

  // 犬を確実に削除する処理
  if (currentDog) {
    const targetSpawn = spawnedDogs.find(s => s.dog === currentDog);
    if (targetSpawn) {
      if (waterArea.contains(targetSpawn.img)) {
        waterArea.removeChild(targetSpawn.img);
      }
      spawnedDogs = spawnedDogs.filter(s => s.dog !== currentDog);
    }
  }

  currentDog = null;

  setTimeout(() => {
    fishingUI.style.display = 'none';
    pointer.style.animationPlayState = 'running';
  }, 1500);
}

document.getElementById('reel-button').onclick = stopFishing;

window.addEventListener('load', () => {
  handleOrientation();
  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      weightedDogs = createWeightedDogs(dogData);
      spawnDogs();
    })
    .catch(console.error);
});

window.addEventListener('resize', handleOrientation);
window.addEventListener('orientationchange', handleOrientation);
