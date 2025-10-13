// Tilt Balance - script.js
// Works on mobile (DeviceOrientation) and desktop (pointer drag)
// Features: physics, wind gusts, vibration, share, export PNG, PWA-ready

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const enableMotionBtn = document.getElementById('enableMotionBtn');
const timeEl = document.getElementById('time');
const bestEl = document.getElementById('best');
const shareBtn = document.getElementById('shareBtn');
const exportBtn = document.getElementById('exportBtn');
const resetBestBtn = document.getElementById('resetBestBtn');
const overlay = document.getElementById('overlay');

const W = canvas.width;
const H = canvas.height;
const CX = W/2;
const CY = H/2;
const RADIUS = Math.min(W,H)/2 - 18; // platform radius

// Ball state
let ball = { x: CX, y: CY, r: 12, vx:0, vy:0 };
let ax = 0, ay = 0;
let playing = false, startedAt = null, elapsed = 0, best = 0;
let gustTimer = 0, showGust = false, gust = {x:0,y:0};
let useMotion = false;

// load best from storage
best = parseFloat(localStorage.getItem('tilt_best')) || 0;
bestEl.textContent = best.toFixed(1);

// ---- Motion handlers ----
function handleOrientation(e){
  // e.gamma: left-right tilt [-90..90], e.beta: front-back tilt [-180..180]
  // normalize to small accelerations
  ax = (e.gamma || 0) / 18; // left-right
  ay = (e.beta || 0) / 18;   // front-back
  
  // Prevent default to avoid scrolling
  e.preventDefault();
}
async function requestMotionPermission(){
  // iOS requires permission via user gesture
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const resp = await DeviceMotionEvent.requestPermission();
      if (resp === 'granted') {
        window.addEventListener('deviceorientation', handleOrientation, { passive: false });
        useMotion = true;
        enableMotionBtn.style.display = 'none';
        flashMessage('Motion enabled! Tilt your device to play.');
      } else {
        flashMessage('Motion permission denied. Use touch controls instead.');
      }
    } catch (err) {
      console.warn('motion permission denied', err);
      flashMessage('Motion permission failed. Use touch controls instead.');
    }
  } else {
    // Non-iOS or already allowed
    window.addEventListener('deviceorientation', handleOrientation, { passive: false });
    useMotion = true;
    enableMotionBtn.style.display = 'none';
    flashMessage('Motion enabled! Tilt your device to play.');
  }
}
/////////////
document.getElementById("enableMotionBtn").addEventListener("click", requestMotionPermission);
////////

// touch/drag controls for mobile and desktop
let dragging = false;
let touchId = null;

// Touch events for mobile
canvas.addEventListener('touchstart', (ev)=>{
  ev.preventDefault();
  if (ev.touches.length === 1) {
    dragging = true;
    touchId = ev.touches[0].identifier;
    const rect = canvas.getBoundingClientRect();
    const touch = ev.touches[0];
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    ax = (x - ball.x) / 120;
    ay = (y - ball.y) / 120;
  }
}, { passive: false });

canvas.addEventListener('touchmove', (ev)=>{
  ev.preventDefault();
  if (dragging && ev.touches.length === 1 && touchId === ev.touches[0].identifier) {
    const rect = canvas.getBoundingClientRect();
    const touch = ev.touches[0];
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    ax = (x - ball.x) / 120;
    ay = (y - ball.y) / 120;
  }
}, { passive: false });

canvas.addEventListener('touchend', (ev)=>{
  ev.preventDefault();
  dragging = false;
  touchId = null;
  if (!useMotion) ax = ay = 0;
}, { passive: false });

// Mouse/pointer events for desktop
canvas.addEventListener('pointerdown', (ev)=>{
  if (ev.pointerType === 'mouse') {
    dragging = true;
    canvas.setPointerCapture(ev.pointerId);
  }
});

canvas.addEventListener('pointermove', (ev)=>{
  if (dragging && ev.pointerType === 'mouse' && !useMotion) {
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (canvas.width / rect.width);
    const y = (ev.clientY - rect.top) * (canvas.height / rect.height);
    ax = (x - ball.x) / 120;
    ay = (y - ball.y) / 120;
  }
});

