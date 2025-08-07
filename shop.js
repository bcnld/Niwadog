const shopBtn = document.getElementById('shop-btn');
const shopPanel = document.getElementById('shop-panel');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');

function toggleShop() {
  const isOpen = shopPanel.classList.contains('active');

  if (isOpen) {
    shopPanel.classList.remove('active');
    try {
      sfxClose.play();
    } catch (e) {
      console.warn('Close SFX failed:', e);
    }
  } else {
    // 他パネルを閉じる処理をここに入れてもOK（例: 図鑑）
    const zukanPanel = document.getElementById('zukan-panel');
    if (zukanPanel) {
      zukanPanel.classList.remove('active');
    }

    shopPanel.classList.add('active');
    try {
      sfxOpen.play();
    } catch (e) {
      console.warn('Open SFX failed:', e);
    }
  }
}

shopBtn.addEventListener('click', toggleShop);
