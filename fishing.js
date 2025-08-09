const canvas = document.getElementById("roulette-canvas");
const ctx = canvas.getContext("2d");
const reelBtn = document.getElementById("reel-button");
const fishingResult = document.getElementById("fishing-result");

const sfxRouletteLoop = document.getElementById("sfx-roulette-loop");
const sfxStopClick = document.getElementById("sfx-stop-click");
const sfxWheelStop = document.getElementById("sfx-wheel-stop");
const sfxHit = document.getElementById("sfx-hit");
const sfxMiss = document.getElementById("sfx-miss");
const sfxCatch = document.getElementById("sfx-catch");

const radius = canvas.width / 2;
const segments = 6; // ルーレット区間数（例）

// 区間色サンプル
const segmentColors = ["#FF8C00", "#FFD700", "#FFA500", "#FFB347", "#FFC04C", "#FFAA00"];

let angle = 0; // 針の角度（ラジアン）
// ルーレット本体は固定。針が回る。

let spinSpeed = 0;
let spinning = false;
let animationId = null;

let targetDogIndex = null; // クリックした犬の区間インデックス

// 犬要素リスト（画面にいる犬のDOMなど）
const dogs = [...document.querySelectorAll(".dog")];

// クリックされた犬を釣りUI表示して設定
dogs.forEach((dog, index) => {
  dog.addEventListener("click", () => {
    if (spinning) return; // 釣り中は無視

    targetDogIndex = index; // この犬が釣れるターゲット区間

    fishingResult.textContent = "";
    document.getElementById("fishing-ui").style.display = "block";
    reelBtn.disabled = false;
    reelBtn.textContent = "リールを引く";

    angle = 0;
    spinSpeed = 0;
    drawRoulette();
  });
});

function drawRoulette() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = radius;
  const cy = radius;

  // ルーレット本体は固定、描画区間のみ
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

  // 針の描画（回転しながら）
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
  sfxRouletteLoop.pause();
  sfxWheelStop.currentTime = 0;
  sfxWheelStop.play();

  const normalizedAngle = (angle % (2 * Math.PI));
  const segmentSize = 2 * Math.PI / segments;
  // 針は「逆方向の角度」を使うほうが自然
  const correctedAngle = (2 * Math.PI - normalizedAngle + segmentSize / 2) % (2 * Math.PI);
  const hitSegmentIndex = Math.floor(correctedAngle / segmentSize);

  console.log("angle:", angle, "normalizedAngle:", normalizedAngle, "correctedAngle:", correctedAngle, "hitSegmentIndex:", hitSegmentIndex, "targetDogIndex:", targetDogIndex);

  if (hitSegmentIndex === targetDogIndex) {
    fishingResult.textContent = "ヒット！釣れた！";
    sfxHit.currentTime = 0;
    sfxHit.play();
  } else {
    fishingResult.textContent = "はずれ...";
    sfxMiss.currentTime = 0;
    sfxMiss.play();
  }

  dogs[targetDogIndex]?.remove();

  reelBtn.textContent = "リールを引く";
  reelBtn.disabled = false;
}

// リールボタン押下処理
reelBtn.addEventListener("click", () => {
  if (!spinning) {
    spinning = true;
    fishingResult.textContent = "";
    reelBtn.textContent = "止める";

    sfxRouletteLoop.currentTime = 0;
    sfxRouletteLoop.play();

    spinSpeed = 0.3 + Math.random() * 0.2;

    animate();
  } else {
    // 2回目クリックで減速開始
    if (spinSpeed > 0) {
      sfxStopClick.currentTime = 0;
      sfxStopClick.play();
      spinSpeed = 0.01;
      reelBtn.disabled = true;
    }
  }
});

// 初期描画
drawRoulette();
