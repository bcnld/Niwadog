// fishing.js

const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');

let isFishing = false;
let selectedDog = null;

window.attachDogClickEvents = function() {
  const dogs = document.querySelectorAll('.dog');
  dogs.forEach(dog => {
    dog.onclick = () => {
      if (isFishing) return;
      isFishing = true;
      selectedDog = dog;

      fishingResult.textContent = '';
      fishingUI.style.display = 'block';

      // ここにルーレット開始処理など追加可
      console.log('釣り開始！', dog.alt);
    };
  });
};

// 例: リールボタンで釣り終了（閉じる）
reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  isFishing = false;
  fishingUI.style.display = 'none';
  selectedDog = null;
  console.log('釣り終了');
});
