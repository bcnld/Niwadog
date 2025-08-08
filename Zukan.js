// ==== 図鑑用グローバル変数とページ管理 ====
let dogData = [];
let caughtDogsMap = {};
let currentPage = 0;
const itemsPerPage = 18;

// DOM要素取得
const zukanBtn = document.getElementById('zukan-btn');
const zukanOverlay = document.getElementById('zukan-overlay');
const zukanList = document.getElementById('zukan-list');
const zukanNav = document.getElementById('zukan-nav');
const zukanClose = document.getElementById('zukan-close');

// 図鑑の表示/非表示切り替え
function toggleZukan() {
  const isActive = zukanOverlay.classList.contains('active');
  if (isActive) {
    zukanOverlay.classList.remove('active');
  } else {
    zukanOverlay.classList.add('active');
    updateZukan();
  }
}

// 図鑑表示更新関数
function updateZukan() {
  if (!dogData || dogData.length === 0) return;

  zukanList.innerHTML = '';
  zukanNav.innerHTML = '';

  const sortedDogs = [...dogData].sort((a, b) => a.number - b.number);
  const totalPages = Math.ceil(sortedDogs.length / itemsPerPage);
  if (currentPage >= totalPages) currentPage = 0;

  const startIndex = currentPage * itemsPerPage;
  const pageDogs = sortedDogs.slice(startIndex, startIndex + itemsPerPage);

  const leftDogs = pageDogs.slice(0, 9);
  const rightDogs = pageDogs.slice(9);

  const leftPage = document.createElement('div');
  leftPage.className = 'zukan-page';
  const rightPage = document.createElement('div');
  rightPage.className = 'zukan-page';

  [leftDogs, rightDogs].forEach((dogs, i) => {
    const container = i === 0 ? leftPage : rightPage;
    dogs.forEach(dog => {
      const item = document.createElement('div');
      item.className = 'zukan-item';

      const numberSpan = document.createElement('span');
      numberSpan.className = 'dog-number';
      numberSpan.textContent = `No.${dog.number}`;

      if (caughtDogsMap[dog.number]) {
        const caughtDog = caughtDogsMap[dog.number];
        const img = document.createElement('img');
        img.src = caughtDog.image;
        img.alt = caughtDog.name;
        img.title = caughtDog.name;
        img.className = 'dog-image';

        item.classList.add('caught', caughtDog.rarity || 'common');
        item.appendChild(img);
        item.addEventListener('click', () => {
          alert(`No.${dog.number} ${dog.name}\n${dog.description}`);
        });
      } else {
        const question = document.createElement('div');
        question.className = 'question-mark';
        question.textContent = '?';
        item.classList.add('not-caught');
        item.appendChild(question);
      }

      item.appendChild(numberSpan);
      container.appendChild(item);
    });
  });

  zukanList.appendChild(leftPage);
  zukanList.appendChild(rightPage);

  // ページナビゲーション
  const nav = document.createElement('div');
  nav.style.textAlign = 'center';
  nav.style.marginTop = '10px';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '前へ';
  prevBtn.disabled = currentPage === 0;
  prevBtn.onclick = () => {
    currentPage--;
    updateZukan();
  };

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '次へ';
  nextBtn.disabled = currentPage >= totalPages - 1;
  nextBtn.onclick = () => {
    currentPage++;
    updateZukan();
  };

  nav.appendChild(prevBtn);
  nav.appendChild(document.createTextNode(` ページ ${currentPage + 1} / ${totalPages} `));
  nav.appendChild(nextBtn);
  zukanNav.appendChild(nav);
}

// イベント登録
zukanBtn.addEventListener('click', toggleZukan);
zukanClose.addEventListener('click', toggleZukan);

// ページ読み込み時にデータ読み込み
window.addEventListener('load', () => {
  const stored = localStorage.getItem('caughtDogs');
  caughtDogsMap = stored ? JSON.parse(stored) : {};

  fetch('dog.json')
    .then(res => res.json())
    .then(data => {
      dogData = data;
      if (zukanOverlay.classList.contains('active')) {
        updateZukan();
      }
    });
});
