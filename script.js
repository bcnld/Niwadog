<script>
  // 画面向きチェック
  function checkOrientation() {
    if(window.matchMedia("(orientation: portrait)").matches){
      document.getElementById('orientation-warning').style.display = 'flex';
      document.getElementById('container').style.display = 'none';
    } else {
      document.getElementById('orientation-warning').style.display = 'none';
      document.getElementById('container').style.display = 'block';
    }
  }
  window.addEventListener('load', checkOrientation);
  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', checkOrientation);

  // BGM再生（最初のクリックで）
  const bgm = document.getElementById('bgm');
  document.body.addEventListener('click', () => {
    if(bgm.paused){
      bgm.play().catch(() => {});
    }
  }, { once: true });

  // 効果音関連
  const sfxOpen = document.getElementById('sfx-open');
  const sfxClose = document.getElementById('sfx-close');

  const zukanBtn = document.getElementById('zukan-btn');
  const shopBtn = document.getElementById('shop-btn');
  const zukanPanel = document.getElementById('zukan-panel');
  const shopPanel = document.getElementById('shop-panel');

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

  // 図鑑管理
  const caughtDogs = [];
  const zukanList = document.getElementById('zukan-list');
  const detailPanel = document.getElementById('detail-panel');
  const detailClose = document.getElementById('detail-close');
  const detailName = document.getElementById('detail-name');
  const detailImage = document.getElementById('detail-image');
  const detailDescription = document.getElementById('detail-description');

  function updateZukan() {
    zukanList.innerHTML = '';
    caughtDogs.forEach(dog => {
      const item = document.createElement('div');
      item.classList.add('zukan-item');
      item.innerHTML = `<img src="${dog.image}" alt="${dog.name}"/><div>${dog.name}</div>`;
      item.addEventListener('click', () => showDetail(dog));
      zukanList.appendChild(item);
    });
  }

  function showDetail(dog) {
    detailName.textContent = dog.name;
    detailImage.src = dog.image;
    detailImage.alt = dog.name;
    detailDescription.textContent = dog.description || '詳細情報はありません。';
    detailPanel.style.display = 'block';
  }
  detailClose.addEventListener('click', () => {
    detailPanel.style.display = 'none';
  });

  // 釣りミニゲームUI
  const fishingUI = document.getElementById('fishing-ui');
  const reelButton = document.getElementById('reel-button');
  const pointer = document.getElementById('pointer');
  const targetZone = document.getElementById('target-zone');
  const fishingResult = document.getElementById('fishing-result');
  let currentFishingDog = null;

  function showFishingUI(dog) {
    currentFishingDog = dog;
    fishingUI.style.display = 'block';
    fishingResult.textContent = '';
    pointer.style.animationPlayState = 'running';
  }

  function stopFishing() {
    pointer.style.animationPlayState = 'paused';

    const pointerRect = pointer.getBoundingClientRect();
    const targetRect = targetZone.getBoundingClientRect();

    if (pointerRect.left >= targetRect.left && pointerRect.right <= targetRect.right) {
      fishingResult.textContent = '🎯 ヒット！犬が釣れた！';

      // 釣った犬を図鑑に追加（重複チェック）
      if (!caughtDogs.some(d => d.name === currentFishingDog.name)) {
        caughtDogs.push(currentFishingDog);
        updateZukan();
      }
    } else {
      fishingResult.textContent = '💨 のがした…';
    }

    setTimeout(() => {
      fishingUI.style.display = 'none';
      pointer.style.animationPlayState = 'running';
      currentFishingDog = null;
    }, 1500);
  }
  reelButton.addEventListener('click', stopFishing);

  // 水エリアに犬を表示し動かす処理
  fetch('dog.json')
    .then(res => res.json())
    .then(allDogs => {
      const waterArea = document.getElementById('water-area');
      const isMobile = window.innerWidth <= 600;
      const dogSize = isMobile ? 50 : 70;

      // レア度に応じた重みづけ抽選
      function weightedRandomDogs(dogs, count = 12) {
        const weighted = [];
        dogs.forEach(dog => {
          const weight = Math.max(1, 8 - dog.rarity); // rarity:1〜7の逆数調整
          for (let i = 0; i < weight; i++) weighted.push(dog);
        });
        const selected = [];
        for (let i = 0; i < count; i++) {
          const idx = Math.floor(Math.random() * weighted.length);
          selected.push(weighted[idx]);
        }
        return selected;
      }

      const dogs = weightedRandomDogs(allDogs, 12);

      dogs.forEach(dog => {
        const dogElem = document.createElement('img');
        dogElem.src = dog.image;
        dogElem.alt = dog.name;
        dogElem.classList.add('dog');
        dogElem.style.width = `${dogSize}px`;

        // 初期位置ランダム設定
        let x = Math.random() * (waterArea.clientWidth - dogSize);
        let y = Math.random() * (waterArea.clientHeight - dogSize);
        dogElem.style.left = `${x}px`;
        dogElem.style.top = `${y}px`;

        dogElem.dataset.info = JSON.stringify(dog);

        waterArea.appendChild(dogElem);

        // 数秒ごとに移動
        setInterval(() => {
          x = Math.random() * (waterArea.clientWidth - dogSize);
          y = Math.random() * (waterArea.clientHeight - dogSize);
          dogElem.style.left = `${x}px`;
          dogElem.style.top = `${y}px`;
        }, 3000 + Math.random() * 3000);

        // クリックで釣りUI表示
        dogElem.addEventListener('click', () => {
          showFishingUI(dog);
        });
      });
    })
    .catch(err => {
      console.error('dog.jsonの読み込みに失敗しました:', err);
    });

  // キーボード f で釣りミニゲーム起動（テスト用）
  document.addEventListener('keydown', e => {
    if (e.key === 'f') {
      if (caughtDogs.length > 0) {
        showFishingUI(caughtDogs[0]); // 仮に図鑑最初の犬で
      }
    }
  });
</script>
