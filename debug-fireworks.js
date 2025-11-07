//Debug version of fireworks
window.showFireworks = function(targetEl) {
  console.log('🎆 Starting debug fireworks');
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'fireworks-canvas';
  
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  
  Object.assign(canvas.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: width + 'px',
    height: height + 'px',
    background: 'rgba(0,0,0,0.3)',
    zIndex: '9999',
    pointerEvents: 'none'
  });
  
  document.body.appendChild(canvas);
  console.log('Canvas created:', width, 'x', height);
  
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    console.error('No canvas context!');
    return;
  }
  
  // Test drawing
  ctx.fillStyle = 'yellow';
  ctx.fillRect(0, 0, 100, 100);
  console.log('Drew test rectangle');
  
  // Particle system
  const particles = [];
  
  function createParticle(x, y) {
    return {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      color: '#ff0000',
      size: 20,
      age: 0,
      life: 100
    };
  }
  
  // Create test particles
  console.log('Creating test particles');
  for(let i = 0; i < 10; i++) {
    particles.push(createParticle(width/2, height/2));
  }
  console.log('Created particles:', particles.length);
  
  // Animation
  let frame = 0;
  function animate() {
    frame++;
    console.log(`Frame ${frame}, Particles: ${particles.length}`);
    
    // Clear
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw debug border
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, width, height);
    
    // Update and draw particles
    for(let i = particles.length-1; i >= 0; i--) {
      const p = particles[i];
      
      // Update
      p.x += p.vx;
      p.y += p.vy;
      p.age++;
      
      // Draw
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Remove old particles
      if(p.age > p.life) {
        particles.splice(i, 1);
        console.log('Removed particle', i);
      }
    }
    
    // Debug info
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(`Frame: ${frame} | Particles: ${particles.length}`, 20, 40);
    
    // Continue if we have particles
    if(particles.length > 0 || frame < 100) { // run for at least 100 frames
      requestAnimationFrame(animate);
    } else {
      console.log('Animation complete');
      setTimeout(() => {
        canvas.remove();
      }, 1000);
    }
  }
  
  // Start animation
  requestAnimationFrame(animate);
};