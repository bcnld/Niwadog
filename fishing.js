// fishing.js

// 釣りUIの要素を取得
const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

let isFishing = false;
let selectedDog = null;

function startFishing(dogElement) {
  if (isFishing) return; // 釣り中は無効
  isFishing = true;
  selectedDog = dogElement;

  fishingResult.textContent = '';
  fishingUI.style.display = 'block';

  // 必要ならルーレット初期化処理
  drawRoulette();
}

function drawRoulette() {
  // ルーレット描画ロジック（省略可）
}

// 水辺の犬だけにクリックイベントを付ける
window.attachDogClickEvents = function() {
  const dogs = document.querySelectorAll('#water-area .dog');
  dogs.forEach(dog => {
    dog.onclick = (e) => {
      if (window.isZukanOpen) {
        e.stopPropagation();
        return; // 図鑑開いてるときは釣りUI出さない
      }
      startFishing(dog);
    };
  });
};

// ページロード後にイベント付け
window.addEventListener('load', () => {
  attachDogClickEvents();
});

// リールボタンクリック
reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  // ルーレット回転や停止処理（省略可）
});

// UIを閉じる処理（必要なら追加）
