fetch('dog.json')
  .then(res => res.json())
  .then(dogs => {
    const water = document.getElementById('water');

    dogs.forEach((dog, index) => {
      const dogElem = document.createElement('img');
      dogElem.src = dog.image;
      dogElem.alt = dog.name;
      dogElem.classList.add('dog');

      // ランダムな初期位置
      const x = Math.random() * (window.innerWidth - 50);
      const y = Math.random() * (window.innerHeight - 50);

      dogElem.style.position = 'absolute';  // これ大事！
      dogElem.style.left = `${x}px`;
      dogElem.style.top = `${y}px`;
      dogElem.style.width = '50px';

      // スピード（レア度が高いほど速くする）
      const speed = 1 + dog.rarity / 2;

      water.appendChild(dogElem);

      let currentX = x;
      let currentY = y;
      dogElem.style.transition = `transform ${3000 / speed}ms linear`;

      setInterval(() => {
        const newX = Math.random() * (window.innerWidth - 50);
        const newY = Math.random() * (window.innerHeight - 50);

        const dx = newX - currentX;
        const dy = newY - currentY;

        dogElem.style.transform = `translate(${dx}px, ${dy}px)`;

        currentX = newX;
        currentY = newY;
      }, 3000 / speed);
       // 各犬に釣りイベントを追加
      
        dogElem.addEventListener('click', () => {
          showFishingUI(dog);
        });
  })
  .catch(err => console.error(err));

