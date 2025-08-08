// ====== ショップパネル関連 ======

// DOM要素取得
const shopBtn = document.getElementById('shop-btn');
const shopPanel = document.getElementById('shop-panel');
const shopClose = document.getElementById('shop-close');

// ショップパネルの表示/非表示切り替え
function toggleShop() {
  const isVisible = shopPanel.style.display === 'block';
  if (isVisible) {
    shopPanel.style.display = 'none';
    sfxClose.play?.().catch(() => {});
  } else {
    // 図鑑オーバーレイが開いていたら閉じる（共存しない想定）
    if (zukanOverlay.classList.contains('active')) {
      zukanOverlay.classList.remove('active');
    }
    shopPanel.style.display = 'block';
    sfxOpen.play?.().catch(() => {});
  }
}

// イベント登録
shopBtn.addEventListener('click', toggleShop);
shopClose.addEventListener('click', toggleShop);
