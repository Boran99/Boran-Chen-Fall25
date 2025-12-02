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

// fireworks effect via CSS animations (no canvas)
window.showFireworks = function(targetEl){
  // Ensure overlay exists
  let overlay = document.querySelector('.fw-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.className = 'fw-overlay';
    overlay.setAttribute('aria-hidden','true');
    document.body.appendChild(overlay);
  }

  const colors = ['#ff3b30','#ff9500','#ffcc00','#4cd964','#007aff','#5856d6','#a78bfa','#ff2d55','#64d2ff','#5e5ce6','#ffffff'];
  const rand = (a,b)=> Math.random()*(b-a)+a;

  // compute base position
  let x = window.innerWidth/2;
  let y = window.innerHeight*0.35;
  if(targetEl && typeof targetEl.getBoundingClientRect === 'function'){
    try{
      const r = targetEl.getBoundingClientRect();
      if(r){ x = r.left + (r.width||0)/2; y = r.top + (r.height||0)/2; }
    }catch(_e){}
  }

  // create a burst group
  const burst = document.createElement('div');
  burst.className = 'fw-burst';
  burst.style.left = x + 'px';
  burst.style.top = y + 'px';

  const count = 28;
  for(let i=0;i<count;i++){
    const spark = document.createElement('span');
    spark.className = 'fw-spark';
    const angle = (360/count)*i + rand(-6,6);
    const dist = rand(90,150);
    const size = rand(4,7);
    const delay = rand(0,100); // ms
    const c = colors[Math.floor(Math.random()*colors.length)];
    spark.style.setProperty('--ang', angle+'deg');
    spark.style.setProperty('--dist', dist+'px');
    spark.style.setProperty('--c', c);
    spark.style.width = size+'px';
    spark.style.height = size+'px';
    spark.style.marginLeft = (-size/2)+'px';
    spark.style.marginTop = (-size/2)+'px';
    spark.style.animationDelay = delay+'ms';
    burst.appendChild(spark);
  }

  overlay.appendChild(burst);

  // cleanup after animation
  const totalMs = 1000; // keep in sync with CSS
  setTimeout(()=>{
    if(burst.parentNode) burst.parentNode.removeChild(burst);
    if(overlay && overlay.children.length===0){ overlay.remove(); }
  }, totalMs + 200);
};

// Multi-burst finale: schedules several bursts around the base point plus a flash
window.showFireworksFinale = function(targetEl){
  // ensure overlay exists
  let overlay = document.querySelector('.fw-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.className = 'fw-overlay';
    overlay.setAttribute('aria-hidden','true');
    document.body.appendChild(overlay);
  }

  const colors = ['#ff3b30','#ff9500','#ffcc00','#4cd964','#007aff','#5856d6','#a78bfa','#ff2d55','#64d2ff','#5e5ce6','#ffffff'];
  const rand = (a,b)=> Math.random()*(b-a)+a;

  // base position
  let x = window.innerWidth/2;
  let y = window.innerHeight*0.35;
  if(targetEl && typeof targetEl.getBoundingClientRect === 'function'){
    try{
      const r = targetEl.getBoundingClientRect();
      if(r){ x = r.left + (r.width||0)/2; y = r.top + (r.height||0)/2; }
    }catch(_e){}
  }

  // helper to create one burst
  function burstAt(px, py, opts={}){
    const count = opts.count ?? 28;
    const distMin = opts.distMin ?? 100;
    const distMax = opts.distMax ?? 160;
    const jitter = opts.jitter ?? 6;
    const delayMax = opts.delayMax ?? 120; // ms
    const sizeMin = opts.sizeMin ?? 4;
    const sizeMax = opts.sizeMax ?? 8;

    const burst = document.createElement('div');
    burst.className = 'fw-burst';
    burst.style.left = px + 'px';
    burst.style.top = py + 'px';

    for(let i=0;i<count;i++){
      const spark = document.createElement('span');
      spark.className = 'fw-spark';
      const angle = (360/count)*i + rand(-jitter,jitter);
      const dist = rand(distMin, distMax);
      const size = rand(sizeMin,sizeMax);
      const delay = rand(0,delayMax);
      const c = colors[Math.floor(Math.random()*colors.length)];
      spark.style.setProperty('--ang', angle+'deg');
      spark.style.setProperty('--dist', dist+'px');
      spark.style.setProperty('--c', c);
      spark.style.width = size+'px';
      spark.style.height = size+'px';
      spark.style.marginLeft = (-size/2)+'px';
      spark.style.marginTop = (-size/2)+'px';
      spark.style.animationDelay = delay+'ms';
      burst.appendChild(spark);
    }

    overlay.appendChild(burst);
    // cleanup single burst after its animation
    setTimeout(()=>{
      if(burst.parentNode) burst.parentNode.removeChild(burst);
      if(overlay && overlay.children.length===0){ overlay.remove(); }
    }, 1100);
  }

  // ring of bursts around base
  const ringCount = 6;
  const ringRadius = 140;
  for(let i=0;i<ringCount;i++){
    const a = (Math.PI*2/ringCount)*i;
    const bx = x + Math.cos(a)*ringRadius + rand(-12,12);
    const by = y + Math.sin(a)*ringRadius + rand(-12,12);
    setTimeout(()=> burstAt(bx, by, {count: 24, distMin: 90, distMax: 140}), i*120);
  }

  // clustered mid bursts near base
  for(let i=0;i<6;i++){
    setTimeout(()=>{
      burstAt(x + rand(-80,80), y + rand(-60,60), {count: 28, distMin: 100, distMax: 160});
    }, 800 + i*90);
  }

  // big center finale salvo
  const finaleTimes = [1400, 1540, 1680];
  finaleTimes.forEach((t, idx)=>{
    setTimeout(()=>{
      burstAt(x, y, {count: idx===finaleTimes.length-1 ? 60 : 46, distMin: 130, distMax: 190, sizeMin: 5, sizeMax: 9, delayMax: 80});
    }, t);
  });

  // flash effect near climax
  setTimeout(()=>{
    const flash = document.createElement('div');
    flash.className = 'fw-flash';
    overlay.appendChild(flash);
    setTimeout(()=>{ if(flash.parentNode) flash.parentNode.removeChild(flash); if(overlay.children.length===0) overlay.remove(); }, 560);
  }, 1500);
};

// Attach UI test button (if present) to trigger fireworks
try {
  const btn = document.getElementById('fireworkBtn');
  if(btn) {
    btn.addEventListener('click', () => {
      try {
        window.showFireworks();
      } catch(e) {
        console.error(e);
      }
    });
  }
} catch(e) {
  /* ignore */
}