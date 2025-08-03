// 犬の表示と移動
fetch('dog.json')
  .then(res => res.json())
  .then(dogs => {
    const water = document.getElementById('water-area');
    const isMobile = window.innerWidth <= 600;

    dogs.forEach((dog, index) => {
      const dogElem = document.createElement('img');
      dogElem.src = dog.image;
      dogElem.alt = dog.name;
      dogElem.classList.add('dog');

      const size = isMobile ? 50 : 70;
      dogElem.style.width = `${size}px`;

      // ランダムな初期位置
      let x = Math.random() * (window.innerWidth - size);
      let y = Math.random() * (window.innerHeight - size - 120); // bottomの分を引く

      dogElem.style.left = `${x}px`;
      dogElem.style.top = `${y}px`;

      // スピード（レア度が高いほど速く）
      const speed = 1 + dog.rarity / 2;
      dogElem.style.transition = `transform ${3000 / speed}ms linear`;

      water.appendChild(dogElem);

      let currentX = x;
      let currentY = y;

      setInterval(() => {
        const newX = Math.random() * (window.innerWidth - size);
        const newY = Math.random() * (window.innerHeight - size - 120);
        const dx = newX - currentX;
        const dy = newY - currentY;

        dogElem.style.transform = `translate(${dx}px, ${dy}px)`;
        currentX = newX;
        currentY = newY;
      }, 3000 / speed);

      // 🔶 犬クリックで釣り開始
      dogElem.addEventListener('click', () => {
        showFishingUI(dog);
      });
    });
  })
  .catch(err => console.error('dog.jsonの読み込みに失敗:', err));

// 🎣 釣りミニゲーム関連
const fishingUI = document.getElementById('fishing-ui');
const reelButton = document.getElementById('reel-button');
const pointer = document.getElementById('pointer');
const targetZone = document.getElementById('target-zone');
let currentDog = null;

function showFishingUI(dog) {
  currentDog = dog;
  fishingUI.style.display = 'block';
  pointer.style.animationPlayState = 'running';
}

// タイミング判定
reelButton.addEventListener('click', () => {
  const pointerRect = pointer.getBoundingClientRect();
  const targetRect = targetZone.getBoundingClientRect();

  const isSuccess =
    pointerRect.left >= targetRect.left &&
    pointerRect.right <= targetRect.right;

  pointer.style.animationPlayState = 'paused';

  setTimeout(() => {
    fishingUI.style.display = 'none';
    pointer.style.animationPlayState = 'running';

    if (isSuccess) {
      alert(`🎉 釣れた！：${currentDog.name}`);
      // ★ 図鑑登録機能をここに入れる予定
    } else {
      alert('💨 逃げられた…');
    }
  }, 500);
});

// 横向きチェック（スマホ）
const orientationWarning = document.getElementById('orientation-warning');
const container = document.getElementById('container');

function checkOrientation() {
  const isPortrait = window.matchMedia("(orientation: portrait)").matches;
  if (isPortrait) {
    orientationWarning.style.display = 'flex';
    container.style.display = 'none';
  } else {
    orientationWarning.style.display = 'none';
    container.style.display = 'block';
  }
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
window.addEventListener('load', checkOrientation);

// BGM 再生（初回クリック後）
window.addEventListener('click', () => {
  const bgm = document.getElementById('bgm');
  if (bgm && bgm.paused) {
    bgm.play().catch(() => {});
  }
});

// 図鑑・ショップ開閉と効果音
const zukanBtn = document.getElementById('zukan-btn');
const shopBtn = document.getElementById('shop-btn');
const zukanPanel = document.getElementById('zukan-panel');
const shopPanel = document.getElementById('shop-panel');
const openSfx = document.getElementById('sfx-open');
const closeSfx = document.getElementById('sfx-close');

zukanBtn.addEventListener('click', () => {
  const isOpen = zukanPanel.style.display === 'block';
  if (isOpen) {
    zukanPanel.style.display = 'none';
    closeSfx.play().catch(() => {});
  } else {
    zukanPanel.style.display = 'block';
    shopPanel.style.display = 'none';
    openSfx.play().catch(() => {});
  }
});

shopBtn.addEventListener('click', () => {
  const isOpen = shopPanel.style.display === 'block';
  if (isOpen) {
    shopPanel.style.display = 'none';
    closeSfx.play().catch(() => {});
  } else {
    shopPanel.style.display = 'block';
    zukanPanel.style.display = 'none';
    openSfx.play().catch(() => {});
  }
});
