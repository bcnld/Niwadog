const fishingUI = document.getElementById('fishing-ui');
const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');
const reelBtn = document.getElementById('reel-button');
const fishingResult = document.getElementById('fishing-result');

const radius = canvas.width / 2;
const segments = 6;
const segmentColors = ["#FF8C00", "#FFD700", "#FFA500", "#FFB347", "#FFC04C", "#FFAA00"];

let angle = 0;
let spinSpeed = 0;
let spinning = false;
let animationId = null;

function drawRoulette() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = radius;
  const cy = radius;
  for (let i = 0; i < segments; i++) {
    const startAngle = (i * 2 * Math.PI / segments);
    const endAngle = ((i + 1) * 2 * Math.PI / segments);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius - 20, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = segmentColors[i % segmentColors.length];
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.moveTo(0, -radius + 5);
  ctx.lineTo(-15, -radius + 40);
  ctx.lineTo(15, -radius + 40);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function animate() {
  if (spinSpeed > 0) {
    angle += spinSpeed;
    spinSpeed *= 0.97;
    if (spinSpeed < 0.002) {
      spinSpeed = 0;
      spinning = false;
      cancelAnimationFrame(animationId);
      animationId = null;
      onStop();
      return;
    }
  }
  drawRoulette();
  animationId = requestAnimationFrame(animate);
}

function onStop() {
  const normalizedAngle = (angle % (2 * Math.PI));
  const segmentSize = 2 * Math.PI / segments;
  const correctedAngle = (2 * Math.PI - normalizedAngle + segmentSize / 2) % (2 * Math.PI);
  const hitSegmentIndex = Math.floor(correctedAngle / segmentSize);

  fishingResult.textContent = `ルーレット停止！区間: ${hitSegmentIndex + 1}`;

  reelBtn.textContent = "リールを引く";
  reelBtn.disabled = false;
}

reelBtn.addEventListener("click", () => {
  if (!spinning) {
    spinning = true;
    fishingResult.textContent = "";
    reelBtn.textContent = "止める";
    spinSpeed = 0.3 + Math.random() * 0.2;
    animate();
  } else {
    if (spinSpeed > 0) {
      spinSpeed = 0.01;
      reelBtn.disabled = true;
    }
  }
});

function attachDogClickEvents() {
  const dogs = [...document.querySelectorAll(".dog")];
  dogs.forEach((dog) => {
    dog.onclick = null; // 一旦イベントリセット
    dog.addEventListener("click", () => {
      if (spinning) return;
      fishingResult.textContent = "";
      fishingUI.style.display = "block";
      reelBtn.disabled = false;
      reelBtn.textContent = "リールを引く";
      angle = 0;
      spinSpeed = 0;
      drawRoulette();
    });
  });
}

// 初回呼び出しや犬生成後に必ず呼んでください
attachDogClickEvents();
