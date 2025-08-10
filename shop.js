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

// 売るパネルの犬リストを表示（スマホ対応、画像＋名前＋売値）
function renderSellDogsList() {
  const listDiv = document.getElementById('sell-dogs-list');
  if (!listDiv) return;

  listDiv.innerHTML = '';

  if (window.caughtDogsInventory.length === 0) {
    listDiv.textContent = '所持している犬はいません。';
    hideSellDogDetail();
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
    itemDiv.className = 'dog-list-item';
    itemDiv.style.display = 'flex';
    itemDiv.style.alignItems = 'center';
    itemDiv.style.padding = '8px';
    itemDiv.style.borderBottom = '1px solid #ccc';
    itemDiv.style.cursor = 'pointer';

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
    nameDiv.style.flex = '1';
    nameDiv.style.fontWeight = 'bold';

    // 売値
    const priceDiv = document.createElement('div');
    priceDiv.textContent = `${dog.price || 100} ジンバブエドル`;
    priceDiv.style.whiteSpace = 'nowrap';
    priceDiv.style.fontSize = '14px';

    itemDiv.appendChild(img);
    itemDiv.appendChild(nameDiv);
    itemDiv.appendChild(priceDiv);

    // クリックで売る詳細表示を更新して表示
    itemDiv.addEventListener('click', () => {
      showSellDogDetail(dog, count);
    });

    listDiv.appendChild(itemDiv);
  });
}

// 売る詳細表示を非表示にする関数
function hideSellDogDetail() {
  const detailDiv = document.getElementById('sell-dog-detail');
  if (detailDiv) detailDiv.style.display = 'none';
}

// 売るパネル内の詳細表示を更新・表示する関数
function showSellDogDetail(dog, ownedCount) {
  const detailDiv = document.getElementById('sell-dog-detail');
  if (!detailDiv) return;

  // 表示
  detailDiv.style.display = 'block';

  // 画像・名前・価格・所持数表示を更新
  document.getElementById('sell-dog-image').src = dog.image || '';
  document.getElementById('sell-dog-name').textContent = dog.name;
  document.getElementById('sell-dog-price').textContent = dog.price || 100;
  document.getElementById('sell-dog-owned-count').textContent = ownedCount;

  // 数値入力の初期化・最大値設定
  const input = document.getElementById('detail-sell-count');
  input.value = 1;
  input.max = ownedCount;

  // ボタンのイベントは重複登録を避けるため、一度イベントを解除してから登録する
  const decreaseBtn = document.getElementById('count-decrease');
  const increaseBtn = document.getElementById('count-increase');
  const sellBtn = document.getElementById('detail-sell-btn');

  // 既存のイベントを解除
  decreaseBtn.onclick = null;
  increaseBtn.onclick = null;
  sellBtn.onclick = null;

  decreaseBtn.onclick = () => {
    let val = Number(input.value);
    if (val > 1) input.value = val - 1;
  };
  increaseBtn.onclick = () => {
    let val = Number(input.value);
    if (val < ownedCount) input.value = val + 1;
  };
  sellBtn.onclick = () => {
    const sellCount = Number(input.value);
    if (isNaN(sellCount) || sellCount < 1 || sellCount > ownedCount) {
      alert(`売る数は1以上${ownedCount}以下で指定してください。`);
      return;
    }
    sellDog(String(dog.number), sellCount);
    detailDiv.style.display = 'none';  // 売ったら詳細非表示にする
  };
}

// ショップUI制御
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
  const shopBackButton = document.getElementById('shop-back-button');

  function showBackButton() {
    if (shopMenu.style.display === 'block' || shopSellPanel.style.display === 'block' || shopBuyPanel.style.display === 'block') {
      shopBackButton.style.display = 'block';
    } else {
      shopBackButton.style.display = 'none';
    }
  }

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
    showBackButton();
    if (sfxOpen) { sfxOpen.currentTime = 0; sfxOpen.play().catch(() => {}); }
  });

  shopMenuClose.addEventListener('click', () => {
    shopMenu.style.display = 'none';
    shopBackButton.style.display = 'none';
    if (sfxClose) { sfxClose.currentTime = 0; sfxClose.play().catch(() => {}); }
  });

  document.getElementById('btn-sell').addEventListener('click', () => {
    shopMenu.style.display = 'none';
    shopSellPanel.style.display = 'block';
    shopBuyPanel.style.display = 'none';
    showBackButton();
    renderSellDogsList();
  });

  document.getElementById('btn-buy').addEventListener('click', () => {
    shopMenu.style.display = 'none';
    shopSellPanel.style.display = 'none';
    shopBuyPanel.style.display = 'block';
    showBackButton();
  });

  sellClose.addEventListener('click', () => {
    shopSellPanel.style.display = 'none';
    shopBackButton.style.display = 'none';
    hideSellDogDetail();
    if (sfxClose) { sfxClose.currentTime = 0; sfxClose.play().catch(() => {}); }
  });

  buyClose.addEventListener('click', () => {
    shopBuyPanel.style.display = 'none';
    shopBackButton.style.display = 'none';
    if (sfxClose) { sfxClose.currentTime = 0; sfxClose.play().catch(() => {}); }
  });

  shopBackButton.addEventListener('click', () => {
    if (shopSellPanel.style.display === 'block' || shopBuyPanel.style.display === 'block') {
      shopSellPanel.style.display = 'none';
      shopBuyPanel.style.display = 'none';
      shopMenu.style.display = 'block';
    } else if (shopMenu.style.display === 'block') {
      shopMenu.style.display = 'none';
      shopBackButton.style.display = 'none';
    }
  });

  shopBackButton.style.display = 'none';
});
