// 図鑑用グローバル変数とページ管理
const zukanOverlay = document.getElementById('zukan-overlay');
const zukanList = document.getElementById('zukan-list');
const zukanNav = document.getElementById('zukan-nav');

let currentPage = 0;
const itemsPerPage = 18;

// 図鑑開閉用関数
function toggleZukan() {
  if (zukanOverlay.classList.contains('active')) {
    zukanOverlay.classList.remove('active');
  } else {
    zukanOverlay.classList.add('active');
    updateZukan();
  }
}

// 図鑑表示更新関数
function updateZukan() {
  if (!dogData || dogData.length === 0) return;
  if (!caughtDogsMap) caughtDogsMap = {};

  zukanList.innerHTML = '';
  zukanNav.innerHTML = '';

  const sortedDogs = [...dogData].sort((a, b) => a.number - b.number);
  const totalPages = Math.ceil(sortedDogs.length / itemsPerPage);
  if (currentPage >= totalPages) currentPage = 0;

  const startIndex = currentPage * itemsPerPage;
  const pageDogs = sortedDogs.slice(startIndex, startIndex + itemsPerPage);

  const leftDogs = pageDogs.slice(0, 9);
  const rightDogs = pageDogs.slice(9, 18);

  const leftPage = document.createElement('div');
  leftPage.className = 'zukan-page';
  const rightPage = document.createElement('div');
  rightPage.className = 'zukan-page';

  [leftDogs, rightDogs].forEach((dogs, i) => {
    const container = i === 0 ? leftPage : rightPage;
    dogs.forEach(dog => {
      const item = document.createElement('div');
      item.className = 'zukan-item';

      if (caughtDogsMap[dog.number]) {
        item.classList.add('caught');
        const caughtDog = caughtDogsMap[dog.number];

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

// 図鑑ボタンにイベント追加
zukanBtn.addEventListener('click', () => {
  toggleZukan();
});
