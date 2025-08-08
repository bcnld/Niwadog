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

    // isFishing グローバルフラグも判定に追加
    if (window.isFishing ||
        (fishingUI && fishingUI.style.display === 'block') ||
        (resultOverlay && resultOverlay.style.display === 'flex')) {
      return; // 釣り中や捕獲結果表示中は開かない
    }

    // すべて閉じてからメニュー開く
    shopMenu.style.display = 'block';
    shopSellPanel.style.display = 'none';
    shopBuyPanel.style.display = 'none';

    sfxOpen.play().catch(() => {});
  });

  // メニューの閉じる
  shopMenuClose.addEventListener('click', () => {
    shopMenu.style.display = 'none';
    sfxClose.play().catch(() => {});
  });

  // 「犬を売る」ボタン
  document.getElementById('btn-sell').addEventListener('click', () => {
    shopMenu.style.display = 'none';
    shopSellPanel.style.display = 'block';
    shopBuyPanel.style.display = 'none';
  });

  // 「アイテムを買う」ボタン
  document.getElementById('btn-buy').addEventListener('click', () => {
    shopMenu.style.display = 'none';
    shopSellPanel.style.display = 'none';
    shopBuyPanel.style.display = 'block';
  });

  // 売るパネルの閉じる
  sellClose.addEventListener('click', () => {
    shopSellPanel.style.display = 'none';
    sfxClose.play().catch(() => {});
  });

  // 買うパネルの閉じる
  buyClose.addEventListener('click', () => {
    shopBuyPanel.style.display = 'none';
    sfxClose.play().catch(() => {});
  });
});
