const zukanBtn = document.getElementById('zukan-btn');
const zukanPanel = document.getElementById('zukan-panel');
const zukanClose = document.getElementById('zukan-close');

// トグル動作を追加
zukanBtn.addEventListener('click', () => {
  if (zukanPanel.style.display === 'block') {
    zukanPanel.style.display = 'none';
  } else {
    zukanPanel.style.display = 'block';
  }
});

// 閉じるボタンでも閉じれるように
zukanClose.addEventListener('click', () => {
  zukanPanel.style.display = 'none';
});
