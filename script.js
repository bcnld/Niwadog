const waterArea = document.getElementById('water-area');
const testDogs = [
  { name: 'ポチ', image: 'images/dog1.png', rarity: 3 },
  { name: 'タロウ', image: 'images/dog2.png', rarity: 5 },
];

testDogs.forEach(dog => {
  const dogElem = document.createElement('img');
  dogElem.src = dog.image;
  dogElem.alt = dog.name;
  dogElem.classList.add('dog');
  dogElem.style.width = '70px';
  dogElem.style.position = 'absolute';
  dogElem.style.left = Math.random() * (waterArea.clientWidth - 70) + 'px';
  dogElem.style.top = Math.random() * (waterArea.clientHeight - 70) + 'px';
  waterArea.appendChild(dogElem);
});
