// dog.js

const waterArea = document.getElementById('water-area');

let dogData = [];
let spawnedDogs = [];
const maxDogs = 6;
const bottomLandHeight = 100;

// 犬データの重み付け配列を作る
function createWeightedDogs(dogs) {
  const weighted = [];
  dogs.forEach(dog => {
    // 確率0.1未満は0.1として1回は入れる
    const times = Math.max(1, Math.round(100 * (dog.probability ?? 0.1)));
    for (let i = 0; i < times; i++) weighted.push(dog);
  });
  return weighted;
}

// 犬をスポーンして動かし、クリックイベント付与もここで行う
function spawnDogs() {
  waterArea.innerHTML = '';
  spawnedDogs = [];

  const weightedDogs = createWeightedDogs(dogData);
  const isMobile = window.innerWidth <= 600;
  const dogSize = isMobile ? 50 : 70;
  const maxX = waterArea.clientWidth - dogSize;
  const maxY = waterArea.clientHeight - bottomLandHeight - dogSize;

  for (let i = 0; i < maxDogs; i++) {
    // ランダムに犬を選ぶ
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

    // ★ 犬IDをdata属性にセット（後で釣り用に特定しやすく）
    img.dataset.dogId = dog.id ?? i;

    let posX = Math.random() * maxX;
    let posY = Math.random() * maxY;
    let vx = (Math.random() * 2 - 1) * 0.5;
    let vy = (Math.random() * 2 - 1) * 0.5;

    img.style.left = posX + 'px';
    img.style.top = posY + 'px';

    // 犬の自動移動ループ
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

    // クリック時に釣りUI起動（図鑑開いてたらスルー）
    img.addEventListener('click', () => {
  if (window.isZukanOpen) return;  // 図鑑表示中は釣り禁止
  if (window.isFishing) return;    // すでに釣り中もスルー
  if (typeof window.startFishing === 'function') {
    window.startFishing(img);  // ←ここは dog ではなく img にする
  }
});

    waterArea.appendChild(img);
    spawnedDogs.push(img);
  }
}

// dog.jsonを読み込み、スポーン開始
window.addEventListener('load', () => {
  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      spawnDogs();
    })
    .catch(err => {
      console.error('犬データの読み込みに失敗しました:', err);
    });
});