canvas.addEventListener('pointerup', (ev)=>{
  if (ev.pointerType === 'mouse') {
    dragging = false;
    if (!useMotion) ax = ay = 0;
  }
});

// Game control
startBtn.addEventListener('click', ()=>{
  if (!playing) startGame();
});
enableMotionBtn.addEventListener('click', requestMotionPermission);

// share/export/reset
shareBtn.addEventListener('click', shareScore);
exportBtn.addEventListener('click', exportImage);
resetBestBtn.addEventListener('click', ()=>{
  if (confirm('Reset best score?')) {
    localStorage.removeItem('tilt_best');
    best = 0; bestEl.textContent = '0.0';
  }
});

// start/reset
function startGame(){
  ball.x = CX; ball.y = CY; ball.vx = 0; ball.vy = 0;
  ax = ay = 0; playing = true; startedAt = performance.now(); elapsed = 0;
  overlay.style.display = 'none';
  gustTimer = 0; showGust = false;
  requestAnimationFrame(loop);
}

// physics & loop
function loop(t){
  if (!playing) return;
  const now = performance.now();
  elapsed = (now - startedAt) / 1000;
  timeEl.textContent = elapsed.toFixed(1);

  // gust logic
  gustTimer -= 1/60;
  if (gustTimer <= 0) {
    if (Math.random() < 0.3) {
      // start a gust
      showGust = true;
      gust.x = (Math.random()-0.5) * 0.8;
      gust.y = (Math.random()-0.5) * 0.8;
      gustTimer = 1.4 + Math.random()*2.2;
    } else {
      showGust = false;
      gustTimer = 1.5 + Math.random()*2.5;
    }
  }

  // apply accelerations
  let totalAx = ax + (showGust ? gust.x : 0);
  let totalAy = ay + (showGust ? gust.y : 0);

  ball.vx += totalAx;
  ball.vy += totalAy;

  // damping / friction
  ball.vx *= 0.985;
  ball.vy *= 0.985;

  // limit speed
  const max = 12;
  ball.vx = Math.max(-max, Math.min(max, ball.vx));
  ball.vy = Math.max(-max, Math.min(max, ball.vy));

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Check edge
  const dx = ball.x - CX, dy = ball.y - CY;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist + ball.r > RADIUS) {
    // edge touched -> game over
    playing = false;
    onGameOver(elapsed);
    return;
  }

  // near edge vibration
  if (navigator.vibrate && dist + ball.r > RADIUS * 0.75) {
    // short pulse but not constantly
    navigator.vibrate(40);
  }

  draw(dist);
  requestAnimationFrame(loop);
}

function onGameOver(seconds){
  overlay.style.display = 'flex';
  overlay.querySelector('#startBtn').textContent = 'Restart';
  const prevBest = best;
  if (seconds > best) {
    best = seconds;
    localStorage.setItem('tilt_best', best);
    bestEl.textContent = best.toFixed(1);
    // celebration
    flashMessage(`New Best! ${seconds.toFixed(1)}s`);
  } else {
    flashMessage(`You lasted ${seconds.toFixed(1)}s`);
  }
  // ensure timer shows final value
  timeEl.textContent = seconds.toFixed(1);
}

function flashMessage(msg){
  // create small toast
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position = 'fixed';
  t.style.left = '50%';
  t.style.transform = 'translateX(-50%)';
  t.style.bottom = '30px';
  t.style.background = 'rgba(0,0,0,0.6)';
  t.style.color = '#fff';
  t.style.padding = '10px 14px';
  t.style.borderRadius = '10px';
  t.style.zIndex = 9999;
  document.body.appendChild(t);
  setTimeout(()=> t.style.opacity = '0', 1700);
  setTimeout(()=> t.remove(), 2100);
}

