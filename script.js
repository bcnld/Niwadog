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

// BGM再生（初回クリック後）
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

// 釣りUI関連
const fishingUI = document.getElementById('fishing-ui');
const reelButton = document.getElementById('reel-button');
const pointer = document.getElementById('pointer');
const targetZone = document.getElementById('target-zone');
const resultText = document.getElementById('fishing-result');
let currentFishingDog = null;

// 釣れた犬を保存する配列
const caughtDogs = [];

// 図鑑のリスト要素
const zukanList = document.getElementById('zukan-list');

// 詳細パネル要素
const detailPanel = document.getElementById('detail-panel');
const detailClose = document.getElementById('detail-close');
const detailName = document.getElementById('detail-name');
const detailImage = document.getElementById('detail-image');
const detailDescription = document.getElementById('detail-description');

function showFishingUI(dogElem) {
  fishingUI.style.display = 'block';
  resultText.textContent = '';
  pointer.style.animationPlayState = 'running';
  currentFishingDog = dogElem;
}

// 釣りボタン押下時の処理
reelButton.addEventListener('click', () => {
  pointer.style.animationPlayState = 'paused';
  const pointerRect = pointer.getBoundingClientRect();
  const targetRect = targetZone.getBoundingClientRect();

  const isSuccess = pointerRect.left >= targetRect.left && pointerRect.right <= targetRect.right;

  if (isSuccess) {
    const dogData = currentFishingDog.dataset.info ? JSON.parse(currentFishingDog.dataset.info) : null;
    if (dogData) {
      resultText.textContent = `🎯 ${dogData.name} が釣れた！`;
      // 図鑑に登録
      if (!caughtDogs.some(d => d.name === dogData.name)) {
        caughtDogs.push(dogData);
        updateZukanList();
      }
    }
  } else {
    resultText.textContent = '💨 のがした…';
  }

  setTimeout(() => {
    fishingUI.style.display = 'none';
    pointer.style.animationPlayState = 'running';
    currentFishingDog = null;
  }, 2000);
});

// 図鑑リストを更新
function updateZukanList() {
  zukanList.innerHTML = '';
  caughtDogs.forEach(dog => {
    const item = document.createElement('div');
    item.className = 'zukan-item';
    item.title = dog.name;
    item.innerHTML = `<img src="${dog.image}" alt="${dog.name}" /><div>${dog.name}</div>`;
    item.addEventListener('click', () => {
      showDetail(dog);
    });
    zukanList.appendChild(item);
  });
}

// 詳細パネル表示
function showDetail(dog) {
  detailName.textContent = dog.name;
  detailImage.src = dog.image;
  detailImage.alt = dog.name;
  detailDescription.textContent = dog.description || '説明はありません。';
  detailPanel.style.display = 'block';
}

// 詳細パネル閉じる
detailClose.addEventListener('click', () => {
  detailPanel.style.display = 'none';
});

// 犬データ読み込みと表示・移動処理
fetch('dog.json')
  .then(res => res.json())
  .then(dogs => {
    const waterArea = document.getElementById('water-area');
    const isMobile = window.innerWidth <= 600;
    const dogSize = isMobile ? 50 : 70;

    dogs.forEach(dog => {
      const dogElem = document.createElement('img');
      dogElem.src = dog.image;
      dogElem.alt = dog.name;
      dogElem.classList.add('dog');
      dogElem.style.width = `${dogSize}px`;

      // 初期位置
      let x = Math.random() * (waterArea.clientWidth - dogSize);
      let y = Math.random() * (waterArea.clientHeight - dogSize);
      dogElem.style.left = `${x}px`;
      dogElem.style.top = `${y}px`;

      // 犬の情報をdatasetに保存
      dogElem.dataset.info = JSON.stringify(dog);

      waterArea.appendChild(dogElem);

      // ランダム移動
      setInterval(() => {
        x = Math.random() * (waterArea.clientWidth - dogSize);
        y = Math.random() * (waterArea.clientHeight - dogSize);
        dogElem.style.left = `${x}px`;
        dogElem.style.top = `${y}px`;
      }, 3000 + Math.random() * 3000);

      // 犬クリックで釣りUI表示
      dogElem.addEventListener('click', () => {
        showFishingUI(dogElem);
      });
    });
  })
  .catch(err => {
    console.error('dog.jsonの読み込みに失敗しました:', err);
  });
