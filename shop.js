// 所持している釣った犬IDと数のマップ
window.caughtDogsInventory = {}; // 例: { "1": 3, "2": 1 }

// プレイヤーの所持金
window.playerMoney = 0;

// 犬を所持リストに追加（釣り成功時などに呼ぶ）
function addCaughtDog(dogId) {
  if (!window.caughtDogsInventory[dogId]) {
    window.caughtDogsInventory[dogId] = 1;
  } else {
    window.caughtDogsInventory[dogId]++;
  }
}

// 犬を売る処理（数量指定）
function sellDog(dogId, sellCount) {
  sellCount = Math.floor(sellCount);
  if (sellCount <= 0) return;

  const currentCount = window.caughtDogsInventory[dogId] || 0;
  if (currentCount < sellCount) {
    alert(`所持数が足りません。現在の所持数: ${currentCount}`);
    return;
  }

  const dog = window.allDogs.find(d => String(d.number) === String(dogId));
  if (!dog) return;

  const price = dog.price || 100;
  const totalPrice = price * sellCount;

  window.playerMoney += totalPrice;
  window.caughtDogsInventory[dogId] -= sellCount;

  if (window.caughtDogsInventory[dogId] <= 0) {
    delete window.caughtDogsInventory[dogId];
  }

  alert(`${dog.name}を${sellCount}匹、合計${totalPrice}円で売却しました。現在の所持金は${window.playerMoney}円です。`);

  renderSellDogsList();
}

// 売るパネルの犬リストを表示
function renderSellDogsList() {
  const listDiv = document.getElementById('sell-dogs-list');
  if (!listDiv) return;

  listDiv.innerHTML = '';

  const dogIds = Object.keys(window.caughtDogsInventory);
  if (dogIds.length === 0) {
    listDiv.textContent = '所持している犬はいません。';
    return;
  }

  dogIds.forEach(dogId => {
    const dog = window.allDogs.find(d => String(d.number) === String(dogId));
    if (!dog) return;

    const count = window.caughtDogsInventory[dogId];

    // アイテム行全体
    const itemDiv = document.createElement('div');
    itemDiv.style.display = 'flex';
    itemDiv.style.alignItems = 'center';
    itemDiv.style.marginBottom = '12px';
    itemDiv.style.borderBottom = '1px solid #ddd';
    itemDiv.style.paddingBottom = '10px';

    // 左: 画像
    const img = document.createElement('img');
    img.src = dog.image || '';
    img.style.width = '70px';
    img.style.height = '70px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '8px';
    img.style.marginRight = '12px';

    // 中央: 名前
    const nameDiv = document.createElement('div');
    nameDiv.textContent = dog.name || '名無し';
    nameDiv.style.flexGrow = '1';
    nameDiv.style.fontWeight = 'bold';
    nameDiv.style.fontSize = '1.1rem';

    // 右側情報エリア
    const rightDiv = document.createElement('div');
    rightDiv.style.display = 'flex';
    rightDiv.style.flexDirection = 'column';
    rightDiv.style.alignItems = 'flex-end';
    rightDiv.style.minWidth = '220px';

    // レアリティ表示
    const rarityDiv = document.createElement('div');
    rarityDiv.textContent = `レアリティ: ${dog.rarity || '不明'}`;
    rarityDiv.style.marginBottom = '4px';

    // 売値表示
    const priceDiv = document.createElement('div');
    priceDiv.textContent = `売値: ${dog.price || 100} 円`;
    priceDiv.style.marginBottom = '4px';

    // 所持数表示
    const countDiv = document.createElement('div');
    countDiv.textContent = `所持数: ${count}`;
    countDiv.style.marginBottom = '6px';

    // 売る数入力フォーム
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 1;
    input.max = count;
    input.value = 1;
    input.style.width = '60px';
    input.style.marginBottom = '6px';

    // 売るボタン
    const sellBtn = document.createElement('button');
    sellBtn.textContent = '売る';
    sellBtn.style.cursor = 'pointer';
    sellBtn.style.padding = '6px 12px';
    sellBtn.style.borderRadius = '6px';
    sellBtn.style.border = 'none';
    sellBtn.style.backgroundColor = '#f39c12';
    sellBtn.style.color = 'white';
    sellBtn.style.fontWeight = 'bold';

    sellBtn.addEventListener('click', () => {
      const sellNum = Number(input.value);
      if (!sellNum || sellNum < 1) {
        alert('売る数を1以上で入力してください。');
        return;
      }
      if (sellNum > count) {
        alert(`所持数を超えています。現在の所持数: ${count}`);
        return;
      }
      sellDog(dogId, sellNum);
    });

    rightDiv.appendChild(rarityDiv);
    rightDiv.appendChild(priceDiv);
    rightDiv.appendChild(countDiv);
    rightDiv.appendChild(input);
    rightDiv.appendChild(sellBtn);

    itemDiv.appendChild(img);
    itemDiv.appendChild(nameDiv);
    itemDiv.appendChild(rightDiv);

    listDiv.appendChild(itemDiv);
  });
}

// 以下は既存のwindow.loadイベント内に入れるコード例（再掲）
window.addEventListener('load', () => {
  const shopBtn = document.getElementById('shop-btn');
  const shopMenu = document.getElementById('shop-menu');
  const shopSellPanel = document.getElementById('shop-sell-panel');
  const shopBuyPanel = document.getElementById('shop-buy-panel');
  const shopMenuClose = document.getElementById('shop-menu-close');
  const sellClose = document.getElementById('sell-close');
  const buyClose = document.getElementById('buy-close');
  const sfxOpen = document.getElementById('sfx-open');
  const sfxClose = document.getElementById('sfx-close');

  shopBtn.addEventListener('click', () => {
    const fishingUI = document.getElementById('fishing-ui');
    const resultOverlay = document.getElementById('result-overlay');

    if (window.isFishing ||
        (fishingUI && fishingUI.style.display === 'block') ||
        (resultOverlay && resultOverlay.style.display === 'flex')) {
      return;
    }

    shopMenu.style.display = 'block';
    shopSellPanel.style.display = 'none';
    shopBuyPanel.style.display = 'none';

    sfxOpen.play().catch(() => {});
  });

  shopMenuClose.addEventListener('click', () => {
    shopMenu.style.display = 'none';
    sfxClose.play().catch(() => {});
  });

  document.getElementById('btn-sell').addEventListener('click', () => {
    shopMenu.style.display = 'none';
    shopSellPanel.style.display = 'block';
    shopBuyPanel.style.display = 'none';

    renderSellDogsList();
  });

  document.getElementById('btn-buy').addEventListener('click', () => {
    shopMenu.style.display = 'none';
    shopSellPanel.style.display = 'none';
    shopBuyPanel.style.display = 'block';
  });

  sellClose.addEventListener('click', () => {
    shopSellPanel.style.display = 'none';
    sfxClose.play().catch(() => {});
  });

  buyClose.addEventListener('click', () => {
    shopBuyPanel.style.display = 'none';
    sfxClose.play().catch(() => {});
  });
});
