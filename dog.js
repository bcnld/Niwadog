// dog.js

const waterArea = document.getElementById('water-area');

let dogData = [];
let spawnedDogs = [];
const maxDogs = 6;
const bottomLandHeight = 100;

// 犬データ読み込み＆重み付け
function createWeightedDogs(dogs) {
  const weighted = [];
  dogs.forEach(dog => {
    const times = Math.max(1, Math.round(100 * (dog.probability ?? 0.1)));
    for (let i = 0; i < times; i++) weighted.push(dog);
  });
  return weighted;
}

// 犬スポーン＋動かす
function spawnDogs() {
  waterArea.innerHTML = '';
  spawnedDogs = [];
  const weightedDogs = createWeightedDogs(dogData);
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
    img.style.width = dogSize + 'px';
    img.style.height = dogSize + 'px';
    img.style.pointerEvents = 'auto';

    let posX = Math.random() * maxX;
    let posY = Math.random() * maxY;
    let vx = (Math.random() * 2 - 1) * 0.5;
    let vy = (Math.random() * 2 - 1) * 0.5;

    img.style.left = posX + 'px';
    img.style.top = posY + 'px';

    function move() {
      posX += vx;
      posY += vy;
      if (posX < 0 || posX > maxX) vx = -vx;
      if (posY < 0 || posY > maxY) vy = -vy;
      img.style.left = Math.max(0, Math.min(maxX, posX)) + 'px';
      img.style.top = Math.max(0, Math.min(maxY, posY)) + 'px';
      img._moveAnimationId = requestAnimationFrame(move);
    }
    move();

    waterArea.appendChild(img);
    spawnedDogs.push(img);
  }

  // 犬クリック時のイベントは fishing.js 側に任せる
  if (typeof window.attachDogClickEvents === 'function') {
    window.attachDogClickEvents();
  }
}

// 犬データ読み込みしてスポーン開始
window.addEventListener('load', () => {
  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      spawnDogs();
    });
});
