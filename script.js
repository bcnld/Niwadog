fetch('dog.json')
  .then(res => res.json())
  .then(fishes => {
    console.log(fishes); // ←中身を確認

    const water = document.getElementById('water');

    fishes.forEach((fish, index) => {
      console.log(`Loading: ${fish.image}`);

      const fishElem = document.createElement('img');
      fishElem.src = fish.image;
      fishElem.alt = fish.name;
      fishElem.classList.add('fish');

      const x = Math.random() * (window.innerWidth - 50);
      const y = Math.random() * (window.innerHeight - 50);

      fishElem.style.left = `${x}px`;
      fishElem.style.top = `${y}px`;

      const speed = 1 + fish.rarity / 2;

      water.appendChild(fishElem);

      setInterval(() => {
        const newX = Math.random() * (window.innerWidth - 50);
        const newY = Math.random() * (window.innerHeight - 50);

        fishElem.style.transform = `translate(${newX - x}px, ${newY - y}px)`;
      }, 3000 / speed);
    });
  })
  .catch(err => {
    console.error("データ読み込みエラー:", err);
  });
