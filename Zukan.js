const zukanBtn = document.getElementById('zukan-btn');
const zukanPanel = document.getElementById('zukan-panel');
const zukanClose = document.getElementById('zukan-close');

// 開く
zukanBtn.addEventListener('click', () => {
  zukanPanel.style.display = 'block';
});

// 閉じる
zukanClose.addEventListener('click', () => {
  zukanPanel.style.display = 'none';
});
