const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

let isFishing = false;
let selectedDog = null;

function startFishing(dogElement) {
  if (isFishing) return;
  isFishing = true;
  selectedDog = dogElement;

  fishingResult.textContent = '';
  fishingUI.style.display = 'block';

  drawRoulette();
}

function drawRoulette() {
  // ここにルーレット描画ロジックを入れてください（省略可）
}

// 水辺の犬だけにクリックイベントを付ける
window.attachDogClickEvents = function() {
  // 図鑑犬を除外して釣り用犬だけにイベント付与
  const dogs = document.querySelectorAll('#water-area .dog:not(.zukan-dog)');
  dogs.forEach(dog => {
    dog.onclick = () => {
      if (window.isZukanOpen) return;  // 図鑑開いてたら釣りしない
      startFishing(dog);
    };
  });
};

window.addEventListener('load', () => {
  attachDogClickEvents();
});

reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  // ルーレット回転や停止の処理（省略可）
});

// 釣りUIを閉じる処理も必要ならここに追加してください
