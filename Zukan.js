const zukanBtn = document.getElementById('zukan-btn');
const zukanPanel = document.getElementById('zukan-panel');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');

const profileModal = document.getElementById('dog-profile-modal');
const profileCloseBtn = document.getElementById('profile-close');
const profileName = document.getElementById('profile-name');
const profileImage = document.getElementById('profile-image');
const profileDescription = document.getElementById('profile-description');

let allDogs = [];
let caughtDogs = [];  // 捕まえた犬IDのリスト（numberの配列）
let currentPage = 0;

// ローカルストレージから caughtDogs を配列として読み込む
function loadCaughtDogs() {
  const saved = localStorage.getItem('caughtDogs');
  if (saved) {
    const caughtMap = JSON.parse(saved);
    caughtDogs = Object.keys(caughtMap).map(id => Number(id));
  } else {
    caughtDogs = [];
  }
}

// dog.jsonを読み込んで初期化
fetch('dog.json')
  .then(res => res.json())
  .then(data => {
    allDogs = data;
    loadCaughtDogs();
    renderZukanPage();
  });

// 図鑑パネルの表示切り替え
zukanBtn.addEventListener('click', () => {
  if (zukanPanel.style.display === 'block') {
    zukanPanel.style.display = 'none';
    sfxClose.play();
  } else {
    zukanPanel.style.display = 'block';
    sfxOpen.play();
    renderZukanPage();
  }
});

// ページ送り（前）
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--;
    renderZukanPage();
  }
});

// ページ送り（次）
nextPageBtn.addEventListener('click', () => {
  const maxPage = Math.ceil(allDogs.length / 18) - 1;
  if (currentPage < maxPage) {
    currentPage++;
    renderZukanPage();
  }
});

// プロフィールモーダル閉じる
profileCloseBtn.addEventListener('click', () => {
  profileModal.style.display = 'none';
});

// 図鑑ページを描画
function renderZukanPage() {
  const leftPage = document.getElementById('zukan-page-left');
  const rightPage = document.getElementById('zukan-page-right');
  leftPage.innerHTML = '';
  rightPage.innerHTML = '';

  const start = currentPage * 18;
  const dogsToDisplay = allDogs.slice(start, start + 18);

  dogsToDisplay.forEach((dog, i) => {
    const entry = document.createElement('div');
    entry.classList.add('zukan-entry');

    if (caughtDogs.includes(dog.number)) {
      entry.classList.add('caught');
      entry.classList.add(dog.rarity);

      const img = document.createElement('img');
      img.src = dog.image;
      img.alt = dog.name || '犬の画像';
      img.style.cursor = 'pointer';

      img.addEventListener('click', () => {
        showDogProfile(dog);
      });

      entry.appendChild(img);
    } else {
      entry.classList.add('not-caught');
      entry.textContent = '？';
      entry.style.fontSize = '3rem';
      entry.style.textAlign = 'center';
      entry.style.color = '#666';
    }

    if (i < 9) {
      leftPage.appendChild(entry);
    } else {
      rightPage.appendChild(entry);
    }
  });

  const maxPage = Math.ceil(allDogs.length / 18);
  document.getElementById('page-indicator').textContent = `${currentPage + 1} / ${maxPage}`;
}

// 犬プロフィールを表示
function showDogProfile(dog) {
  profileName.textContent = dog.name || '名前不明';
  profileImage.src = dog.image;
  profileImage.alt = dog.name || '犬の画像';
  profileDescription.textContent = dog.description || '説明なし';

  profileModal.style.display = 'flex';
}

// 釣りで捕まえたあとに図鑑更新したい時に呼ぶ関数
function updateZukan() {
  loadCaughtDogs();
  renderZukanPage();
}