// drawing
function draw(dist){
  ctx.clearRect(0,0,W,H);

  // background glow
  const g = ctx.createRadialGradient(CX - 60, CY - 60, 0, CX, CY, RADIUS*1.2);
  g.addColorStop(0, 'rgba(255,64,129,0.06)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // platform
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, RADIUS, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#223344';
  ctx.stroke();
  ctx.restore();

  // dashed safe ring
  ctx.beginPath();
  ctx.setLineDash([6,8]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.arc(CX, CY, RADIUS*0.92, 0, Math.PI*2);
  ctx.stroke();
  ctx.setLineDash([]);

  // gust visual
  if (showGust) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#7cc3ff';
    ctx.beginPath();
    ctx.ellipse(CX + gust.x*120, CY + gust.y*120, 120, 40, (gust.x>0?0.2:-0.2), 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // ball shadow
  ctx.beginPath();
  ctx.ellipse(ball.x + 6, ball.y + 12, ball.r*1.2, ball.r*0.6, 0, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fill();

  // ball
  const ballGradient = ctx.createLinearGradient(ball.x - 10, ball.y - 10, ball.x + 20, ball.y + 20);
  ballGradient.addColorStop(0, '#ff84aa');
  ballGradient.addColorStop(1, '#ff2a6a');

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fillStyle = ballGradient;
  ctx.fill();

  // small shine
  ctx.beginPath();
  ctx.arc(ball.x - 4, ball.y - 5, ball.r*0.36, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fill();
}

// share via Web Share API if available
async function shareScore(){
  const scoreText = `I lasted ${timeEl.textContent}s on Tilt Balance! Can you beat me?`;
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Tilt Balance', text: scoreText, url: location.href });
    } catch (err) {
      console.warn('share failed', err);
    }
  } else {
    // fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(scoreText + ' ' + location.href);
      flashMessage('Score copied to clipboard');
    } catch {
      flashMessage('Share not supported here');
    }
  }
}

// export PNG of canvas + overlay score
function exportImage(){
  // draw a score overlay on a temp canvas
  const tmp = document.createElement('canvas');
  tmp.width = W;
  tmp.height = H + 80;
  const tctx = tmp.getContext('2d');

  // draw background
  tctx.fillStyle = '#0b1220';
  tctx.fillRect(0,0,tmp.width,tmp.height);

  // draw current game canvas into it
  tctx.drawImage(canvas, 0, 40, W, H);

  // header text
  tctx.fillStyle = '#fff';
  tctx.font = '18px sans-serif';
  tctx.fillText(`I lasted ${timeEl.textContent}s`, 12, 24);
  tctx.font = '12px sans-serif';
  tctx.fillStyle = '#bfcddf';
  tctx.fillText(`Best: ${best.toFixed(1)}s`, 12, tmp.height - 12);

  const data = tmp.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = data;
  a.download = `tilt_${timeEl.textContent}s.png`;
  a.click();
}

// keyboard: also allow arrow keys (desktop testing)
window.addEventListener('keydown', (e)=>{
  if (!playing) return;
  if (e.key === 'ArrowLeft') ax = -0.8;
  if (e.key === 'ArrowRight') ax = 0.8;
  if (e.key === 'ArrowUp') ay = -0.8;
  if (e.key === 'ArrowDown') ay = 0.8;
});
window.addEventListener('keyup', (e)=>{ ax=0; ay=0; });

// initial UI state
function showOverlay(){
  overlay.style.display = 'flex';
  startBtn.textContent = 'Start';
}
showOverlay();

// Mobile optimization and initialization
document.addEventListener('DOMContentLoaded', function() {
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Add mobile-specific optimizations
    document.body.classList.add('mobile');
    
    // Prevent context menu on long press
    document.addEventListener('contextmenu', e => e.preventDefault());
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        // Redraw canvas after orientation change
        if (playing) {
          draw(Math.sqrt((ball.x - CX) ** 2 + (ball.y - CY) ** 2));
        }
      }, 100);
    });
  }
  
  // Hide enable motion button on non-iOS devices
  if (!('requestPermission' in (DeviceMotionEvent || {}))) {
    enableMotionBtn.style.display = 'none';
  }
});

// Prevent default touch behaviors that could interfere with the game
document.addEventListener('touchstart', function(e) {
  if (e.target === canvas || e.target.closest('#canvasWrap')) {
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchend', function(e) {
  if (e.target === canvas || e.target.closest('#canvasWrap')) {
    e.preventDefault();
  }
}, { passive: false });
