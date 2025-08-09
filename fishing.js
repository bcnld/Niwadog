// fishing.js

const fishingUI = document.getElementById('fishing-ui');
const fishingResult = document.getElementById('fishing-result');
const reelButton = document.getElementById('reel-button');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const catchOverlay = document.getElementById('catch-overlay');
const caughtDogImg = document.getElementById('caught-dog-img');
const caughtMessage = document.getElementById('caught-message');

const sfxCatch = document.getElementById('sfx-catch');
const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxWheelStop = document.getElementById('sfx-wheel-stop');
const sfxHit = document.getElementById('sfx-hit');
const sfxMiss = document.getElementById('sfx-miss');

let isFishing = false;
let isSpinning = false;
let selectedDogElement = null;
let dogList = [];
let animationId = null;

let rotation = 0;          
let angularVelocity = 0;   

const segmentAngle = () => (2 * Math.PI) / dogList.length;

// dog.json読み込み＆クリックイベントセット
async function initFishing() {
  try {
    const res = await fetch('dog.json');
    dogList = await res.json();

    attachDogClickEvents();
  } catch (e) {
    console.error('dog.json読み込み失敗:', e);
  }
}

function attachDogClickEvents() {
  const dogs = document.querySelectorAll('#water-area .dog:not(.zukan-dog)');
  dogs.forEach(dog => {
    dog.onclick = () => {
      if (window.isZukanOpen) return; // 図鑑開いてたら釣りしない
      startFishing(dog);
    };
  });
}

function startFishing(dogElement) {
  if (isFishing) return;
  isFishing = true;
  selectedDogElement = dogElement;

  fishingResult.textContent = '';
  fishingUI.style.display = 'block';
  catchOverlay.style.display = 'none';

  rotation = 0;
  angularVelocity = 0;

  stopAllSounds();

  drawRoulette();
}

function drawRoulette() {
  const radius = canvas.width / 2 - 20;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const segAngle = segmentAngle();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < dogList.length; i++) {
    const startAngle = rotation + i * segAngle;
    const endAngle = startAngle + segAngle;

    let color = '#ccc';
    switch(dogList[i].rarity) {
      case 'common': color = '#a0d0a0'; break;
      case 'rare': color = '#4080ff'; break;
      case 'epic': color = '#d070d0'; break;
    }

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    const textAngle = startAngle + segAngle / 2;
    ctx.rotate(textAngle);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'black';
    ctx.font = '16px sans-serif';
    ctx.fillText(dogList[i].name, radius - 10, 6);
    ctx.restore();
  }

  // 針描画（上部中央）
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - radius - 10);
  ctx.lineTo(centerX - 10, centerY - radius + 20);
  ctx.lineTo(centerX + 10, centerY - radius + 20);
  ctx.closePath();
  ctx.fill();
}

function animate() {
  if (!isSpinning) {
    cancelAnimationFrame(animationId);
    return;
  }

  rotation += angularVelocity;
  rotation %= 2 * Math.PI;

  angularVelocity *= 0.97;

  if (angularVelocity < 0.002) {
    isSpinning = false;
    angularVelocity = 0;
    sfxWheelStop.play();
    onRouletteStop();
  } else {
    animationId = requestAnimationFrame(animate);
  }

  drawRoulette();
}

function onRouletteStop() {
  const pointerAngle = (3 * Math.PI / 2 - rotation + 2 * Math.PI) % (2 * Math.PI);
  const hitIndex = Math.floor(pointerAngle / segmentAngle());

  const caughtDog = dogList[hitIndex];

  fishingResult.textContent = `${caughtDog.name}をつかまえた！`;

  showCatchOverlay(caughtDog);
  fishingUI.style.display = 'none';
  isFishing = false;

  registerCaughtDog(caughtDog);

  sfxHit.play();
}

reelButton.addEventListener('click', () => {
  if (!isFishing || isSpinning) return;

  isSpinning = true;
  angularVelocity = 0.3 + Math.random() * 0.3;

  sfxRouletteLoop.currentTime = 0;
  sfxRouletteLoop.play();
  sfxStopClick.play();

  animate();
});

function showCatchOverlay(dog) {
  caughtDogImg.src = dog.image;
  caughtMessage.textContent = `${dog.name}をつかまえた！`;
  catchOverlay.style.display = 'flex';

  sfxRouletteLoop.pause();
  sfxCatch.currentTime = 0;
  sfxCatch.play();
}

document.getElementById('catch-close').addEventListener('click', () => {
  catchOverlay.style.display = 'none';
});

function stopAllSounds() {
  [sfxRouletteLoop, sfxStopClick, sfxWheelStop, sfxHit, sfxMiss, sfxCatch].forEach(sound => {
    if (!sound.paused) {
      sound.pause();
      sound.currentTime = 0;
    }
  });
}

// 図鑑登録などの処理はここに
function registerCaughtDog(dog) {
  console.log(`犬を登録しました: ${dog.name}`);
  // ここで図鑑への登録処理を呼ぶなど
}

window.addEventListener('load', () => {
  initFishing();
});
