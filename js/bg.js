(function cosmicBackground(){
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { return; }

  // ===== Config knobs (mutable; can be changed at runtime) =====
  let CONFIG = {
    STAR_DENSITY_DIV: 12000, // lower = more stars
    GALAXY_ARM_MULT: 1.8,    // >1 increases arm particle count
    ARM_CORE_BOOST: 1.35,    // brightness boost near core
    ARM_TRAIL_LEN: 0.55,     // 0..1 fraction influences trail length
    DUST_GLOW: true,         // soft radial glow puffs along arms
    STREAKS: true,           // faint motion streaks along arms
    CORE_GLOW: true,         // bright additive nucleus
    DUST_EVERY: 3,           // render dust for every Nth arm particle (perf)
    MAX_DPR: 2
  };

  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  let DPR = Math.min(CONFIG.MAX_DPR, devicePixelRatio||1);
  function setCanvasSize(){
    DPR = Math.min(CONFIG.MAX_DPR, devicePixelRatio||1);
    canvas.width = w * DPR; canvas.height = h * DPR; canvas.style.width = w+'px'; canvas.style.height = h+'px';
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(DPR,DPR);
  }
  setCanvasSize();

  const center = {x:w/2, y:h/2};

  // ===== Sim state =====
  let STAR_COUNT, stars = [];
  const ARM_COUNT = 3; // number of spiral arms
  let P_COUNT, particles = [];

  function buildScene(){
    STAR_COUNT = Math.min(320, Math.floor((w*h)/CONFIG.STAR_DENSITY_DIV));
    stars = Array.from({length:STAR_COUNT},()=>({
      x:Math.random()*w,
      y:Math.random()*h,
      z:Math.random()*0.8+0.2,
      tw:500+Math.random()*2000,
      phase: Math.random()*Math.PI*2,
      flick: 0.05 + Math.random()*0.10
    }));
    const BASE_P = 280;
    P_COUNT = Math.floor(BASE_P * CONFIG.GALAXY_ARM_MULT);
    particles = Array.from({length:P_COUNT}, (_,i)=>{
      const arm = i % ARM_COUNT;
      const baseR = 40 + Math.random()*Math.min(w,h)*0.48;
      const a = (i/P_COUNT)*Math.PI*4 + arm*(Math.PI*2/ARM_COUNT);
      return {
        arm,
        r: baseR,
        a,
        sp: 0.00045 + Math.random()*0.0007,
        wob: 0.2 + Math.random()*0.8,
        size: 1 + Math.random()*1.5,
        hue: 225 + Math.random()*20,
        sat: 60 + Math.random()*20,
        light: 70 + Math.random()*15,
        px: 0, py: 0
      };
    });
  }
  buildScene();

  let mx=center.x,my=center.y;
  function onMove(e){ const p=e.touches?.[0]||e; mx=p.clientX; my=p.clientY; }
  addEventListener('pointermove',onMove,{passive:true});
  addEventListener('touchmove',onMove,{passive:true});
  addEventListener('resize',()=>{
    w=innerWidth; h=innerHeight;
    setCanvasSize();
    center.x=w/2; center.y=h/2;
    buildScene();
  });

  // ===== Expose runtime config API =====
  function applyConfig(newCfg){
    CONFIG = { ...CONFIG, ...newCfg };
    setCanvasSize();
    buildScene();
  }
  window.cosmicBg = { applyConfig, get config(){ return { ...CONFIG }; } };
  // Listen for global preset change events
  window.addEventListener('cosmic:preset-changed', (e)=>{
    if (e && e.detail) applyConfig(e.detail);
  });

  // ===== Helpers =====
  function hsla(h,s,l,a){ return `hsla(${h} ${s}% ${l}% / ${a})`; }

  let t0=performance.now();
  function tick(t){
    const dt=t-t0; t0=t;
    ctx.clearRect(0,0,w,h);

    // backdrop gradient
    const bg=ctx.createRadialGradient(center.x,center.y,10,center.x,center.y,Math.max(w,h));
    bg.addColorStop(0,'#0b0b1a'); bg.addColorStop(1,'#03030a');
    ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);

    // gentle nebulas (lighter blend)
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<3;i++){
      const px=center.x+Math.cos((t*0.00018)+i)*(w*0.15+i*20);
      const py=center.y+Math.sin((t*0.00022)+i)*(h*0.12+i*30);
      const r=Math.max(w,h)*(0.15+i*0.05);
      const neb=ctx.createRadialGradient(px,py,0,px,py,r);
      neb.addColorStop(0,'rgba(99,102,241,0.08)'); neb.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=neb; ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();
    }

    // ===== Stars with flicker + cursor sparkle =====
    ctx.globalCompositeOperation='source-over';
    for(let i=0;i<stars.length;i++){
      const s=stars[i];
      const px=(mx-center.x)*0.001*(s.z-0.5);
      const py=(my-center.y)*0.001*(s.z-0.5);
      const x=s.x - px*w; const y=s.y - py*h;
      const tw=0.6+0.4*Math.sin((t+i*71)/s.tw);
      const flick = 1 + s.flick*Math.sin(t*0.004 + s.phase) + 0.02*Math.sin(t*0.013 + s.phase*3);
      const d = Math.hypot(x-mx,y-my);
      const sparkle = Math.max(0, 1 - d/220) * 0.12;
      let alpha = (0.45+0.55*s.z) * tw * flick * (1 + sparkle);
      if (alpha>1) alpha=1;
      ctx.globalAlpha = alpha;
      ctx.fillStyle='#e5e7eb';
      const size = 1.2 + s.z*0.8;
      ctx.fillRect(x, y, size, size);
    }

    // ===== Galaxy arms pass =====
    ctx.globalAlpha=1;
    ctx.save();
    ctx.translate(center.x, center.y);

    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      // Update angle (slower spin + subtle wobble)
      p.a += p.sp * (0.6 + 0.12*Math.sin(t*0.0003+i));
      const wob = 1 + Math.sin(t*0.001+i)*0.035*p.wob;
      const x=Math.cos(p.a)*p.r*wob;
      const y=Math.sin(p.a)*p.r*wob;

      // Core brightness boost
      const nd = Math.hypot(x,y)/Math.max(w,h); // 0 at center
      const coreBoost = (1 - Math.min(1, nd*2.0)); // inner region
      const boost = 1 + coreBoost*(CONFIG.ARM_CORE_BOOST-1);

      // Base color & lightness varies slightly with radius
      const hue = p.hue + (1-nd)*8; // a touch bluer near core
      const light = p.light + (1-nd)*8;

      // ---- Trails (before drawing main point) ----
      if (CONFIG.STREAKS && (p.px || p.py)){
        ctx.globalCompositeOperation='lighter';
        ctx.globalAlpha = 0.10 * boost;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        const tx = p.px + (x - p.px) * (0.35 + CONFIG.ARM_TRAIL_LEN*0.45);
        const ty = p.py + (y - p.py) * (0.35 + CONFIG.ARM_TRAIL_LEN*0.45);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = hsla(hue, p.sat, Math.min(92, light+5), 1);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalCompositeOperation='source-over';
      }

      // ---- Dust glow (soft radial gradient) ----
      if (CONFIG.DUST_GLOW && (i % CONFIG.DUST_EVERY === 0)){
        const gr = 8 + p.size*3 * (1-nd*0.8);
        const gx = x, gy = y;
        const g = ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0, hsla(hue, p.sat, Math.min(95, light+10), 0.12*boost));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(gx,gy,gr,0,Math.PI*2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      // ---- Main arm star (slightly larger & brighter) ----
      const a = Math.max(0, 0.25 - nd*0.15) * boost; // alpha falloff
      ctx.globalAlpha = a;
      ctx.fillStyle = hsla(hue, p.sat, light, 1);
      const s = p.size;
      ctx.fillRect(x, y, s, s);

      // store prev for trail
      p.px = x; p.py = y;
    }

    ctx.restore();
    ctx.globalAlpha=1;

    // ===== Core nucleus glow =====
    if (CONFIG.CORE_GLOW){
      ctx.globalCompositeOperation='lighter';
      const R = Math.min(w,h)*0.18;
      const g1 = ctx.createRadialGradient(center.x,center.y,0,center.x,center.y,R);
      g1.addColorStop(0, 'rgba(165,180,252,0.25)');
      g1.addColorStop(0.6, 'rgba(99,102,241,0.18)');
      g1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g1; ctx.beginPath(); ctx.arc(center.x,center.y,R,0,Math.PI*2); ctx.fill();
      ctx.globalCompositeOperation='source-over';
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
