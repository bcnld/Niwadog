window.addEventListener('load', () => {
  const shopBtn = document.getElementById('shop-btn');
  const shopPanel = document.getElementById('shop-panel');
  const shopClose = document.getElementById('shop-close');
  const sfxOpen = document.getElementById('sfx-open');
  const sfxClose = document.getElementById('sfx-close');

  shopBtn.addEventListener('click', () => {
    if (shopPanel.style.display === 'block') {
      shopPanel.style.display = 'none';
      sfxClose.play().catch(() => {});
    } else {
      shopPanel.style.display = 'block';
      sfxOpen.play().catch(() => {});
    }
  });

  shopClose.addEventListener('click', () => {
    shopPanel.style.display = 'none';
    sfxClose.play().catch(() => {});
  });
});
