const zukanBtn = document.getElementById('zukan-btn');
const zukanPanel = document.getElementById('zukan-panel');
const zukanClose = document.getElementById('zukan-close');

// トグル開閉処理
zukanBtn.addEventListener('click', () => {
  if (zukanPanel.style.display === 'block') {
    zukanPanel.style.display = 'none';
  } else {
    zukanPanel.style.display = 'block';
  }
});

// 閉じるボタンでも閉じられるように
zukanClose.addEventListener('click', () => {
  zukanPanel.style.display = 'none';
});
