const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const sfxRouletteLoop = document.getElementById('sfx-roulette-loop');
sfxRouletteLoop.volume = 0.5;
const sfxStopClick = document.getElementById('sfx-stop-click');
const sfxWheelStop = document.getElementById('sfx-wheel-stop');
sfxWheelStop.volume = 0.3;
const sfxHit = document.getElementById('sfx-hit');
sfxHit.volume = 1.0;
const sfxMiss = document.getElementById('sfx-miss');

let angle = 0, spinSpeed = 0;
let spinning = false, slowingDown = false;
let hitZoneStart = 0, hitZoneEnd = 0;
let animationId = null;

function startRoulette(hitProbability, onHit, onMiss) {
  // hitProbability は0〜1の数字で、当たり範囲の割合（例：0.5で180度）
  hitZoneStart = Math.random() * 2 * Math.PI;
  hitZoneEnd = hitZoneStart + 2 * Math.PI * hitProbability;
  if (hitZoneEnd > 2 * Math.PI) hitZoneEnd -= 2 * Math.PI;

  angle = 0;
  spinSpeed = 0.3;
  spinning = true;
  slowingDown = false;

  sfxRouletteLoop.currentTime = 0;
  sfxRouletteLoop.play();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const center = canvas.width / 2;

    // 背景
    ctx.beginPath();
    ctx.arc(center, center, center - 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#eef';
    ctx.fill();

    // 当たり範囲
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, center - 10, hitZoneStart, hitZoneEnd);
    ctx.fillStyle = '#f00';
    ctx.fill();

    // 針
    const needleLength = center - 20;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + needleLength * Math.cos(angle), center + needleLength * Math.sin(angle));
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.stroke();

    if (spinning) {
      angle += spinSpeed;

      if (slowingDown) {
        spinSpeed -= 0.005;
        if (spinSpeed <= 0) {
          spinSpeed = 0;
          spinning = false;
          slowingDown = false;
          cancelAnimationFrame(animationId);

          sfxRouletteLoop.pause();
          sfxWheelStop.currentTime = 0;
          sfxWheelStop.play();

          const normalized = angle % (2 * Math.PI);
          let hit = false;

          if (hitZoneStart < hitZoneEnd) {
            hit = normalized >= hitZoneStart && normalized <= hitZoneEnd;
          } else {
            hit = normalized >= hitZoneStart || normalized <= hitZoneEnd;
          }

          if (hit) {
            sfxHit.currentTime = 0;
            sfxHit.play();
            if (typeof onHit === 'function') onHit();
          } else {
            sfxMiss.currentTime = 0;
            sfxMiss.play();
            if (typeof onMiss === 'function') onMiss();
          }
          return;
        }
      }

      animationId = requestAnimationFrame(draw);
    }
  }
  draw();
}

function stopRoulette() {
  if (spinning && !slowingDown) {
    slowingDown = true;
    sfxStopClick.currentTime = 0;
    sfxStopClick.play();
  }
}

document.getElementById('reel-button').addEventListener('click', stopRoulette);
