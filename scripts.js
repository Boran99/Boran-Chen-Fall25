// UI animation helpers for Job Planner
// Provides: window.requestDeleteBoard(boardId)

(function(){
  // Wait until the main app exposes state/saveState/render
  function ready(cb){
    if(window.state && window.saveState && window.render) return cb();
    const to = setInterval(()=>{ if(window.state && window.saveState && window.render){ clearInterval(to); cb(); } },50);
    // give up after a short time to avoid infinite loop
    setTimeout(()=>clearInterval(to),5000);
  }

  ready(()=>{
    window.requestDeleteBoard = function(boardId){
      const sel = '[data-board-id="'+boardId+'"]';
      const el = document.querySelector(sel);
      if(!el){ // fallback: remove immediately
        const idx = state.boards.findIndex(b=>b.id===boardId);
        if(idx>=0){ state.boards.splice(idx,1); saveState(); render(); }
        return;
      }

      // add removing animation class and wait for animation end
      el.classList.add('removing');
      el.addEventListener('animationend', ()=>{
        const idx = state.boards.findIndex(b=>b.id===boardId);
        if(idx>=0){ state.boards.splice(idx,1); saveState(); render(); }
      }, { once: true });

      // as a safety, if animationend doesn't fire, remove after 400ms
      setTimeout(()=>{
        if(document.querySelector(sel)){
          const idx = state.boards.findIndex(b=>b.id===boardId);
          if(idx>=0){ state.boards.splice(idx,1); saveState(); render(); }
        }
      }, 500);
    };

    // Add delegated handler to animate card removal when mark done toggles (if desired)
    document.addEventListener('click', (e)=>{
      const btn = e.target.closest('button.complete');
      if(!btn) return;
      const cardItem = btn.closest('.card-item');
      if(!cardItem) return;
      // simple pulse animation on completion
      cardItem.classList.add('completed-pulse');
      setTimeout(()=>cardItem.classList.remove('completed-pulse'), 700);
    });
  });
})();

// small utility styles added dynamically for completed pulse to avoid editing CSS further
(function(){
  const css = `
  .card-item.completed-pulse{animation:completePulse .5s ease both}
  @keyframes completePulse{0%{transform:scale(1)}50%{transform:scale(1.03)}100%{transform:scale(1)}}
  `;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
})();

// fireworks effect: can pass an element to center the burst, or nothing for center-screen
window.showFireworks = function(targetEl){
  const canvas = document.createElement('canvas');
  canvas.className = 'fireworks-canvas';
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#ff3b30','#ff9500','#ffcc00','#4cd964','#007aff','#5856d6','#a78bfa'];
  function rand(a,b){return Math.random()*(b-a)+a}
  function spawnBurst(x,y,count){
    for(let i=0;i<count;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = rand(1.2,6);
      particles.push({ x, y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed, life:rand(40,100), age:0, color: colors[Math.floor(Math.random()*colors.length)], size: rand(2,4) });
    }
  }

  // choose base position
  let baseX = window.innerWidth/2, baseY = window.innerHeight*0.35;
  if(targetEl && typeof targetEl.getBoundingClientRect === 'function'){
    try{
      const r = targetEl.getBoundingClientRect();
      // if rect is empty (detached element) fall back to center
      if(r && (r.width || r.height || r.left || r.top)){
        baseX = r.left + (r.width || 0)/2;
        baseY = r.top + (r.height || 0)/2;
      }
    }catch(e){ /* ignore and use default center */ }
  }

  // spawn several bursts with more particles
  for(let i=0;i<6;i++){
    setTimeout(()=> spawnBurst(baseX + rand(-80,80), baseY + rand(-60,60), 80), i*150);
  }

  let rafId = null;
  (function step(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // additive blending
    ctx.globalCompositeOperation = 'lighter';
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.vx *= 0.995; p.vy *= 0.995; p.age++;
      const alpha = Math.max(0,1 - p.age/p.life);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
      if(p.age > p.life) particles.splice(i,1);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if(particles.length>0) rafId = requestAnimationFrame(step);
  })();

  setTimeout(()=>{
    if(rafId) cancelAnimationFrame(rafId);
    if(canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }, 3000);
};

// Attach UI test button (if present) to trigger fireworks
try{
  const btn = document.getElementById('fireworkBtn');
  if(btn){ btn.addEventListener('click', ()=>{ try{ window.showFireworks(); }catch(e){ console.error(e); } }); }
}catch(e){/* ignore */}
