// 所持している釣った犬IDのリスト
window.caughtDogsInventory = [];

// プレイヤーの所持金
window.playerMoney = 0;

// 犬を所持リストに追加（釣り成功時にfishing.jsなどから呼ぶ想定）
function addCaughtDog(dogId) {
  if (!window.caughtDogsInventory.includes(dogId)) {
    window.caughtDogsInventory.push(dogId);
  }
}

// 犬を売る処理
function sellDog(dogId) {
  const idx = window.caughtDogsInventory.indexOf(dogId);
  if (idx === -1) return;

  const dog = window.allDogs.find(d => String(d.number) === String(dogId));
  if (!dog) return;

  const price = dog.price || 100;
  window.playerMoney += price;

  // 所持リストから削除
  window.caughtDogsInventory.splice(idx, 1);

  alert(`${dog.name}を${price}円で売却しました。現在の所持金は${window.playerMoney}円です。`);

  // 売るパネルを再描画
  renderSellDogsList();
}

// 売るパネルの犬リストを表示
function renderSellDogsList() {
  const listDiv = document.getElementById('sell-dogs-list');
  if (!listDiv) return;

  listDiv.innerHTML = '';

  if (window.caughtDogsInventory.length === 0) {
    listDiv.textContent = '所持している犬はいません。';
    return;
  }

  window.caughtDogsInventory.forEach(dogId => {
    const dog = window.allDogs.find(d => String(d.number) === String(dogId));
    if (!dog) return;

    const itemDiv = document.createElement('div');
    itemDiv.style.display = 'flex';
    itemDiv.style.alignItems = 'center';
    itemDiv.style.marginBottom = '10px';

    const img = document.createElement('img');
    img.src = dog.image || '';
    img.style.width = '50px';
    img.style.height = '50px';
    img.style.objectFit = 'contain';
    img.style.marginRight = '10px';

    const name = document.createElement('div');
    name.textContent = `${dog.name} - 売値: ${dog.price || 100} 円`;
    name.style.flexGrow = '1';

    const sellBtn = document.createElement('button');
    sellBtn.textContent = '売る';
    sellBtn.style.cursor = 'pointer';
    sellBtn.addEventListener('click', () => {
      sellDog(dogId);
    });

    itemDiv.appendChild(img);
    itemDiv.appendChild(name);
    itemDiv.appendChild(sellBtn);

    listDiv.appendChild(itemDiv);
  });
}

// 初期化処理：イベントリスナー登録など
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

    // 釣り中や捕獲結果表示中はショップを開かない
    if (window.isFishing ||
        (fishingUI && fishingUI.style.display === 'block') ||
        (resultOverlay && resultOverlay.style.display === 'flex')) {
      return;
    }

    // すべて閉じてからメニュー開く
    shopMenu.style.display = 'block';
    shopSellPanel.style.display = 'none';
    shopBuyPanel.style.display = 'none';

    sfxOpen.play().catch(() => {});
  });

  // メニュー閉じる
  shopMenuClose.addEventListener('click', () => {
    shopMenu.style.display = 'none';
    sfxClose.play().catch(() => {});
  });

  // 「犬を売る」ボタン
  document.getElementById('btn-sell').addEventListener('click', () => {
    shopMenu.style.display = 'none';
    shopSellPanel.style.display = 'block';
    shopBuyPanel.style.display = 'none';

    // 犬リストを描画
    renderSellDogsList();
  });

  // 「アイテムを買う」ボタン
  document.getElementById('btn-buy').addEventListener('click', () => {
    shopMenu.style.display = 'none';
    shopSellPanel.style.display = 'none';
    shopBuyPanel.style.display = 'block';
  });

  // 売るパネルの閉じるボタン
  sellClose.addEventListener('click', () => {
    shopSellPanel.style.display = 'none';
    sfxClose.play().catch(() => {});
  });

  // 買うパネルの閉じるボタン
  buyClose.addEventListener('click', () => {
    shopBuyPanel.style.display = 'none';
    sfxClose.play().catch(() => {});
  });
});
