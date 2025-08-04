// 画面向きチェック
function checkOrientation() {
  if(window.matchMedia("(orientation: portrait)").matches){
    document.getElementById('orientation-warning').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    document.getElementById('orientation-warning').style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}
window.addEventListener('load', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

// BGM再生（最初のクリックで再生開始）
const bgm = document.getElementById('bgm');
document.body.addEventListener('click', () => {
  if(bgm.paused){
    bgm.play().catch(() => {});
  }
}, { once: true });

// ボタンとパネルの制御 + 効果音再生
const zukanBtn = document.getElementById('zukan-btn');
const shopBtn = document.getElementById('shop-btn');
const zukanPanel = document.getElementById('zukan-panel');
const shopPanel = document.getElementById('shop-panel');
const sfxOpen = document.getElementById('sfx-open');
const sfxClose = document.getElementById('sfx-close');

function togglePanel(panel) {
  const isOpen = panel.style.display === 'block';
  if (isOpen) {
    panel.style.display = 'none';
    sfxClose.play().catch(() => {});
  } else {
    [zukanPanel, shopPanel].forEach(p => {
      if(p !== panel && p.style.display === 'block'){
        p.style.display = 'none';
        sfxClose.play().catch(() => {});
      }
    });
    panel.style.display = 'block';
    sfxOpen.play().catch(() => {});
  }
}
zukanBtn.addEventListener('click', () => togglePanel(zukanPanel));
shopBtn.addEventListener('click', () => togglePanel(shopPanel));

// 図鑑表示用のダミーデータ
const caughtDogs = [
  { src:'images/dog.png', alt:'犬1', description:'おなにーすきすきいぬ。' },
  { src:'images/dogsu.png', alt:'犬2', description:'元気な犬です。' }
];
const zukanList = document.getElementById('zukan-list');

function updateZukan() {
  zukanList.innerHTML = '';
  caughtDogs.forEach(dog => {
    const div = document.createElement('div');
    div.textContent = dog.alt;
    div.style.cursor = 'pointer';
    div.style.border = '1px solid #ccc';
    div.style.margin = '5px';
    div.style.padding = '5px';
    div.addEventListener('click', () => alert(dog.description));
    zukanList.appendChild(div);
  });
}
updateZukan();

// 水面（水エリア）に犬を表示し、ランダムに動かす処理
const waterArea = document.getElementById('water-area');
const dogs = [
  { src: 'images/dog.png', alt: '犬1', description:'おなにーすきすきいぬ。' },
  { src: 'images/dogsu.png', alt: '犬2', description:'元気な犬です。' }
];

function spawnDogsInWater() {
  waterArea.innerHTML = '';

  dogs.forEach(dog => {
    const img = document.createElement('img');
    img.src = dog.src;
    img.alt = dog.alt;
    img.className = 'dog';
    img.style.position = 'absolute';

    const maxX = waterArea.clientWidth - 70;
    const maxY = waterArea.clientHeight - 70;

    // 初期位置をランダムに設定
    let posX = Math.random() * maxX;
    let posY = Math.random() * maxY;
    img.style.left = posX + 'px';
    img.style.top = posY + 'px';

    // ランダム移動のための速度ベクトル
    let velocityX = (Math.random() * 2 - 1) * 1; // -1〜1ピクセル/フレーム
    let velocityY = (Math.random() * 2 - 1) * 1;

    img.style.pointerEvents = 'auto'; // クリックできるようにする（釣り開始用）

    // クリックイベントなどは釣り機能で追加予定なのでここではまだ処理なし

    waterArea.appendChild(img);

    // ランダムに動くアニメーション
    function move() {
      posX += velocityX;
      posY += velocityY;

      // 壁に当たったら反射
      if(posX < 0) {
        posX = 0;
        velocityX = -velocityX;
      } else if(posX > maxX) {
        posX = maxX;
        velocityX = -velocityX;
      }

      if(posY < 0) {
        posY = 0;
        velocityY = -velocityY;
      } else if(posY > maxY) {
        posY = maxY;
        velocityY = -velocityY;
      }

      img.style.left = posX + 'px';
      img.style.top = posY + 'px';

      requestAnimationFrame(move);
    }
    move();
  });
}

window.addEventListener('load', spawnDogsInWater);
window.addEventListener('resize', spawnDogsInWater);
