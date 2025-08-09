const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

let isFishing = false;
let selectedDog = null;

window.attachDogClickEvents = function() {
  const dogs = document.querySelectorAll('.dog');
  console.log('attachDogClickEvents: dogs count =', dogs.length);
  dogs.forEach(dog => {
    dog.onclick = () => {
      console.log('犬クリック:', dog.alt);
      startFishing(dog);
    };
  });
};

function startFishing(dogElement) {
  if (isFishing) return;
  isFishing = true;
  selectedDog = dogElement;

  console.log('startFishing called for', dogElement.alt);

  fishingResult.textContent = '';
  fishingUI.style.display = 'block';

  drawRoulette();
}

function drawRoulette() {
  // ルーレット描画処理（省略可）
}

window.addEventListener('load', () => {
  attachDogClickEvents();
});

reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  // ルーレットの動作処理
});
