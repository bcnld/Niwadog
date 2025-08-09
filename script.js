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
let caughtDogsMap = JSON.parse(localStorage.getItem('caughtDogs') || '{}');
let isFishing = false, selectedDog = null;
const maxDogs = 6, bottomLandHeight = 100;

let angle = 0, spinSpeed = 0;
let spinning = false, slowingDown = false;
let animationId = null;

const segments = 16; // ルーレットの区切り数
let hitIndices = []; // 当たり区切り番号（ランダム決定）

// BGM 初回再生（ユーザークリック時に）
document.body.addEventListener('click', () => {
  if (bgm.paused) bgm.play().catch(() => {});
}, { once: true });

// 重み付け配列を作る関数
function createWeightedDogs(dogs) {
  const weighted = [];
  dogs.forEach(dog => {
    const times = Math.max(1, Math.round(100 * dog.probability));
    for (let i = 0; i < times; i++) weighted.push(dog);
  });
  return weighted;
}

// 当たり区切りをランダムに決定する関数
function setRandomHitIndices(count = 4) {
  hitIndices = [];
  const indices = Array.from({ length: segments }, (_, i) => i);
  for (let i = 0; i < count; i++) {
    const rand = Math.floor(Math.random() * indices.length);
    hitIndices.push(indices.splice(rand, 1)[0]);
  }
  hitIndices.sort((a,b) => a-b);
}

// 犬を水場に出現させる関数
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

// 犬をクリックしたときの処
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('dog')) {
    console.log('犬クリック！釣りUI表示');
    document.getElementById('fishing-ui').style.display = 'block';

    // ルーレット描画開始
    drawRoulette();
  }
}); // ← ここでイベントリスナー閉じる

// 釣り開始処理
function startFishing() {
  isFishing = true;
  window.isFishing = isFishing;
  fishingResult.textContent = '';
  fishingUI.style.display = 'block';
  canvas.style.display = 'block';

  // ランダムで赤マス（当たり区切り）を決定
  setRandomHitIndices(4);

  // 針の角度初期化
  angle = 0;
  spinSpeed = 0.3;
  spinning = true;
  slowingDown = false;

  sfxRouletteLoop.currentTime = 0;
  sfxRouletteLoop.play();

  drawRoulette();
}

// リールボタン押下時の処理
reelButton.addEventListener('click', () => {
  if (!spinning || slowingDown) return;
  slowingDown = true;

  sfxStopClick.currentTime = 0;
  sfxStopClick.play();
});

// ルーレット描画関数
function drawRoulette() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const center = canvas.width / 2;
  const radius = center - 10;
  const segmentAngle = (2 * Math.PI) / segments;

  // 円本体（白ベース）
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#fafafa';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#666';
  ctx.stroke();

  // 各区切りを描く
  for (let i = 0; i < segments; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = startAngle + segmentAngle;

    ctx.beginPath();
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const innerRadius = radius - 20;
    const x3 = center + innerRadius * Math.cos(endAngle);
    const y3 = center + innerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(startAngle);
    const y4 = center + innerRadius * Math.sin(startAngle);

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();

    // 赤マスはランダム決定hitIndices、それ以外は白黒交互
    if (hitIndices.includes(i)) {
      ctx.fillStyle = '#e74c3c'; // 赤
    } else {
      ctx.fillStyle = (i % 2 === 0) ? '#fff' : '#000';
    }
    ctx.fill();

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 中心の円（穴部分）
  ctx.beginPath();
  ctx.arc(center, center, radius - 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#444';
  ctx.fill();

  // 針の描画
  const needleLength = radius - 10;
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + needleLength * Math.cos(angle), center + needleLength * Math.sin(angle));
  ctx.strokeStyle = '#f1c40f';
  ctx.lineWidth = 5;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 8;
  ctx.stroke();

  // アニメーション更新
  if (spinning) {
    angle += spinSpeed;
    if (angle >= 2 * Math.PI) angle -= 2 * Math.PI;

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

        checkHit();

        return;
      }
    }
    animationId = requestAnimationFrame(drawRoulette);
  }
}

// 針が止まった場所の判定（当たり赤マスかどうか）
function checkHit() {
  const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
  const segmentAngle = (2 * Math.PI) / segments;
  // 針が刺さった区切り番号を計算
  let hitSegment = Math.floor((normalizedAngle + segmentAngle / 2) % (2 * Math.PI) / segmentAngle);

  if (hitIndices.includes(hitSegment)) {
    // 当たり
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
    // ハズレ
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

// ======= ここから犬データ読み込み・初期化 =======
window.addEventListener('load', () => {
  fetch('dog.json')
    .then(res => {
      if (!res.ok) throw new Error('dog.jsonの読み込み失敗');
      return res.json();
    })
    .then(data => {
      dogData = data;
      weightedDogs = createWeightedDogs(dogData);
      spawnDogs();
    })
    .catch(err => {
      console.error('犬データ読み込みエラー:', err);
    });
});

