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

// 釣りミニゲームUI制御
const fishingUI = document.getElementById('fishing-ui');
const reelButton = document.getElementById('reel-button');
const pointer = document.getElementById('pointer');
const targetZone = document.getElementById('target-zone');
const fishingResult = document.getElementById('fishing-result');

function startFishing() {
  fishingUI.style.display = 'block';
  fishingResult.textContent = '';
  pointer.style.animationPlayState = 'running';
}
function stopFishing() {
  pointer.style.animationPlayState = 'paused';
  const pointerRect = pointer.getBoundingClientRect();
  const targetRect = targetZone.getBoundingClientRect();
  if(pointerRect.left >= targetRect.left && pointerRect.right <= targetRect.right) {
    fishingResult.textContent = '🎯 ヒット！犬が釣れた！';
  } else {
    fishingResult.textContent = '💨 のがした…';
  }
  setTimeout(() => {
    fishingUI.style.display = 'none';
    pointer.style.animationPlayState = 'running';
  }, 1500);
}
reelButton.addEventListener('click', stopFishing);

// キーボードの f で釣りゲーム起動
document.addEventListener('keydown', e => {
  if(e.key === 'f') startFishing();
});

// 犬を水面（水エリア）に
