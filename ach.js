window.addEventListener('load', () => {
  const achievementPanel = document.getElementById('achievement-panel');
  achievementPanel.innerHTML = ''; // クリア

  // 仮のテストアイコン（実在する画像パスに変えてください）
  const testIcon = document.createElement('img');
  testIcon.src = 'images/ach_icon.png';  // ここを実在画像パスに
  testIcon.alt = 'Test Achievement';
  testIcon.style.width = '50px';
  testIcon.style.height = '50px';
  achievementPanel.appendChild(testIcon);

  // 表示しているか確認してください
  achievementPanel.style.display = 'flex';
});
