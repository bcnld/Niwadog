const achievementPanel = document.getElementById('achievement-panel');
const img = document.createElement('img');
img.src = 'images/ach_icon.png';  // 画像のパスを必ず正しく
img.alt = 'Achievement Icon';
img.style.width = '50px';
img.style.height = '50px';
achievementPanel.appendChild(img);
