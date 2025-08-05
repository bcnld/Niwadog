const waterArea = document.getElementById('water-area');
const zukanBtn = document.getElementById('zukan-btn');
const shopBtn = document.getElementById('shop-btn');
const zukanPanel = document.getElementById('zukan-panel');
const shopPanel = document.getElementById('shop-panel');
const zukanList = document.getElementById('zukan-list');
const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const pointer = document.getElementById('pointer');
const targetZone = document.getElementById('target-zone');
const reelButton = document.getElementById('reel-button');
const bgm = document.getElementById('bgm');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');

let dogData = [];
let weightedDogs = [];
let spawnedDogs = [];
let caughtDogsMap = {};
let selectedDog = null;
let isFishing = false;
const maxDogs = 6;
const bottomLandHeight = 100;

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
  for (const name in caughtDogsMap) {
    const dog = caughtDogsMap[name];
    const div = document.createElement('div');
    div.textContent = dog.name;
    div.addEventListener('click', () => alert(dog.description));
    zukanList.appendChild(div);
  }
}

function createWeightedDogs(dogs) {
  const weighted = [];
  dogs.forEach(dog => {
    const times = Math.max(1, Math.round(100 * dog.probability));
    for (let i = 0; i < times; i++) weighted.push(dog);
  });
  return weighted;
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
    img.className = 'dog';
    img.style.width = `${dogSize}px`;
    img.style.height = `${dogSize}px`;
    img.style.position = 'absolute';

    let x = Math.random() * maxX;
    let y = Math.random() * maxY;
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;

    let vx = (Math.random() * 2 - 1) * 0.5;
    let vy = (Math.random() * 2 - 1) * 0.5;

    function move() {
      x += vx;
      y += vy;
      if (x < 0 || x > maxX) vx *= -1;
      if (y < 0 || y > maxY) vy *= -1;
      img.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
      img.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
      requestAnimationFrame(move);
    }
    move();

    img.addEventListener('click', () => {
      if (isFishing || zukanPanel.style.display === 'block' || shopPanel.style.display === 'block') return;
      startFishing(img, dog);
    });

    waterArea.appendChild(img);
    spawnedDogs.push(img);
  }
}

function startFishing(img, dog) {
  isFishing = true;
  selectedDog = { img, dog };
  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  pointer.style.animation = 'movePointer 2s linear infinite';
  pointer.style.animationPlayState = 'running';
}

function stopFishing() {
  pointer.style.animationPlayState = 'paused';

  const pointerRect = pointer.getBoundingClientRect();
  const targetRect = targetZone.getBoundingClientRect();

  if (pointerRect.left >= targetRect.left && pointerRect.right <= targetRect.right) {
    fishingResult.textContent = '🎯 ヒット！犬が釣れた！';
    if (!caughtDogsMap[selectedDog.dog.name]) {
      caughtDogsMap[selectedDog.dog.name] = selectedDog.dog;
      updateZukan();
    }
  } else {
    fishingResult.textContent = '💨 のがした…';
  }

  if (selectedDog && selectedDog.img) selectedDog.img.remove();

  setTimeout(() => {
    fishingUI.style.display = 'none';
    isFishing = false;
  }, 1500);
}

reelButton.addEventListener('click', stopFishing);

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
