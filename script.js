// 犬データ読み込みと表示・移動処理
fetch('dog.json')
  .then(res => res.json())
  .then(allDogs => {
    const waterArea = document.getElementById('water-area');
    const isMobile = window.innerWidth <= 600;
    const dogSize = isMobile ? 50 : 70;

    // レア度に応じて重み付け
    function weightedRandomDogs(dogs, count = 10) {
      const weighted = [];
      dogs.forEach(dog => {
        const weight = Math.max(1, 8 - dog.rarity); // rarity: 1→7, 7→1
        for (let i = 0; i < weight; i++) {
          weighted.push(dog);
        }
      });
      const selected = [];
      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * weighted.length);
        selected.push(weighted[index]);
      }
      return selected;
    }

    const dogs = weightedRandomDogs(allDogs, 12); // 表示する犬の数

    dogs.forEach(dog => {
      const dogElem = document.createElement('img');
      dogElem.src = dog.image;
      dogElem.alt = dog.name;
      dogElem.classList.add('dog');
      dogElem.style.width = `${dogSize}px`;

      let x = Math.random() * (waterArea.clientWidth - dogSize);
      let y = Math.random() * (waterArea.clientHeight - dogSize);
      dogElem.style.left = `${x}px`;
      dogElem.style.top = `${y}px`;

      dogElem.dataset.info = JSON.stringify(dog);
      waterArea.appendChild(dogElem);

      setInterval(() => {
        x = Math.random() * (waterArea.clientWidth - dogSize);
        y = Math.random() * (waterArea.clientHeight - dogSize);
        dogElem.style.left = `${x}px`;
        dogElem.style.top = `${y}px`;
      }, 3000 + Math.random() * 3000);

      dogElem.addEventListener('click', () => {
        showFishingUI(dogElem);
      });
    }); // ← forEachの閉じ忘れを修正
  })
  .catch(err => {
    console.error('dog.jsonの読み込みに失敗しました:', err);
  });
