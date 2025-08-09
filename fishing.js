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

  // ここでルーレット初期化などの処理を行う（省略可能）
  // 例：angle=0, spinSpeed=0.3など

  // ルーレット描画開始（あれば）
  drawRoulette();
}

function drawRoulette() {
  // ルーレットの描画ロジックをここに書くか別関数で実装
  // 省略してUIだけ表示するなら空でもOK
}

// 水平方向にいるすべての犬要素にクリックイベントをつける関数
function attachDogClickEvents() {
  const dogs = document.querySelectorAll('.dog');
  dogs.forEach(dog => {
    dog.style.cursor = 'pointer'; // クリックできる感じに
    dog.addEventListener('click', () => {
      startFishing(dog);
    });
  });
}

// ページロード後か、犬が生成されたあとに呼んでください
window.addEventListener('load', () => {
  attachDogClickEvents();
});

// 釣りUIのリールボタンイベントなどもここに書く
reelButton.addEventListener('click', () => {
  if (!isFishing) return;
  // ルーレット回転スタートや停止処理
  // 省略...
});

// UIを閉じる処理もあればここに
