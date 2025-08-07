// グローバル変数として参照されることを想定
const zukanOverlay = document.getElementById('zukan-overlay');
const zukanList = document.getElementById('zukan-list');
const zukanNav = document.getElementById('zukan-nav');

window.zukanPanel = zukanOverlay;

let currentPage = 0;
const itemsPerPage = 18;

// 図鑑開閉用関数（他JSの togglePanel() と連携）
function toggleZukan() {
  const isOpen = zukanOverlay.style.display === 'block';
  if (isOpen) {
    zukanOverlay.style.display = 'none';
  } else {
    zukanOverlay.style.display = 'block';
    updateZukan();
  }
}

// 図鑑表示更新関数
function updateZukan() {
  if (!window.dogData) return; // dogDataが未ロードなら何もしない
  if (!window.caughtDogsMap) window.caughtDogsMap = {};

  zukanList.innerHTML = '';
  zukanNav.innerHTML = '';

  const sortedDogs = [...window.dogData].sort((a, b) => a.number - b.number);
  const totalPages = Math.ceil(sortedDogs.length / itemsPerPage);
  if (currentPage >= totalPages) currentPage = 0;

  const startIndex = currentPage * itemsPerPage;
  const pageDogs = sortedDogs.slice(startIndex, startIndex + itemsPerPage);

  // 左右ページに分割（9個ずつ）
  const leftDogs = pageDogs.slice(0, 9);
  const rightDogs = pageDogs.slice(9, 18);

  // ページコンテナ作成
  const leftPage = document.createElement('div');
  leftPage.className = 'zukan-page';
  const rightPage = document.createElement('div');
  rightPage.className = 'zukan-page';

  [leftDogs, rightDogs].forEach((dogs, i) => {
    const container = i === 0 ? leftPage : rightPage;
    dogs.forEach(dog => {
      const item = document.createElement('div');
      item.className = 'zukan-item';

      if (window.caughtDogsMap[dog.number]) {
        item.classList.add('caught');
        const caughtDog = window.caughtDogsMap[dog.number];

        const img = document.createElement('img');
        img.src = caughtDog.image;
        img.alt = caughtDog.name;
        img.title = caughtDog.name;
        img.className = 'dog-image';

        item.classList.add(caughtDog.rarity || 'common');

        const numberSpan = document.createElement('span');
        numberSpan.className = 'dog-number';
        numberSpan.textContent = `No.${dog.number}`;

        item.appendChild(img);
        item.appendChild(numberSpan);

        item.addEventListener('click', () => {
          alert(`No.${dog.number} ${dog.name}\n${dog.description}`);
        });
      } else {
        // 未捕獲
        item.classList.add('not-caught');

        const question = document.createElement('div');
        question.className = 'question-mark';
        question.textContent = '?';

        const numberSpan = document.createElement('span');
        numberSpan.className = 'dog-number';
        numberSpan.textContent = `No.${dog.number}`;

        item.appendChild(question);
        item.appendChild(numberSpan);
      }

      container.appendChild(item);
    });
  });

  zukanList.appendChild(leftPage);
  zukanList.appendChild(rightPage);

  // ページナビゲーション作成
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

// 図鑑ボタン押下で開閉（script.js側と同じtogglePanelではなく、ここで完結させても良い）
const zukanBtn = document.getElementById('zukan-btn');
zukanBtn.addEventListener('click', () => {
  const isOpen = zukanOverlay.style.display === 'block';
  if (isOpen) {
    zukanOverlay.style.display = 'none';
  } else {
    zukanOverlay.style.display = 'block';
    updateZukan();
  }
});

// ページ読み込み時に初期化しておく（任意）
window.addEventListener('load', () => {
  if (!window.caughtDogsMap) window.caughtDogsMap = {};
  if (!window.dogData) window.dogData = [];
  zukanOverlay.style.display = 'none';
});
