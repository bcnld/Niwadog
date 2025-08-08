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
let caughtDogs = [];  // 捕まえた犬IDのリスト
let currentPage = 0;

function loadCaughtDogs() {
  const saved = localStorage.getItem('caughtDogs');
  if (saved) {
    const caughtMap = JSON.parse(saved);
    caughtDogs = Object.keys(caughtMap).map(id => Number(id));
  } else {
    caughtDogs = [];
  }
}

fetch('dog.json')
  .then(res => res.json())
  .then(data => {
    allDogs = data;
    loadCaughtDogs();
    renderZukanPage();
  });

zukanBtn.addEventListener('click', () => {
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
      entry.style.userSelect = 'none';
      entry.style.display = 'flex';
      entry.style.justifyContent = 'center';
      entry.style.alignItems = 'center';
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

function showDogProfile(dog) {
  profileName.textContent = dog.name || '名前不明';
  profileImage.src = dog.image;
  profileImage.alt = dog.name || '犬の画像';
  profileDescription.textContent = dog.description || '説明なし';

  profileModal.style.display = 'flex';
}

function updateZukan() {
  loadCaughtDogs();
  renderZukanPage();
}
