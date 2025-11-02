(function cosmicBackground(){
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { return; }

  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const DPR = Math.min(2, devicePixelRatio||1);
  canvas.width = w * DPR; canvas.height = h * DPR; canvas.style.width = w+'px'; canvas.style.height = h+'px'; ctx.scale(DPR,DPR);

  const center = {x:w/2, y:h/2};
  const STAR_COUNT = Math.min(220, Math.floor((w*h)/12000));
  const stars = Array.from({length:STAR_COUNT},()=>({x:Math.random()*w,y:Math.random()*h,z:Math.random()*0.8+0.2, tw:500+Math.random()*2000}));
  const P_COUNT = 280;
  const particles = Array.from({length:P_COUNT}, (_,i)=>{
    const arm=i%3; const r=40+Math.random()*Math.min(w,h)*0.45; const a=(i/P_COUNT)*Math.PI*4 + arm*(Math.PI*2/3);
    return {r,a,sp:0.0005+Math.random()*0.0009,wob:0.2+Math.random()*0.8}; // slower base speed
  });
  let mx=center.x,my=center.y;

  function onMove(e){ const p=e.touches?.[0]||e; mx=p.clientX; my=p.clientY; }
  addEventListener('pointermove',onMove,{passive:true});
  addEventListener('touchmove',onMove,{passive:true});
  addEventListener('resize',()=>{
    w=innerWidth; h=innerHeight;
    canvas.width=w*DPR; canvas.height=h*DPR; canvas.style.width=w+'px'; canvas.style.height=h+'px';
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(DPR,DPR);
    center.x=w/2; center.y=h/2;
  });

  let t0=performance.now();
  function tick(t){
    const dt=t-t0; t0=t; // eslint keep
    ctx.clearRect(0,0,w,h);
    // backdrop
    const g=ctx.createRadialGradient(center.x,center.y,10,center.x,center.y,Math.max(w,h));
    g.addColorStop(0,'#0b0b1a'); g.addColorStop(1,'#03030a'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // nebulas
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<3;i++){
      const px=center.x+Math.cos((t*0.0002)+i)*(w*0.15+i*20);
      const py=center.y+Math.sin((t*0.00025)+i)*(h*0.12+i*30);
      const r=Math.max(w,h)*(0.15+i*0.05); const neb=ctx.createRadialGradient(px,py,0,px,py,r);
      neb.addColorStop(0,'rgba(99,102,241,0.08)'); neb.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=neb; ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';
    // stars
    for(let i=0;i<stars.length;i++){
      const s=stars[i]; const px=(mx-center.x)*0.0001*(s.z-0.5); const py=(my-center.y)*0.0001*(s.z-0.5);
      const x=s.x - px*w; const y=s.y - py*h; const tw=0.6+0.4*Math.sin((t+i*71)/s.tw);
      ctx.globalAlpha=0.5+0.5*s.z*tw; ctx.fillStyle='#e5e7eb'; ctx.fillRect(x,y,1.2+s.z*0.8,1.2+s.z*0.8);
    }
    ctx.globalAlpha=1;
    // spiral (slower + softer wobble)
    ctx.save(); ctx.translate(center.x,center.y);
    for(let i=0;i<particles.length;i++){
      const p=particles[i]; p.a += p.sp * (0.6 + 0.12*Math.sin(t*0.0003+i)); // reduced multiplier
      const wob = 1 + Math.sin(t*0.001+i)*0.035*p.wob; // gentler wobble
      const x=Math.cos(p.a)*p.r*wob; const y=Math.sin(p.a)*p.r*wob;
      const d=Math.hypot(x,y)/Math.max(w,h); const a=Math.max(0,0.35 - d*0.25);
      ctx.globalAlpha=a; ctx.fillStyle='#a5b4fc'; ctx.fillRect(x,y,2,2);
    }
    ctx.restore(); ctx.globalAlpha=1;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
