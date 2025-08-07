const shopBtn = document.getElementById('shop-btn');
const shopPanel = document.getElementById('shop-panel');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');

function toggleShop() {
  const isOpen = shopPanel.classList.contains('active');

  // 図鑑のオーバーレイも閉じる
  const zukanOverlay = document.getElementById('zukan-overlay');
  if (zukanOverlay.classList.contains('active')) {
    zukanOverlay.classList.remove('active');
  }

  if (isOpen) {
    shopPanel.classList.remove('active');
    try { sfxClose.play(); } catch {}
  } else {
    shopPanel.classList.add('active');
    try { sfxOpen.play(); } catch {}
  }
}

shopBtn.addEventListener('click', toggleShop);
