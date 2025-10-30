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
  console.log('🎆 Triggering fireworks', targetEl);
  
  // Create canvas with explicit dimensions
  const canvas = document.createElement('canvas');
  canvas.className = 'fireworks-canvas';
  
  // Force size to match window
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  
  // Explicit styles
  Object.assign(canvas.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: width + 'px',
    height: height + 'px',
    background: 'rgba(0,0,0,0.2)',
    zIndex: '9999',
    pointerEvents: 'none'
  });
  
  document.body.appendChild(canvas);
  console.log('Canvas created:', width, 'x', height);
  
  // Get 2D context with alpha
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }

  const particles = [];
  const colors = [
    '#ff3b30','#ff9500','#ffcc00','#4cd964','#007aff','#5856d6','#a78bfa',
    '#ff2d55','#64d2ff','#5e5ce6', // bright additions
    '#fff' // some pure white for extra pop
  ];
  
  function rand(a,b){
    return Math.random()*(b-a)+a;
  }
  
  function spawnBurst(x,y,count){
    console.log('💥 Spawning burst at', x, y, 'with', count, 'particles');
    
    // Validate coordinates
    if (isNaN(x) || isNaN(y)) {
      console.error('Invalid coordinates:', x, y);
      return;
    }
    
    // Draw debug marker at burst point
    ctx.fillStyle = 'lime';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    const newParticles = [];
    for(let i=0;i<count;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = rand(4,12);
      const color = colors[Math.floor(Math.random()*colors.length)];
      
      const particle = { 
        x: Number(x), 
        y: Number(y), 
        vx: Math.cos(angle)*speed, 
        vy: Math.sin(angle)*speed, 
        life: rand(80,160),
        age: 0, 
        color: color,
        size: rand(6,12),
        startSize: rand(15,25),
        id: Date.now() + i // unique id for debugging
      };
      
      // Validate particle
      if (isNaN(particle.x) || isNaN(particle.y)) {
        console.error('Invalid particle position:', particle);
        continue;
      }
      
      newParticles.push(particle);
      
      // Draw immediate feedback
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add all valid particles at once
    particles.push(...newParticles);
    console.log(`✅ Added ${newParticles.length} particles. Total: ${particles.length}`);
    
    // Draw text showing particle count at burst point
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText(`+${newParticles.length}`, x + 15, y);
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

  // Initialize animation
  let rafId = null;
  let frameCount = 0;
  console.log('🎮 Starting animation loop');

  // Spawn bursts
  for(let i=0;i<6;i++){
    const burstX = baseX + rand(-80,80);
    const burstY = baseY + rand(-60,60);
    console.log(`🚀 Scheduling burst ${i+1}/6 at (${burstX.toFixed(0)}, ${burstY.toFixed(0)})`);
    setTimeout(() => {
      console.log(`💫 Executing burst ${i+1} - Current particles: ${particles.length}`);
      spawnBurst(burstX, burstY, 80);
      console.log(`💫 After burst ${i+1} - Particles: ${particles.length}`);
    }, i*150);
  }

  // Animation function
  function animate() {
    frameCount++;
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    
    // Semi-transparent black for trails
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw debug info with drop shadow
    ctx.save();
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px monospace';
    const info = `Frame: ${frameCount} | Particles: ${particles.length}`;
    ctx.fillText(info, 20, 40);
    ctx.restore();
    
    // Draw debug grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    for(let x = 0; x < canvas.width; x += 100) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for(let y = 0; y < canvas.height; y += 100) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
    
    // Switch to additive blending for particles
    ctx.globalCompositeOperation = 'lighter';
    
    // Draw particles
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      
      // Update physics
      p.x += p.vx; 
      p.y += p.vy; 
      p.vy += 0.15; // stronger gravity
      p.vx *= 0.99; 
      p.vy *= 0.99; 
      p.age++;
      
      // Entrance effect - start big and shrink
      const sizeScale = p.age < 10 ? 
        (10 - p.age) / 10 * p.startSize + p.size :
        p.size;
      
      // Fade out with strong initial presence
      const alpha = p.age < 20 ? 1 : Math.max(0, 1.2 - p.age/p.life);
      ctx.globalAlpha = alpha;
      
      // Draw large glow
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, sizeScale * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw medium white glow
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(p.x, p.y, sizeScale * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw small bright core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, sizeScale * 0.8, 0, Math.PI * 2);
      ctx.fill();
      
      if(p.age > p.life) particles.splice(i,1);
    }
    
    // Reset blending
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    
    // Continue animation if we have particles
    if(particles.length > 0) {
      rafId = requestAnimationFrame(animate);
    }
  }

  // Start animation
  rafId = requestAnimationFrame(animate);

  // Cleanup after animation
  setTimeout(() => {
    if(rafId) cancelAnimationFrame(rafId);
    if(canvas.parentNode) canvas.parentNode.removeChild(canvas);
    console.log('✨ Fireworks finished');
  }, 4000);
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