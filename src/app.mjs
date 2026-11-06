import { step, circularSpeed } from './core.mjs';
const $ = id => document.getElementById(id);
const canvas = $('space');
const ctx = canvas.getContext('2d');
const colors = ['#ffad72','#a6dbff','#c5b1ff','#86e6c4','#f8dc81'];
let bodies = [];
let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
let drag = null;
let pointer = null;
let last = 0;
let accumulator = 0;
function add(x, y, vx, vy) {
  if (bodies.length >= 12) { $('status').textContent = 'Twelve planets is plenty. Reset to start fresh.'; return; }
  if (Math.hypot(x,y) < 18) { $('status').textContent = 'Start outside the star.'; return; }
  bodies.push({ x, y, vx, vy, color: colors[bodies.length % colors.length], trail: [] });
  $('status').textContent = 'Planet launched.';
  update();
}
function update() { $('count').textContent = `${bodies.length} planet${bodies.length === 1 ? '' : 's'}`; $('pause').textContent = paused ? 'Resume' : 'Pause'; }
function reset() { bodies = []; add(140,0,0,circularSpeed(140)); $('status').textContent = paused ? 'Paused. Press Resume when ready.' : 'A quiet orbit to start with.'; }
function point(event) { const r = canvas.getBoundingClientRect(); return { x: (event.clientX-r.left)*760/r.width-380, y: (event.clientY-r.top)*490/r.height-245 }; }
canvas.addEventListener('pointerdown', event => { if (event.button !== 0) return; drag = point(event); pointer = drag; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener('pointermove', event => { if (drag) pointer = point(event); });
canvas.addEventListener('pointerup', event => { if (!drag) return; const end = point(event); add(drag.x,drag.y,(end.x-drag.x)*.23,(end.y-drag.y)*.23); drag = pointer = null; });
canvas.addEventListener('pointercancel', () => { drag = pointer = null; });
$('pause').addEventListener('click', () => { paused = !paused; accumulator = 0; update(); });
$('reset').addEventListener('click', reset);
$('gravity').addEventListener('input', () => { $('gravity-value').textContent = `${$('gravity').value}%`; });
$('speed').addEventListener('input', () => { $('speed-value').textContent = `${$('speed').value}×`; });
$('launch').addEventListener('click', () => { const angle = Math.random()*Math.PI*2; const r = 65 + Math.random()*110; const v = circularSpeed(r, Number($('gravity').value)/100); add(Math.cos(angle)*r,Math.sin(angle)*r,-Math.sin(angle)*v,Math.cos(angle)*v); });
function draw() {
  ctx.fillStyle = '#11151b'; ctx.fillRect(0,0,760,490);
  ctx.save(); ctx.translate(380,245);
  ctx.strokeStyle = '#ffffff09'; ctx.lineWidth = 1;
  for (const r of [60,120,180,240]) { ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke(); }
  ctx.fillStyle = '#ffffff33';
  for (let i=0;i<65;i++) ctx.fillRect(((i*137)%746)-373,((i*89)%478)-239,1.5,1.5);
  const glow = ctx.createRadialGradient(0,0,2,0,0,45); glow.addColorStop(0,'#ffc56fcc'); glow.addColorStop(1,'#ffc56f00');
  ctx.fillStyle = glow; ctx.fillRect(-45,-45,90,90);
  ctx.fillStyle = '#ffd18c'; ctx.beginPath(); ctx.arc(0,0,11,0,Math.PI*2); ctx.fill();
  for (const body of bodies) {
    ctx.strokeStyle = `${body.color}75`; ctx.lineWidth = 1.2; ctx.beginPath();
    body.trail.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.stroke();
    ctx.fillStyle = body.color; ctx.beginPath(); ctx.arc(body.x,body.y,4,0,Math.PI*2); ctx.fill();
  }
  if (drag && pointer) { ctx.strokeStyle = '#f2f2ec'; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.moveTo(drag.x,drag.y); ctx.lineTo(pointer.x,pointer.y); ctx.stroke(); ctx.setLineDash([]); }
  ctx.restore();
}
function frame(now) {
  const elapsed = last ? Math.min((now-last)/1000,.05) : 0; last = now;
  if (!paused && !document.hidden) {
    accumulator += elapsed * Number($('speed').value);
    while (accumulator >= 1/120) {
      bodies = bodies.map(body => { const next = step(body,1/120,Number($('gravity').value)/100); next.trail.push({x:next.x,y:next.y}); if (next.trail.length>900) next.trail.shift(); return next; }).filter(body => Math.hypot(body.x,body.y)>13 && Math.hypot(body.x,body.y)<1600);
      accumulator -= 1/120;
    }
  }
  $('count').textContent = `${bodies.length} planet${bodies.length === 1 ? '' : 's'}`;
  draw(); requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { last = 0; accumulator = 0; });
reset(); requestAnimationFrame(frame);
