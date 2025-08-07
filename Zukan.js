const zukanBtn = document.getElementById('zukan-btn');
const zukanPanel = document.getElementById('zukan-panel');
const zukanList = document.getElementById('zukan-list');
const zukanNav = document.getElementById('zukan-nav');

let currentPage = 0;
const itemsPerPage = 18;

zukanBtn.addEventListener('click', () => togglePanel(zukanPanel));

function updateZukan() {
  zukanList.innerHTML = '';
  zukanNav.innerHTML = '';

  const sortedDogs = [...dogData].sort((a, b) => a.number - b.number);
  const totalPages = Math.ceil(sortedDogs.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const pageDogs = sortedDogs.slice(startIndex, startIndex + itemsPerPage);

  const leftDogs = pageDogs.slice(0, 9);
  const rightDogs = pageDogs.slice(9, 18);

  const leftPage = document.createElement('div');
  leftPage.className = 'zukan-page';

  const rightPage = document.createElement('div');
  rightPage.className = 'zukan-page';

  [leftDogs, rightDogs].forEach((dogSet, i) => {
    const page = i === 0 ? leftPage : rightPage;
    for (const dog of dogSet) {
      const div = document.createElement('div');
      div.className = 'zukan-card';

      if (caughtDogsMap[dog.number]) {
        div.classList.add('caught');
        const caughtDog = caughtDogsMap[dog.number];
        const img = document.createElement('img');
        img.src = caughtDog.image;
        img.alt = caughtDog.name;
        img.title = caughtDog.name;
        div.appendChild(img);
        div.addEventListener('click', () => {
          alert(`No.${dog.number} ${dog.name}\n${dog.description}`);
        });
      } else {
        div.textContent = '?';
      }

      page.appendChild(div);
    }
  });

  zukanList.appendChild(leftPage);
  zukanList.appendChild(rightPage);

  // ページナビ
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
