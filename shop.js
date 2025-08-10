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
  clearSellDetail();
}

// 売るパネルの犬リストを表示（最大6項目縦スクロール）
function renderSellDogsList() {
  const listDiv = document.getElementById('sell-dogs-list');
  if (!listDiv) return;

  listDiv.innerHTML = '';
  listDiv.style.maxHeight = '360px';  // 60px×6行分
  listDiv.style.overflowY = 'auto';

  if (window.caughtDogsInventory.length === 0) {
    listDiv.textContent = '所持している犬はいません。';
    clearSellDetail();
    return;
  }

  // 所持犬IDごとに個数集計
  const counts = {};
  window.caughtDogsInventory.forEach(id => {
    counts[id] = (counts[id] || 0) + 1;
  });

  const dogIds = Object.keys(counts);
  const maxDisplay = 6;

  dogIds.slice(0, maxDisplay).forEach(dogId => {
    const dog = window.allDogs.find(d => String(d.number) === String(dogId));
    if (!dog) return;

    const count = counts[dogId];

    const itemDiv = document.createElement('div');
    itemDiv.style.display = 'flex';
    itemDiv.style.alignItems = 'center';
    itemDiv.style.padding = '5px 10px';
    itemDiv.style.borderBottom = '1px solid #ccc';
    itemDiv.style.cursor = 'pointer';

    // 画像
    const img = document.createElement('img');
    img.src = dog.image || '';
    img.style.width = '50px';
    img.style.height = '50px';
    img.style.objectFit = 'contain';
    img.style.marginRight = '10px';
    img.style.flexShrink = '0';

    // 名前
    const nameDiv = document.createElement('div');
    nameDiv.textContent = dog.name;
    nameDiv.style.flexGrow = '1';
    nameDiv.style.fontWeight = 'bold';

    // 売値
    const priceDiv = document.createElement('div');
    priceDiv.textContent = `${dog.price || 100} ジンバブエドル`;
    priceDiv.style.flexShrink = '0';
    priceDiv.style.marginLeft = '10px';

    itemDiv.appendChild(img);
    itemDiv.appendChild(nameDiv);
    itemDiv.appendChild(priceDiv);

    // クリックで詳細表示と売る数設定
    itemDiv.addEventListener('click', () => {
      showSellDetail(dog, count);
    });

    listDiv.appendChild(itemDiv);
  });
}

// 詳細表示用キャンバスと売る数選択UIの描画・初期化
function showSellDetail(dog, ownedCount) {
  const detailCanvas = document.getElementById('sell-detail-canvas');
  if (!detailCanvas) return;
  const ctx = detailCanvas.getContext('2d');

  // キャンバス初期化
  const w = detailCanvas.width;
  const h = detailCanvas.height;
  ctx.clearRect(0, 0, w, h);

  // 背景
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);

  // 画像表示
  const img = new Image();
  img.src = dog.image || '';
  img.onload = () => {
    // 画像を左上に表示（100x100）
    ctx.drawImage(img, 10, 10, 100, 100);

    // 文字描画
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(dog.name, 120, 40);

    ctx.font = '16px sans-serif';
    ctx.fillText(`持っている数: ${ownedCount}`, 120, 70);
    ctx.fillText(`レアリティ: ${dog.rarity}`, 120, 100);

    // 説明は改行対応で縦に書く（簡易的に）
    ctx.font = '14px sans-serif';
    const desc = dog.description || '説明なし';
    const maxWidth = w - 130;
    const lineHeight = 18;
    let y = 130;

    wrapText(ctx, desc, 120, y, maxWidth, lineHeight);
  };

  // 売る数inputとボタン
  const detailArea = document.getElementById('sell-detail-area');
  if (!detailArea) return;

  detailArea.innerHTML = ''; // クリア

  // 売る数入力
  const countInput = document.createElement('input');
  countInput.type = 'number';
  countInput.min = '1';
  countInput.max = ownedCount.toString();
  countInput.value = '1';
  countInput.style.width = '60px';
  countInput.style.marginRight = '10px';

  // 売るボタン
  const sellBtn = document.createElement('button');
  sellBtn.textContent = '売る';
  sellBtn.style.cursor = 'pointer';

  sellBtn.addEventListener('click', () => {
    const sellCount = Number(countInput.value);
    if (isNaN(sellCount) || sellCount < 1 || sellCount > ownedCount) {
      alert(`売る数は1以上${ownedCount}以下で指定してください。`);
      return;
    }
    sellDog(dog.number, sellCount);
  });

  detailArea.appendChild(countInput);
  detailArea.appendChild(sellBtn);
}

// 詳細表示クリア関数
function clearSellDetail() {
  const detailCanvas = document.getElementById('sell-detail-canvas');
  if (detailCanvas) {
    const ctx = detailCanvas.getContext('2d');
    ctx.clearRect(0, 0, detailCanvas.width, detailCanvas.height);
  }
  const detailArea = document.getElementById('sell-detail-area');
  if (detailArea) {
    detailArea.innerHTML = '';
  }
}

// テキストのキャンバス改行描画ヘルパー
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
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

    if (sfxOpen) {
      sfxOpen.currentTime = 0;
      sfxOpen.play().catch(() => {});
    }
  });

  shopMenuClose.addEventListener('click', () => {
    shopMenu.style.display = 'none';
    if (sfxClose) {
      sfxClose.currentTime = 0;
      sfxClose.play().catch(() => {});
    }
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
    clearSellDetail();
    if (sfxClose) {
      sfxClose.currentTime = 0;
      sfxClose.play().catch(() => {});
    }
  });

  buyClose.addEventListener('click', () => {
    shopBuyPanel.style.display = 'none';
    if (sfxClose) {
      sfxClose.currentTime = 0;
      sfxClose.play().catch(() => {});
    }
  });
});
