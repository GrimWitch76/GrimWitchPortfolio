/* Motion Toggle UI
   - Adds a small bottom-right toggle to enable/disable page motion
   - Persists in localStorage
   - Dispatches CustomEvent('cosmic:motion', {detail:{enabled:true|false}})
   - Sets documentElement.dataset.motion = 'on' | 'off'
*/
(function MotionToggle(){
  const KEY = 'cosmic_motion';
  const saved = (localStorage.getItem(KEY) || '').toLowerCase();
  const sysReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let enabled = saved ? (saved === 'on') : !sysReduce;

  // apply initial state
  document.documentElement.dataset.motion = enabled ? 'on' : 'off';
  window.dispatchEvent(new CustomEvent('cosmic:motion', { detail: { enabled } }));

  // ui
  const wrap = document.getElementById('settings');
  //const wrap = document.createElement('div');
//   wrap.style.position = 'fixed';
//   wrap.style.right = '25px';
//   wrap.style.bottom = '75px';
//   wrap.style.zIndex = '50';
//   wrap.style.font = '600 12px system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial';
//   wrap.style.color = '#e5e7eb';
//   wrap.style.userSelect = 'none';

  const btn = document.createElement('button');
  Object.assign(btn.style, {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: 'inherit', padding: '6px 10px', borderRadius: '10px',
    cursor: 'pointer', backdropFilter: 'blur(6px)',
  });
  btn.style.marginLeft = '7px';
  btn.setAttribute('aria-pressed', String(enabled));
  btn.setAttribute('data-no-warp','');
  const label = ()=> btn.textContent = enabled ? 'Motion: On' : 'Motion: Off';
  label();
  btn.addEventListener('click', ()=>{
    enabled = !enabled; label();
    localStorage.setItem(KEY, enabled ? 'on' : 'off');
    document.documentElement.dataset.motion = enabled ? 'on' : 'off';
    window.dispatchEvent(new CustomEvent('cosmic:motion', { detail: { enabled } }));
  });

  wrap.appendChild(btn);
  document.body.appendChild(wrap);
})();