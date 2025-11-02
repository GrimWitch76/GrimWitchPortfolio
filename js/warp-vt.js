// js/warp-vt.js (explicit VT + canvas fallback)
(function initWarp(){
  const motionOK = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsVT = typeof document.startViewTransition === 'function';
  const isHTTP = location.protocol === 'http:' || location.protocol === 'https:';

  const parse = url => { try { return new URL(url, location.href); } catch { return null; } };
  const sameOrigin = u => u && u.origin === location.origin;
  const sameDoc = u => u && u.origin === location.origin && u.pathname === location.pathname && u.search === location.search;

  function canvasFallback(url){
    if (!motionOK) { location.href = url; return; }
    const c = document.createElement('canvas');
    Object.assign(c.style, {position:'fixed', inset:'0', zIndex:9999, pointerEvents:'none'});
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const DPR = Math.min(2, devicePixelRatio||1);
    function fit(){ c.width=innerWidth*DPR; c.height=innerHeight*DPR; c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; ctx.setTransform(DPR,0,0,DPR,0,0); }
    fit();
    const cx=innerWidth/2, cy=innerHeight/2; const t0=performance.now();
    function tick(t){
      const p=Math.min(1,(t-t0)/450);
      ctx.clearRect(0,0,innerWidth,innerHeight);
      const r=Math.hypot(innerWidth,innerHeight)*(0.15+p*1.2);
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
      g.addColorStop(0,`rgba(165,180,252,${0.3*(1-p)+0.7})`);
      g.addColorStop(0.5,`rgba(99,102,241,${0.25*(1-p)})`);
      g.addColorStop(1,`rgba(3,3,10,1)`);
      ctx.fillStyle=g; ctx.fillRect(0,0,innerWidth,innerHeight);
      if(p<1) requestAnimationFrame(tick); else location.href=url;
    }
    requestAnimationFrame(tick);
  }

  // Capture phase so we beat default navigation reliably
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest && e.target.closest('a');
    if (!a) return;
    if (a.target || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.hasAttribute('data-no-warp') ) return;
    if (a.dataset.noWarp !== undefined) return;

    const u = parse(a.href); if (!u || !sameOrigin(u)) return;

    if(e.Data)

    // Same-document hash
    if (sameDoc(u) && u.hash) {
      e.preventDefault();
      const go = () => { location.hash = u.hash; };
      (motionOK && isHTTP && supportsVT) ? document.startViewTransition(go) : go();
      return;
    }

    // Cross-document same-origin
    if (!sameDoc(u)) {
      e.preventDefault();
      (motionOK)
        ? document.startViewTransition(() => { location.href = u.href; })
        : canvasFallback(u.href);
      return;
    }
  }, { capture: true });
})();