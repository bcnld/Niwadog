// 要素の取得
const inventoryBtn = document.getElementById('inventory-btn');
const inventoryPanel = document.getElementById('inventory-panel');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');

let isInventoryOpen = false;

// 閉じる・開ける切り替え関数
function toggleInventory() {
  if (isInventoryOpen) {
    inventoryPanel.classList.add('hidden');
    sfxClose.currentTime = 0;
    sfxClose.play();
  } else {
    inventoryPanel.classList.remove('hidden');
    sfxOpen.currentTime = 0;
    sfxOpen.play();
  }
  isInventoryOpen = !isInventoryOpen;
}

// ボタンにイベントを付与
inventoryBtn.addEventListener('click', toggleInventory);
