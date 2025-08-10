const zukanBtn = document.getElementById('zukan-btn');
const zukanPanel = document.getElementById('zukan-panel');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');

// プロフィール用の要素
const profileModal = document.getElementById('dog-profile-modal');
const profileCloseBtn = document.getElementById('profile-close');
const profileName = document.getElementById('profile-name-modal');
const profileImage = document.getElementById('profile-image-modal');
const profileDescription = document.getElementById('profile-description-modal');
const profileRarity = document.getElementById('profile-rarity-modal');
const profilePrice = document.getElementById('profile-price-modal');

let allDogs = [];
let currentPage = 0;

// 図鑑登録済み犬IDリスト（localStorage永続化対応）
let registeredDogs = [];

// localStorageから登録済み犬データを読み込み
function loadRegisteredDogs() {
  const saved = localStorage.getItem('registeredDogs');
  registeredDogs = saved ? JSON.parse(saved) : [];
}

// localStorageへ登録済み犬データを保存
function saveRegisteredDogs() {
  localStorage.setItem('registeredDogs', JSON.stringify(registeredDogs));
}

// 犬データ読み込み
fetch('dog.json')
  .then(res => res.json())
  .then(data => {
    allDogs = data;
    loadRegisteredDogs();
    renderZukanPage();
  })
  .catch(err => {
    console.error("犬データの読み込みに失敗:", err);
  });

// 図鑑ボタンの表示切替
zukanBtn.addEventListener('click', () => {
  if (window.isFishing) return; // 釣り中は開けない

  const willOpen = zukanPanel.style.display !== 'block';
  zukanPanel.style.display = willOpen ? 'block' : 'none';
  window.isZukanOpen = willOpen;

  (willOpen ? sfxOpen : sfxClose).play();
  if (willOpen) renderZukanPage();

  if (typeof window.onZukanToggle === 'function') {
    window.onZukanToggle(willOpen);
  }
});

// ページ切り替え
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

// プロフィール閉じる
profileCloseBtn.addEventListener('click', () => {
  profileModal.style.display = 'none';
});

profileModal.addEventListener('click', e => {
  e.stopPropagation();
});

// 図鑑ページの描画
function renderZukanPage() {
  const leftPage = document.getElementById('zukan-page-left');
  const rightPage = document.getElementById('zukan-page-right');
  leftPage.innerHTML = '';
  rightPage.innerHTML = '';

  const start = currentPage * 18;
  const dogsToDisplay = allDogs.slice(start, start + 18);

  dogsToDisplay.forEach((dog, i) => {
    const entry = document.createElement('div');
    entry.className = 'dog-slot';
    if (dog.rarity) entry.classList.add(dog.rarity);

    const img = document.createElement('img');

    // 図鑑に登録済みなら犬画像、そうでなければはてな画像
    const isRegistered = registeredDogs.includes(String(dog.number));
    img.src = isRegistered ? dog.image : 'images/hatena.png';
    img.alt = dog.name || '犬の画像';
    img.width = 60;
    img.height = 60;
    img.classList.add('zukan-dog'); // 図鑑専用クラス

    if (isRegistered) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => showDogProfile(dog));
    }

    entry.appendChild(img);
    (i < 9 ? leftPage : rightPage).appendChild(entry);
  });

  const maxPage = Math.ceil(allDogs.length / 18);
  document.getElementById('page-indicator').textContent = `${currentPage + 1} / ${maxPage}`;
}

// 犬プロフィール表示
function showDogProfile(dog) {
  profileName.textContent = dog?.name ?? '名前不明';
  profileImage.src = dog?.image || 'images/noimage.png';
  profileImage.alt = dog?.name || '犬の画像';
  profileDescription.textContent = dog?.description || '説明なし';
  profileRarity.textContent = `レアリティ: ${dog?.rarity || '不明'}`;
  profilePrice.textContent = `売値: ${dog?.price ?? 0} 円`;
  profileModal.style.display = 'flex';
}

// 図鑑に登録（重複チェック・localStorage保存・UI更新）
function registerDog(dogId) {
  dogId = String(dogId);
  if (!registeredDogs.includes(dogId)) {
    registeredDogs.push(dogId);
    saveRegisteredDogs();
    console.log(`図鑑に犬ID ${dogId} を登録しました`);
    renderZukanPage();
  }
}
