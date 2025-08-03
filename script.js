fetch('dog.json')
  .then(res => res.json())
  .then(fishes => {
    const water = document.getElementById('water');

    fishes.forEach((fish, index) => {
      const fishElem = document.createElement('img');
      fishElem.src = fish.image;
      fishElem.alt = fish.name;
      fishElem.classList.add('fish');

      // ランダムな初期位置
      const x = Math.random() * (window.innerWidth - 50);
      const y = Math.random() * (window.innerHeight - 50);

      fishElem.style.left = `${x}px`;
      fishElem.style.top = `${y}px`;

      // スピード（レア度が高いほど速くする）
      const speed = 1 + fish.rarity / 2;

      water.appendChild(fishElem);

      // ランダム移動
      setInterval(() => {
        const newX = Math.random() * (window.innerWidth - 50);
        const newY = Math.random() * (window.innerHeight - 50);

        fishElem.style.transform = `translate(${newX - x}px, ${newY - y}px)`;
      }, 3000 / speed);
    });
  });
