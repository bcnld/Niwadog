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
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

let dogData = [], weightedDogs = [], spawnedDogs = [];
let caughtDogsMap = {};
let isFishing = false, selectedDog = null;
const maxDogs = 6, bottomLandHeight = 100;

let angle = 0;
let spinSpeed = 0;
let spinning = false;
let slowingDown = false;
let hitZoneStart = 0;
let hitZoneEnd = 0;

// BGM 初回再生
document.body.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

// パネル開閉
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

// 図鑑更新
const zukanNav = document.getElementById('zukan-nav'); // 追加で取得

function updateZukan() {
  zukanList.innerHTML = '';
  zukanNav.innerHTML = ''; // ← navだけリセット

  const sortedDogs = [...dogData].sort((a, b) => a.number - b.number);
  const totalPages = Math.ceil(sortedDogs.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const pageDogs = sortedDogs.slice(startIndex, startIndex + itemsPerPage);

  for (const dog of pageDogs) {
    const div = document.createElement('div');
    div.className = 'zukan-card';

    if (caughtDogsMap[dog.name]) {
      div.classList.add('caught');
      const img = document.createElement('img');
      img.src = dog.image;
      img.alt = dog.name;
      img.title = dog.name;
      div.appendChild(img);
      div.addEventListener('click', () => {
        alert(`No.${dog.number} ${dog.name}\n${dog.description}`);
      });
    } else {
      div.textContent = '?';
    }

    zukanList.appendChild(div);
  }

  // ページナビゲーション（zukanNav に追加）
  const nav = document.createElement('div');
  nav.style.textAlign = 'center';
  nav.style.marginTop = '10px';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '前へ';
  prevBtn.disabled = currentPage === 0;
  prevBtn.onclick = () => {
    currentPage--;
    updateZukan();
  };

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '次へ';
  nextBtn.disabled = currentPage >= totalPages - 1;
  nextBtn.onclick = () => {
    currentPage++;
    updateZukan();
  };

  nav.appendChild(prevBtn);
  nav.appendChild(document.createTextNode(` ページ ${currentPage + 1} / ${totalPages} `));
  nav.appendChild(nextBtn);

  zukanNav.appendChild(nav);
}

// 重み付き犬配列
function createWeightedDogs(dogs) {
  const weighted = [];
  dogs.forEach(dog => {
    const times = Math.max(1, Math.round(100 * dog.probability));
    for (let i = 0; i < times; i++) weighted.push(dog);
  });
  return weighted;
}

// 犬出現
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

  // 当たりゾーンをランダムに設定
  hitZoneStart = Math.random() * 2 * Math.PI;
  hitZoneEnd = hitZoneStart + Math.PI / 6;

  angle = 0;
  spinSpeed = 0.3;
  spinning = true;
  slowingDown = false;

  drawRoulette();
}

// リールボタン押下時に減速開始
reelButton.addEventListener('click', () => {
  if (!spinning || slowingDown) return;
  slowingDown = true;
});

// 描画ループ
function drawRoulette() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const center = canvas.width / 2;

  // 背景サークル
  ctx.beginPath();
  ctx.arc(center, center, center - 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#eef';
  ctx.fill();

  // 当たりゾーン
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(center, center, center - 10, hitZoneStart, hitZoneEnd);
  ctx.fillStyle = '#f00';
  ctx.fill();

  // 針の描画
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

    if (slowingDown) {
      spinSpeed -= 0.005;
      if (spinSpeed <= 0) {
        spinSpeed = 0;
        spinning = false;
        slowingDown = false;
        checkHit();
        return;
      }
    }

    requestAnimationFrame(drawRoulette);
  }
}

// 当たり判定
function checkHit() {
  const normalized = angle % (2 * Math.PI);
  if (normalized >= hitZoneStart && normalized <= hitZoneEnd) {
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

  // 明示的に止める
  spinning = false;
  slowingDown = false;
  spinSpeed = 0;

  // ルーレットUIを1.5秒後に非表示にする
  setTimeout(() => {
    fishingUI.style.display = 'none';
    fishingResult.textContent = '';
    isFishing = false;
    selectedDog = null;
  }, 1500);
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




