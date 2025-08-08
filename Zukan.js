// Zukan.js
const zukanBtn = document.getElementById('zukan-btn');
const zukanPanel = document.getElementById('zukan-panel');
const closeZukanBtn = document.getElementById('close-zukan-btn');

// 図鑑ボタンをクリックで表示/非表示切り替え
zukanBtn.addEventListener('click', () => {
  const isVisible = zukanPanel.style.display === 'block';
  zukanPanel.style.display = isVisible ? 'none' : 'block';
});

// 閉じるボタンで非表示にする
closeZukanBtn.addEventListener('click', () => {
  zukanPanel.style.display = 'none';
});
