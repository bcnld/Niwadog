window.addEventListener('load', () => {
  const shopBtn = document.getElementById('shop-btn');
  const shopPanel = document.getElementById('shop-panel');
  const shopClose = document.getElementById('shop-close');
  const sfxOpen = document.getElementById('sfx-open');
  const sfxClose = document.getElementById('sfx-close');

  shopBtn.addEventListener('click', () => {
    const fishingUI = document.getElementById('fishing-ui');       // 釣りUI表示中か
    const resultOverlay = document.getElementById('result-overlay'); // 捕獲結果表示中か

    // 釣り中または捕獲結果表示中はショップを開けない
    if ((fishingUI && fishingUI.style.display === 'block') ||
        (resultOverlay && resultOverlay.style.display === 'flex')) {
      return;
    }

    if (shopPanel.style.display === 'block') {
      shopPanel.style.display = 'none';
      window.isShopOpen = false;
      sfxClose.play().catch(() => {});
    } else {
      shopPanel.style.display = 'block';
      window.isShopOpen = true;
      sfxOpen.play().catch(() => {});
    }
  });

  shopClose.addEventListener('click', () => {
    shopPanel.style.display = 'none';
    window.isShopOpen = false;
    sfxClose.play().catch(() => {});
  });
});
