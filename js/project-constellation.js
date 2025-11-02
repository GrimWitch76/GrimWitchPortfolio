/* Project Constellation — blocks connected like stars
   ------------------------------------------------------
   - Positions nodes around anchor points with gentle float
   - Draws SVG edges between nodes (DOM order by default)
   - Highlights edges near hovered node
   - Reduced-motion + manual motion toggle via `cosmic:motion`
   - Two expansion modes:
       • INLINE (default): node expands in place; others pushed/faded
       • MODAL (fallback): overlay panel — set INLINE_EXPAND=false
*/
(() => {
  'use strict';

  const INLINE_EXPAND = true; // << toggle here if you prefer the old modal

  const root = document.querySelector('.constellation');
  if (!root) return;

  const svg = root.querySelector('svg.links');
  if (!svg) { console.warn('Constellation: missing <svg class="links">'); return; }

  const nodes = Array.from(root.querySelectorAll('.node'));
  if (nodes.length === 0) return;

  // ---- Motion state ----
  const sysReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let motionOn = !sysReduce;
  if (document.documentElement.dataset.motion === 'off') motionOn = false;

  let rafId = 0;
  function requestTick(){ if (!rafId && motionOn && !openNode) rafId = requestAnimationFrame(tick); }
  window.addEventListener('cosmic:motion', (e) => {
    motionOn = !!(e.detail && e.detail.enabled);
    if (!motionOn) {
      if (rafId) cancelAnimationFrame(rafId); rafId=0;
      nodes.forEach((n) => (n.style.transform = 'translate3d(0,0,0)'));
      tick(performance.now());
    } else {
      requestTick();
    }
  });

  // ---- Build edges in DOM order ----
  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'edge');
    svg.appendChild(line);
    edges.push({ a, b, line });
  }

