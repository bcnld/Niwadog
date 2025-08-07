const waterArea = document.getElementById('water-area');
const bgm = document.getElementById('bgm');
const zukanBtn = document.getElementById('zukan-btn');
const shopBtn = document.getElementById('shop-btn');
const zukanPanel = document.getElementById('zukan-panel');
const shopPanel = document.getElementById('shop-panel');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');
const zukanList = document.getElementById('zukan-list');
const zukanNav = document.getElementById('zukan-nav');
const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

let dogData = [], weightedDogs = [], spawnedDogs = [];
let caughtDogsMap = {};
let isFishing = false, selectedDog = null;
const maxDogs = 6, bottomLandHeight = 100;
const itemsPerPage = 18;
let currentPage = 0;

let angle = 0, spinSpeed = 0;
let spinning = false, slowingDown = false;
let hitZoneStart = 0, hitZoneEnd = 0;
let animationId = null;

// BGM 初回再生
document.body.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

function togglePanel(panel) {
  if (isFishing) return; // ← こちらのチェックに切り替えると正しく動作する
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

function updateZukan() {
  zukanList.innerHTML = '';
  zukanNav.innerHTML = '';

  const sortedDogs = [...dogData].sort((a, b) => a.number - b.number);
  const totalPages = Math.ceil(sortedDogs.length / (itemsPerPage)); // itemsPerPage = 18
  const startIndex = currentPage * itemsPerPage;
  const pageDogs = sortedDogs.slice(startIndex, startIndex + itemsPerPage);

  // 左右ページに分ける（片面9匹ずつ）
  const leftDogs = pageDogs.slice(0, 9);
  const rightDogs = pageDogs.slice(9, 18);

  const leftPage = document.createElement('div');
  leftPage.className = 'zukan-page';

  const rightPage = document.createElement('div');
  rightPage.className = 'zukan-page';

  [leftDogs, rightDogs].forEach((dogSet, i) => {
    const page = i === 0 ? leftPage : rightPage;
    for (const dog of dogSet) {
      const div = document.createElement('div');
      div.className = 'zukan-card';

  if (caughtDogsMap[dog.number]) {
    div.classList.add('caught');
    const caughtDog = caughtDogsMap[dog.number];
    const img = document.createElement('img');
    img.src = caughtDog.image;
    img.alt = caughtDog.name;
    img.title = caughtDog.name;
    div.appendChild(img);
    div.addEventListener('click', () => {
      alert(`No.${dog.number} ${dog.name}\n${dog.description}`);
    });
  } else {
    div.textContent = '?';
  }

      page.appendChild(div);
    }
  });

  zukanList.appendChild(leftPage);
  zukanList.appendChild(rightPage);

  // ページナビゲーション
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

function createWeightedDogs(dogs) {
  const weighted = [];
  dogs.forEach(dog => {
    const times = Math.max(1, Math.round(100 * dog.probability));
    for (let i = 0; i < times; i++) weighted.push(dog);
  });
  return weighted;
}

window.addEventListener('load', () => {
  const storedZukan = localStorage.getItem('caughtDogs');
  if (storedZukan) {
    caughtDogsMap = JSON.parse(storedZukan);
  }

  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      weightedDogs = createWeightedDogs(data);
      spawnDogs();
      updateZukan();
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
      cancelAnimationFrame(animationId); // アニメーション停止
      checkHit(); // ヒット判定呼び出し
      return;
    }
  }

    animationId = requestAnimationFrame(drawRoulette);
  }
}

function showCatchOverlay(dog) {
  const overlay = document.getElementById('catch-overlay');
  const dogImg = document.getElementById('caught-dog-img');
  const message = document.getElementById('caught-message');

  dogImg.src = dog.image;
  message.textContent = `${dog.name} をつかまえた！`;

  overlay.style.display = 'flex';
}

document.getElementById('catch-close').addEventListener('click', () => {
  document.getElementById('catch-overlay').style.display = 'none';
  updateZukan();
  // ここで図鑑の更新など必要なら追加
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

      document.getElementById('catch-overlay').style.display = 'flex';
      document.getElementById('caught-dog-img').src = selectedDog.img.src;
      document.getElementById('caught-message').textContent = `${selectedDog.dog.name} をつかまえた！`;

      const dogId = selectedDog.dog.number;
      if (!caughtDogsMap[dogId]) {
        caughtDogsMap[dogId] = selectedDog.dog;
        localStorage.setItem('caughtDogs', JSON.stringify(caughtDogsMap));
      }

      isFishing = false;
      selectedDog.img.remove();
      selectedDog = null;
      updateZukan();
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


