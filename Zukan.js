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
let caughtDogs = [];
let currentPage = 0;

// ▼ ローカルストレージから caughtDogs を読み込み
const savedCaught = localStorage.getItem('caughtDogs');
if (savedCaught) {
  caughtDogs = JSON.parse(savedCaught);
}

// ▼ dog.json読み込み
fetch('dog.json')
  .then(res => res.json())
  .then(data => {
    allDogs = data;
    renderZukanPage();
  });

// ▼ 図鑑ボタンの開閉
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

// ▼ ページ移動
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

// ▼ プロフィールモーダル閉じる
profileCloseBtn.addEventListener('click', () => {
  profileModal.style.display = 'none';
});

// ▼ 犬を釣ったときに呼ぶ関数
function registerCaughtDog(dogId) {
  if (!caughtDogs.includes(dogId)) {
    caughtDogs.push(dogId);
    localStorage.setItem('caughtDogs', JSON.stringify(caughtDogs));
    renderZukanPage(); // 図鑑を自動更新
  }
}

// ▼ 図鑑ページ描画
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

    if (caughtDogs.includes(dog.id)) {
      entry.classList.add('caught');
      entry.classList.add(dog.rarity); // レアリティに応じた枠などに使う

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

// ▼ プロフィール表示
function showDogProfile(dog) {
  profileName.textContent = dog.name || '名前不明';
  profileImage.src = dog.image;
  profileImage.alt = dog.name || '犬の画像';
  profileDescription.textContent = dog.description || '説明なし';

  profileModal.style.display = 'flex';
}
