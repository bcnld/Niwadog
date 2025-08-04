// 1. JSONを読み込む
fetch('dog.json')
  .then(res => res.json())
  .then(allDogs => {
    const waterArea = document.getElementById('water-area');
    
    // 2. 犬を一匹だけ画面に出す
    const dog = allDogs[0]; // とりあえず1匹
    const img = document.createElement('img');
    img.src = dog.image;
    img.alt = dog.name;
    img.className = 'dog';
    img.style.position = 'absolute';
    img.style.left = '50%';
    img.style.top = '50%';
    img.style.transform = 'translate(-50%, -50%)';
    waterArea.appendChild(img);
  })
  .catch(err => {
    console.error('dog.jsonの読み込みエラー:', err);
  });
