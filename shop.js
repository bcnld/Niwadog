// 犬データ先読み込み
window.allDogs = [];
fetch("dog.json")
  .then(res => res.json())
  .then(data => {
    window.allDogs = data;
    console.log("犬データ読み込み完了:", window.allDogs);
  })
  .catch(err => {
    console.error("犬データの読み込みに失敗:", err);
  });

// 所持している釣った犬IDのリスト（重複可で個数管理）
window.caughtDogsInventory = [];

// プレイヤーの所持金（ジンバブエドル）
window.playerMoney = 0;

// 犬を所持リストに追加（釣り成功時にfishing.jsなどから呼ぶ想定）
function addCaughtDog(dogId) {
  window.caughtDogsInventory.push(dogId);
}

// 犬を売る処理（個数指定対応）
function sellDog(dogId, count) {
  count = Number(count);
  if (!count || count <= 0) return;

  // 所持数チェック
  const ownedCount = window.caughtDogsInventory.filter(id => id === dogId).length;
  if (count > ownedCount) {
    alert(`所持数が足りません。所持数: ${ownedCount}`);
    return;
  }

  const dog = window.allDogs.find(d => String(d.number) === String(dogId));
  if (!dog) return;

  const price = dog.price || 100;
  const totalPrice = price * count;
  window.playerMoney += totalPrice;

  // 所持リストから売った分だけ削除
  let removed = 0;
  for (let i = window.caughtDogsInventory.length - 1; i >= 0 && removed < count; i--) {
    if (window.caughtDogsInventory[i] === dogId) {
      window.caughtDogsInventory.splice(i, 1);
      removed++;
    }
  }

  alert(`${dog.name}を${count}個、合計${totalPrice}ジンバブエドルで売却しました。現在の所持金は${window.playerMoney}ジンバブエドルです。`);

  renderSellDogsList();
}

// 売るパネルの犬リストを表示（個数選択UI追加）
function renderSellDogsList() {
  const listDiv = document.getElementById('sell-dogs-list');
  if (!listDiv) return;

  listDiv.innerHTML = '';

  if (window.caughtDogsInventory.length === 0) {
    listDiv.textContent = '所持している犬はいません。';
    return;
  }

  // 所持犬IDごとに個数集計
  const counts = {};
  window.caughtDogsInventory.forEach(id => {
    counts[id] = (counts[id] || 0) + 1;
  });

  Object.entries(counts).forEach(([dogId, count]) => {
    const dog = window.allDogs.find(d => String(d.number) === String(dogId));
    if (!dog) return;

    const itemDiv = document.createElement('div');
    itemDiv.style.display = 'flex';
    itemDiv.style.alignItems = 'center';
    itemDiv.style.marginBottom = '10px';

    // 画像
    const img = document.createElement('img');
    img.src = dog.image || '';
    img.style.width = '50px';
    img.style.height = '50px';
    img.style.objectFit = 'contain';
    img.style.marginRight = '10px';

    // 名前
    const nameDiv = document.createElement('div');
    nameDiv.textContent = dog.name;
    nameDiv.style.flexBasis = '120px';
    nameDiv.style.marginRight = '10px';

    // レアリティと売値
    const detailDiv = document.createElement('div');
    detailDiv.style.flexBasis = '180px';
    detailDiv.style.marginRight = '10px';
    detailDiv.style.fontSize = '14px';
    detailDiv.innerHTML = `
      レアリティ: <strong>${dog.rarity}</strong><br>
      売値: <strong>${dog.price || 100}</strong> ジンバブエドル
    `;

    // 個数入力
    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.min = '1';
    countInput.max = String(count);
    countInput.value = '1';
    countInput.style.width = '60px';
    countInput.style.marginRight = '10px';

    // 所持数表示
    const ownedSpan = document.createElement('span');
    ownedSpan.textContent = `所持数: ${count}`;
    ownedSpan.style.marginRight = '10px';

    // 売るボタン
    const sellBtn = document.createElement('button');
    sellBtn.textContent = '売る';
    sellBtn.style.cursor = 'pointer';

    sellBtn.addEventListener('click', () => {
      const sellCount = Number(countInput.value);
      if (isNaN(sellCount) || sellCount < 1 || sellCount > count) {
        alert(`売る数は1以上${count}以下で指定してください。`);
        return;
      }
      sellDog(dogId, sellCount);
    });

    itemDiv.appendChild(img);
    itemDiv.appendChild(nameDiv);
    itemDiv.appendChild(detailDiv);
    itemDiv.appendChild(countInput);
    itemDiv.appendChild(ownedSpan);
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
