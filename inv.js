const inventoryBtn = document.getElementById('inventory-btn');
const inventoryPanel = document.getElementById('inventory-panel');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');
const inventoryCount = document.getElementById('inventory-count'); // ← 所持数表示要素

let inventoryOpen = false;

// 仮の所持犬データ（実際のデータに差し替えてください）
let ownedDogs = []; // 例: ['shiba', 'pug', 'shiba'] など

inventoryBtn.addEventListener('click', () => {
  inventoryOpen = !inventoryOpen;
  inventoryPanel.style.display = inventoryOpen ? 'block' : 'none';

  if (inventoryOpen) {
    sfxOpen.currentTime = 0;
    sfxOpen.play();

    // 所持数カウントを更新
    inventoryCount.textContent = ownedDogs.length;

  } else {
    sfxClose.currentTime = 0;
    sfxClose.play();
  }
});
