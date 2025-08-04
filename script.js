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
const fishingUI = document.getElementById('fishing-ui');
const reelButton = document.getElementById('reel-button');
const pointer = document.getElementById('pointer');
const targetZone = document.getElementById('target-zone');
const fishingResult = document.getElementById('fishing-result');

// 画面向きチェック
function checkOrientation() {
  if(window.matchMedia("(orientation: portrait)").matches){
    orientationWarning.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    orientationWarning.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// BGM再生は最初のクリック時のみ
document.body.addEventListener('click', () => {
  if(bgm.paused){
    bgm.play().catch(() => {});
  }
}, { once: true });

// パネルの開閉と効果音
function togglePanel(panel) {
  const isOpen = panel.style.display === 'block';
  if (isOpen) {
    panel.style.display = 'none';
    sfxClose.play().catch(() => {});
  } else {
    [zukanPanel, shopPanel].forEach(p => {
      if(p !== panel && p.style.display === 'block'){
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

// 犬のデータを取得してランダムに表示・移動
fetch('dog.json')
  .then(res => res.json())
  .then(dogData => {
    const isMobile = window.innerWidth <= 600;
    const dogSize = isMobile ? 50 : 70;
    const maxDogs = 6;
    const bottomLandHeight = 100;

    // 重みづけされた配列を作成
    function getWeightedDogs(dogs) {
      const weighted = [];
      dogs.forEach(dog => {
        const times = Math.round(100 * dog.probability);
        for (let i = 0; i < times; i++) {
          weighted.push(dog);
        }
      });
      return weighted;
    }

    // 図鑑用に登録（重複含む）
    const caughtDogs = [];

    // 図鑑更新
    function updateZukan() {
      zukanList.innerHTML = '';
      const unique = {};
      caughtDogs.forEach(dog => {
        if (!unique[dog.name]) {
          unique[dog.name] = true;
          const div = document.createElement('div');
          div.textContent = dog.name;
          div.style.cursor = 'pointer';
          div.style.border = '1px solid #ccc';
          div.style.margin = '5px';
          div.style.padding = '5px';
          div.addEventListener('click', () => alert(dog.description));
          zukanList.appendChild(div);
        }
      });
    }

    // 犬をスポーンさせる
    function spawnDogs() {
      waterArea.innerHTML = '';
      const weightedDogs = getWeightedDogs(dogData);
      for (let i = 0; i < maxDogs; i++) {
        const dog = weightedDogs[Math.floor(Math.random() * weightedDogs.length)];
        caughtDogs.push(dog);

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
        img.style.left = posX + 'px';
        img.style.top = posY + 'px';

        let velocityX = (Math.random() * 2 - 1) * 0.5;
        let velocityY = (Math.random() * 2 - 1) * 0.5;

        function move() {
          posX += velocityX;
          posY += velocityY;

          if(posX < 0 || posX > maxX) velocityX = -velocityX;
          if(posY < 0 || posY > maxY) velocityY = -velocityY;

          img.style.left = Math.max(0, Math.min(maxX, posX)) + 'px';
          img.style.top = Math.max(0, Math.min(maxY, posY)) + 'px';

          requestAnimationFrame(move);
        }
        move();

        waterArea.appendChild(img);
      }

      updateZukan();
    }

    spawnDogs();
  })
  .catch(err => {
    console.error('dog.json の読み込みエラー:', err);
  });

// 釣りミニゲーム
function startFishing() {
  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  pointer.style.animationPlayState = 'running';
}
function stopFishing() {
  pointer.style.animationPlayState = 'paused';
  const pointerRect = pointer.getBoundingClientRect();
  const targetRect = targetZone.getBoundingClientRect();
  if(pointerRect.left >= targetRect.left && pointerRect.right <= targetRect.right) {
    fishingResult.textContent = '🎯 ヒット！犬が釣れた！';
  } else {
    fishingResult.textContent = '💨 のがした…';
  }
  setTimeout(() => {
    fishingUI.style.display = 'none';
    pointer.style.animationPlayState = 'running';
  }, 1500);
}
reelButton.addEventListener('click', stopFishing);
document.addEventListener('keydown', e => {
  if(e.key === 'f') startFishing();
});

// 初期化
window.addEventListener('load', () => {
  checkOrientation();
});
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
