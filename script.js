const startBtn = document.getElementById('startFishing');
const rouletteDiv = document.getElementById('roulette');
const stopBtn = document.getElementById('stopBtn');
const resultDiv = document.getElementById('result');
const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');

const bgm = document.getElementById('bgm');
const soundStart = document.getElementById('soundStart');
const soundStop = document.getElementById('soundStop');
const soundSuccess = document.getElementById('soundSuccess');
const soundFail = document.getElementById('soundFail');

let spinning = false;
let angle = 0;
let spinSpeed = 0;
let animationFrameId;

// ルーレットの成功ゾーン（角度で指定）
const successZone = { start: Math.PI / 3, end: Math.PI / 2 }; // 60度～90度の範囲が成功

function drawRoulette() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 140;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景円
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ddd';
  ctx.fill();

  // 成功ゾーン
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, successZone.start, successZone.end);
  ctx.closePath();
  ctx.fillStyle = '#4CAF50';
  ctx.fill();

  // ルーレットの回転部分（矢印）
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  ctx.fillStyle = '#f44336';
  ctx.beginPath();
  ctx.moveTo(0, -radius);
  ctx.lineTo(15, -radius + 30);
  ctx.lineTo(-15, -radius + 30);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 外枠
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 5;
  ctx.stroke();
}

function spin() {
  angle += spinSpeed;
  angle %= Math.PI * 2;

  // 減速処理
  spinSpeed *= 0.98;

  if (spinSpeed < 0.002) {
    spinSpeed = 0;
    spinning = false;
    checkResult();
  }

  drawRoulette();
  if (spinning) {
    animationFrameId = requestAnimationFrame(spin);
  }
}

function checkResult() {
  let arrowAngle = (2 * Math.PI - angle) % (2 * Math.PI);

  if (arrowAngle >= successZone.start && arrowAngle <= successZone.end) {
    resultDiv.textContent = '成功！さかなが釣れた！🎣';
    soundSuccess.currentTime = 0;
    soundSuccess.play();
  } else {
    resultDiv.textContent = '失敗！さかなが逃げた...';
    soundFail.currentTime = 0;
    soundFail.play();
  }

  startBtn.disabled = false;
  rouletteDiv.classList.add('hidden');
}

startBtn.addEventListener('click', () => {
  resultDiv.textContent = '';
  startBtn.disabled = true;
  rouletteDiv.classList.remove('hidden');

  // BGM再生（初回ユーザー操作後に）
  if (bgm.paused) {
    bgm.volume = 0.3;
    bgm.play().catch(() => {
      // 自動再生制限対応、再生失敗時は何もしない
    });
  }

  soundStart.currentTime = 0;
  soundStart.play();

  angle = 0;
  spinSpeed = 0.3 + Math.random() * 0.2;
  spinning = true;
  spin();
});

stopBtn.addEventListener('click', () => {
  if (!spinning) return;
  spinning = false;

  soundStop.currentTime = 0;
  soundStop.play();
});
