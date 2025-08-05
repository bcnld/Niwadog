// 要素取得
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

const maxDogs = 6;
const bottomLandHeight = 100;

let dogData = [];
let weightedDogs = [];
let spawnedDogs = [];
let caughtDogsMap = {};
let selectedDog = null;
let isFishing = false;

// 初回クリックでBGM再生
document.body.addEventListener('click', () => {
  if (bgm.paused) {
    bgm.play().catch(() => {});
  }
}, { once: true });

// パネル切替
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

// 図鑑表示更新
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

// 重み付きリスト作成
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

// 犬出現処理
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
      if (!img.parentElement) return; // 削除済みなら移動停止
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
    spawnedDogs.push(img);
  }
}

// 釣り開始処理
function startFishing(img, dog) {
  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  pointer.style.animation = 'movePointer 2s linear infinite';
  pointer.style.animationPlayState = 'running';
  selectedDog = { img, dog };
}

// 釣り停止（成功判定）
function stopFishing() {
  pointer.style.animationPlayState = 'paused';
  const pointerRect = pointer.getBoundingClientRect();
  const targetRect = targetZone.getBoundingClientRect();

  if (pointerRect.left >= targetRect.left && pointerRect.right <= targetRect.right) {
    fishingResult.textContent = '🎯 ヒット！犬が釣れた！';

    if (selectedDog && !caughtDogsMap[selectedDog.dog.name]) {
      caughtDogsMap[selectedDog.dog.name] = selectedDog.dog;
      updateZukan();
    }

    if (selectedDog) {
      selectedDog.img.remove();
    }
  } else {
    fishingResult.textContent = '💨 のがした…';
    if (selectedDog) {
      selectedDog.img.remove();
    }
  }

  setTimeout(() => {
    fishingUI.style.display = 'none';
    pointer.style.animationPlayState = 'running';
    selectedDog = null;
    isFishing = false;
  }, 1500);
}

// リールボタン押下イベント
reelButton.addEventListener('click', stopFishing);

// 初期化：犬データ取得＆出現
window.addEventListener('load', () => {
  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      weightedDogs = createWeightedDogs(dogData);
      spawnDogs();
    })
    .catch(err => console.error('dog.json 読み込みエラー:', err));
});
