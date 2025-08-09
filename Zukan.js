const zukanBtn = document.getElementById('zukan-btn');
const zukanPanel = document.getElementById('zukan-panel');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');

// ▼ プロフィール用の要素追加
const profileModal = document.getElementById('dog-profile-modal');
const profileCloseBtn = document.getElementById('profile-close');
const profileName = document.getElementById('profile-name');
const profileImage = document.getElementById('profile-image');
const profileDescription = document.getElementById('profile-description');
const profileRarity = document.getElementById('profile-rarity');
const profilePrice = document.getElementById('profile-price');

let allDogs = [];
let caughtDogs = [];
let currentPage = 0;

function loadCaughtDogs() {
  const saved = localStorage.getItem('caughtDogs');
  caughtDogs = saved ? Object.keys(JSON.parse(saved)).map(id => Number(id)) : [];
}

fetch('dog.json')
  .then(res => res.json())
  .then(data => {
    allDogs = data;
    loadCaughtDogs();
    renderZukanPage();
  });

zukanBtn.addEventListener('click', () => {
  if (window.isFishing) return;

  const willOpen = zukanPanel.style.display !== 'block';
  zukanPanel.style.display = willOpen ? 'block' : 'none';
  window.isZukanOpen = willOpen;

  (willOpen ? sfxOpen : sfxClose).play();
  if (willOpen) renderZukanPage();

  if (typeof window.onZukanToggle === 'function') {
    window.onZukanToggle(willOpen);
  }
});

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--;
    renderZukanPage();
  }
});

nextPageBtn.addEventListener('click', () => {
  const maxPage = Math.ceil(allDogs.length / 18) - 1;
  if (currentPage < maxPage) {
    currentPage++;
    renderZukanPage();
  }
});

// ▼ モーダルを閉じる
profileCloseBtn.addEventListener('click', () => {
  profileModal.style.display = 'none';
});

function renderZukanPage() {
  const leftPage = document.getElementById('zukan-page-left');
  const rightPage = document.getElementById('zukan-page-right');
  leftPage.innerHTML = '';
  rightPage.innerHTML = '';

  const start = currentPage * 18;
  const dogsToDisplay = allDogs.slice(start, start + 18);

  dogsToDisplay.forEach((dog, i) => {
    const entry = document.createElement('div');
    entry.className = 'dog-slot';  // 図鑑用枠クラス

    if (dog.rarity) {
      entry.classList.add(dog.rarity);
    }

    const img = document.createElement('img');
    img.src = caughtDogs.includes(dog.number) ? dog.image : 'images/hatena.png';
    img.alt = dog.name || '犬の画像';
    img.width = 60;
    img.height = 60;
    img.classList.add('zukan-dog'); // 図鑑専用クラス（釣り用と区別）

    if (caughtDogs.includes(dog.number)) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => showDogProfile(dog));
    }

    entry.appendChild(img);
    (i < 9 ? leftPage : rightPage).appendChild(entry);
  });

  const maxPage = Math.ceil(allDogs.length / 18);
  document.getElementById('page-indicator').textContent = `${currentPage + 1} / ${maxPage}`;
}

// ▼ 犬プロフィール表示関数
function showDogProfile(dog) {
  console.log('Dog data for profile:', dog);

  profileName.textContent = dog?.name ?? '名前不明';
  profileImage.src = dog?.image || 'images/noimage.png';
  profileImage.alt = dog?.name || '犬の画像';
  profileDescription.textContent = dog?.description || '説明なし';
  profileRarity.textContent = `レアリティ: ${dog?.rarity || '不明'}`;
  profilePrice.textContent = `売値: ${dog?.price ?? 0} 円`;
  profileModal.style.display = 'flex';
}

function updateZukan() {
  loadCaughtDogs();
  renderZukanPage();
}
