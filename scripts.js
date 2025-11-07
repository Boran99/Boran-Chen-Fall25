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