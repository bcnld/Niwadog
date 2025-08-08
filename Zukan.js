const zukanBtn = document.getElementById('zukan-btn');
const zukanPanel = document.getElementById('zukan-panel');
const zukanClose = document.getElementById('zukan-close');
const zukanEntries = document.getElementById('zukan-entries');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const sfxOpen = document.getElementById('sfx-open');  // HTMLに<audio id="sfx-open">が必要
const sfxClose = document.getElementById('sfx-close'); // HTMLに<audio id="sfx-close">が必要

let allDogs = []; // dog.json の中身をここに格納
let caughtDogs = []; // 釣った犬のIDだけを格納
let currentPage = 0;

fetch('dog.json')
  .then(res => res.json())
  .then(data => {
    allDogs = data;
    renderZukanPage(); // 初期表示
  });

// 図鑑ボタン開閉
zukanBtn.addEventListener('click', () => {
  sfxOpen.play(); // ← 効果音を再生
  zukanPanel.style.display = (zukanPanel.style.display === 'block') ? 'none' : 'block';
  renderZukanPage(); // ページを更新
});

zukanClose.addEventListener('click', () => {
  sfxOpen.play(); // ← 閉じるときにも効果音を再生
  zukanPanel.style.display = 'none';
});
// ページ切り替え
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 0) {
    currentPage--;
    renderZukanPage();
  }
});

nextPageBtn.addEventListener('click', () => {
  const maxPage = Math.ceil(allDogs.length / 9) - 1;
  if (currentPage < maxPage) {
    currentPage++;
    renderZukanPage();
  }
});

// 捕獲時に呼び出す関数
function registerCaughtDog(dogId) {
  if (!caughtDogs.includes(dogId)) {
    caughtDogs.push(dogId);
  }
}

// 図鑑表示更新
function renderZukanPage() {
  zukanEntries.innerHTML = '';

  const start = currentPage * 9;
  const end = start + 9;
  const dogsToDisplay = allDogs.slice(start, end);

  dogsToDisplay.forEach((dog, index) => {
    const entry = document.createElement('div');
    entry.classList.add('zukan-entry');

    const number = start + index + 1;

    if (caughtDogs.includes(dog.id)) {
      entry.classList.add('caught');
      const img = document.createElement('img');
      img.src = dog.image;
      entry.appendChild(img);
    } else {
      entry.textContent = `No.${number} ???`;
    }

    zukanEntries.appendChild(entry);
  });
}
