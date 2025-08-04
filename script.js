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

const maxDogs = 6;
const bottomLandHeight = 100;

let dogData = [];
let weightedDogs = [];
let spawnedDogs = [];
let caughtDogsMap = {};
let currentDog = null;  // ★クリックされた犬を記憶

// 画面向きチェック
function checkOrientation() {
  if (window.matchMedia("(orientation: portrait)").matches) {
    orientationWarning.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    orientationWarning.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// BGM初回クリック再生
document.body.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

// パネルの開閉処理
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

// 図鑑更新表示
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

// 重み付き配列作成
function createWeightedDogs(dogs) {
  const weighted = [];
  dogs.forEach(dog => {
    const times = Math.max(1, Math.round(100 * dog.probability));
    for (let i = 0; i < times; i++) {
      weighted.push(dog);
    }
  });
  return weighted;
}

// 犬をスポーン・移動
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
    img.style.position = 'absolute';
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
      posX += vx;
      posY += vy;
      if (posX < 0 || posX > maxX) vx = -vx;
      if (posY < 0 || posY > maxY) vy = -vy;
      img.style.left = Math.max(0, Math.min(maxX, posX)) + 'px';
      img.style.top = Math.max(0, Math.min(maxY, posY)) + 'px';
      requestAnimationFrame(move);
    }
    move();

    // ★ クリックで釣り開始（犬を渡す）
    img.addEventListener('click', () => {
      currentDog = dog;
      startFishing();
    });

    waterArea.appendChild(img);
    spawnedDogs.push({ img, dog });
  }
}

// 釣りミニゲーム起動
function startFishing() {
  const fishingUI = document.getElementById('fishing-ui');
  const fishingResult = document.getElementById('fishing-result');
  const pointer = document.getElementById('pointer');
  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  pointer.style.animationPlayState = 'running';
}

// 釣り成功判定＆図鑑登録
function stopFishing() {
  const fishingUI = document.getElementById('fishing-ui');
  const fishingResult = document.getElementById('fishing-result');
  const pointer = document.getElementById('pointer');
  const targetZone = document.getElementById('target-zone');

  pointer.style.animationPlayState = 'paused';
  const pointerRect = pointer.getBoundingClientRect();
  const targetRect = targetZone.getBoundingClientRect();

  if (pointerRect.left >= targetRect.left && pointerRect.right <= targetRect.right) {
    fishingResult.textContent = '🎯 ヒット！犬が釣れた！';

    if (currentDog && !caughtDogsMap[currentDog.name]) {
      caughtDogsMap[currentDog.name] = currentDog;
      updateZukan();
    }
  } else {
    fishingResult.textContent = '💨 のがした…';
  }

  setTimeout(() => {
    fishingUI.style.display = 'none';
    pointer.style.animationPlayState = 'running';
    currentDog = null;
  }, 1500);
}

// 釣りUIのリールボタンにイベント追加
document.getElementById('reel-button').addEventListener('click', stopFishing);

// 初期化
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
