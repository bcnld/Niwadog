// shop.js

const shopBtn = document.getElementById('shop-btn');
const shopPanel = document.getElementById('shop-panel');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');

function toggleShop() {
  const isOpen = shopPanel.style.display === 'block';
  if (isOpen) {
    shopPanel.style.display = 'none';
    sfxClose.play().catch(() => {});
  } else {
    // 他のパネル（図鑑とか）があるなら閉じる処理ここで追加可能
    shopPanel.style.display = 'block';
    sfxOpen.play().catch(() => {});
  }
}

shopBtn.addEventListener('click', () => {
  toggleShop();
});