// Occasional beacon (but not too often)
const featured = nodes.filter(n => n.dataset.featured === 'true');
let beaconIdx = 0;
function pingFeatured(){
  if (!featured.length) return;
  const n = featured[beaconIdx % featured.length];
  n.classList.remove('beacon'); // restart animation
  // force reflow to replay
  void n.offsetWidth;
  n.classList.add('beacon');
  beaconIdx++;
}
setInterval(pingFeatured, 5000); // every 5s rotate the ping

  // Node glows
  const glows = nodes.map(() => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('class', 'node-glow');
    c.setAttribute('r', '10');
    svg.appendChild(c);
    return c;
  });

  // ---- Anchors + layout ----
  let W = 0, H = 0;
  const anchors = nodes.map(() => ({ x: 0, y: 0 }));
  function layout() {
    const rect = root.getBoundingClientRect();
    W = rect.width; H = rect.height;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const cx = W * 0.52;
    const cy = Math.max(380, H * 0.38);
    const rings = [Math.min(W, H) * 0.22, Math.min(W, H) * 0.33];

    nodes.forEach((n, i) => {
      const ring = rings[i % rings.length];
      const t = i / Math.max(1, nodes.length);
      const ang = t * Math.PI * 2 + (i % 2 ? 0.4 : -0.1);
      const jitter = 10 + ((i % 3) * 6);
      const x = cx + Math.cos(ang) * ring + (i % 2 ? -jitter : jitter);
      const y = cy + Math.sin(ang) * ring + (i % 2 ?  jitter : -jitter);
      anchors[i].x = x; anchors[i].y = y;
      if (!n.style.left) n.style.left = `${x - n.offsetWidth / 2}px`;
      if (!n.style.top)  n.style.top  = `${y - n.offsetHeight / 2}px`;
    });
  }

  // ---- Float state ----
  const mot = nodes.map(() => ({ seed: Math.random() * 1000, ox: 0, oy: 0 }));
  nodes.forEach((n) => {
    n.addEventListener('mouseenter', () => {
      edges.forEach((e) => e.line.classList.toggle('hot', e.a === n || e.b === n));
    });
    n.addEventListener('mouseleave', () => {
      edges.forEach((e) => e.line.classList.remove('hot'));
    });
  });

  // ---- Expansion (INLINE or MODAL) ----
  let openNode = null; // currently expanded node

  // Modal scaffolding (only used if INLINE_EXPAND=false)
  const overlay = document.createElement('div');
  overlay.className = 'expander-overlay';
  overlay.setAttribute('hidden', '');
  const panel = document.createElement('div');
  panel.className = 'expander-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'expander-title');
  const head = document.createElement('div'); head.className = 'expander-header';
  const title = document.createElement('h3'); title.className = 'expander-title'; title.id = 'expander-title';
  const closeBtn = document.createElement('button'); closeBtn.className = 'expander-close'; closeBtn.type = 'button'; closeBtn.textContent = 'Close'; closeBtn.setAttribute('data-no-warp', '');
  const body = document.createElement('div'); body.className = 'expander-body';
  head.appendChild(title); head.appendChild(closeBtn); panel.appendChild(head); panel.appendChild(body); overlay.appendChild(panel); document.body.appendChild(overlay);

  function modalOpen(node){
    openNode = node; root.dataset.expanded = 'true'; node.classList.add('is-source');
    const h2 = node.querySelector('h2'); title.textContent = h2 ? h2.textContent : (node.id || 'Details');
    const custom = node.querySelector('.expand-content'); body.innerHTML = custom ? custom.innerHTML : node.innerHTML;
    overlay.removeAttribute('hidden'); panel.classList.remove('closing'); requestAnimationFrame(() => overlay.classList.add('show'));
    document.body.style.overflow = 'hidden'; closeBtn.focus({ preventScroll: true });
    if (rafId){ cancelAnimationFrame(rafId); rafId=0; }
  }
  function modalClose(){
    if (!openNode) return;
    panel.classList.add('closing'); overlay.classList.remove('show');
    setTimeout(() => {
      overlay.setAttribute('hidden', ''); panel.classList.remove('closing'); document.body.style.overflow = '';
      root.dataset.expanded = 'false'; openNode.classList.remove('is-source');
      const back = openNode.querySelector('h2, a, button') || openNode; if (back && back.focus) back.focus({ preventScroll: true });
      openNode = null; requestTick();
    }, 200);
  }
  closeBtn.addEventListener('click', modalClose);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) modalClose(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') INLINE_EXPAND ? inlineClose() : modalClose(); });

  // ---- INLINE expand helpers ----
  function inlineOpen(node){
    if (openNode) return;
    openNode = node;
    root.dataset.inlineExpanded = 'true';
    node.classList.add('expanded');
    node.style.setProperty('--scale', '1'); // will animate via class
    // mount expanded body from .expand-content (if any)
    const custom = node.querySelector('.expand-content');
    if (custom){
      let bodyEl = node.querySelector('.expanded-body');
      if (!bodyEl){ bodyEl = document.createElement('div'); bodyEl.className = 'expanded-body'; node.appendChild(bodyEl); }
      bodyEl.innerHTML = custom.innerHTML;
    }
    // push other nodes away + fade
    pushOthersFrom(node);
    // pause float while open (keeps edges stable)
    if (rafId){ cancelAnimationFrame(rafId); rafId=0; }
  }

  function inlineClose(){
    if (!openNode) return;
    // reset pushes
    nodes.forEach(n => { if (n !== openNode){ n.style.setProperty('--tx','0px'); n.style.setProperty('--ty','0px'); n.style.setProperty('--scale','1'); } });
    root.dataset.inlineExpanded = 'false';
    openNode.classList.remove('expanded');
    openNode = null;
    requestTick();
  }

  function pushOthersFrom(source){
    const sRect = source.getBoundingClientRect();
    const sx = sRect.left + sRect.width/2;
    const sy = sRect.top  + sRect.height/2;
    nodes.forEach(n => {
      if (n === source) return;
      const r = n.getBoundingClientRect();
      const cx = r.left + r.width/2; const cy = r.top + r.height/2;
      let dx = cx - sx; let dy = cy - sy;
      const dist = Math.max(1, Math.hypot(dx, dy));
      dx /= dist; dy /= dist;
      // magnitude: stronger if closer, capped
      const mag = Math.max(60, Math.min(180, 260 - dist*0.3));
      const tx = dx * mag; const ty = dy * mag;
      n.style.setProperty('--tx', `${tx}px`);
      n.style.setProperty('--ty', `${ty}px`);
      n.style.setProperty('--scale', '0.96');
    });
  }

  // ---- click handling ----
  nodes.forEach((n) => {
    n.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      if (e.target.closest('a, button, video, input, textarea, select')) return;
      e.preventDefault();
      if (INLINE_EXPAND){
        if (openNode === n) inlineClose(); else inlineOpen(n);
      } else {
        if (!openNode) modalOpen(n);
      }
    });
  });

  // ---- Reveal observer ----
  const io = new IntersectionObserver((ents) => {
    ents.forEach((ent) => {
      ent.target.classList.toggle('visible', ent.isIntersecting);
    });
  }, { threshold: 0.1 });
  nodes.forEach((n) => io.observe(n));

  // ---- Animation tick ----
  function tick(t){
    nodes.forEach((n, i) => {
      const s = 8 + ((i % 3) * 4);
      const sp = 0.0006 + ((i % 5) * 0.0002);
      const ox = motionOn && !openNode ? Math.sin(t * sp + (i*97.13)) * s : 0;
      const oy = motionOn && !openNode ? Math.cos(t * sp + (i*83.77)) * s : 0;
      // compute final transform from variables
      const tx = parseFloat(n.style.getPropertyValue('--tx')) || 0;
      const ty = parseFloat(n.style.getPropertyValue('--ty')) || 0;
      const sc = parseFloat(n.style.getPropertyValue('--scale')) || 1;
      n.style.transform = `translate3d(${ox + tx}px, ${oy + ty}px, 0) scale(${sc})`;

      // glow + edges
      const cx = (n.offsetLeft + n.offsetWidth/2) + ox + tx;
      const cy = (n.offsetTop  + n.offsetHeight/2) + oy + ty;
      glows[i].setAttribute('cx', String(cx));
      glows[i].setAttribute('cy', String(cy));
    });

    if (!openNode){
      edges.forEach(({ a, b, line }) => {
        const ia = nodes.indexOf(a), ib = nodes.indexOf(b);
        const ax = (a.offsetLeft + a.offsetWidth / 2) + (parseFloat(a.style.getPropertyValue('--tx'))||0);
        const ay = (a.offsetTop  + a.offsetHeight / 2) + (parseFloat(a.style.getPropertyValue('--ty'))||0);
        const bx = (b.offsetLeft + b.offsetWidth / 2) + (parseFloat(b.style.getPropertyValue('--tx'))||0);
        const by = (b.offsetTop  + b.offsetHeight / 2) + (parseFloat(b.style.getPropertyValue('--ty'))||0);
        line.setAttribute('x1', String(ax)); line.setAttribute('y1', String(ay));
        line.setAttribute('x2', String(bx)); line.setAttribute('y2', String(by));
      });
    }

    rafId = 0; requestTick();
  }

  function fit(){ nodes.forEach((n) => (n.style.transform = 'translate3d(0,0,0)')); layout(); }
  window.addEventListener('resize', fit, { passive: true });
  fit();
  if (motionOn) requestTick(); else tick(performance.now());

  const callouts = document.querySelectorAll('.callout');
const coIO = new IntersectionObserver(ents=>{
  ents.forEach(ent=>{
    if (ent.isIntersecting) { ent.target.classList.add('glint'); coIO.unobserve(ent.target); }
  });
},{threshold:.6});
callouts.forEach(c=>coIO.observe(c));
})();
