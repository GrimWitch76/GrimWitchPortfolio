// Performance preset toggle for the cosmic background
// - Adds a small floating control with three presets
// - Saves selection to localStorage and notifies the background via a custom event
(function initPerfToggle(){
  const KEY = 'cosmic_preset';
  const presets = {
    Balanced: {
      STAR_DENSITY_DIV: 12000,
      GALAXY_ARM_MULT: 1.8,
      ARM_CORE_BOOST: 1.35,
      ARM_TRAIL_LEN: 0.55,
      DUST_GLOW: true,
      STREAKS: true,
      CORE_GLOW: true,
      DUST_EVERY: 3,
      MAX_DPR: 2
    },
    Cinematic: {
      STAR_DENSITY_DIV: 10000,
      GALAXY_ARM_MULT: 2.4,
      ARM_CORE_BOOST: 1.6,
      ARM_TRAIL_LEN: 0.7,
      DUST_GLOW: true,
      STREAKS: true,
      CORE_GLOW: true,
      DUST_EVERY: 2,
      MAX_DPR: 2
    },
    Low: {
      STAR_DENSITY_DIV: 16000,
      GALAXY_ARM_MULT: 1.2,
      ARM_CORE_BOOST: 1.15,
      ARM_TRAIL_LEN: 0.35,
      DUST_GLOW: false,
      STREAKS: false,
      CORE_GLOW: true,
      DUST_EVERY: 4,
      MAX_DPR: 1
    }
  };

  const chosen = localStorage.getItem(KEY) || 'Balanced';

  // UI
  const box = document.createElement('div');
  box.id = "settings";
  box.style.position='fixed';
  box.style.right='14px';
  box.style.bottom='14px';
  box.style.zIndex='10000';
  box.style.background='rgba(7,7,18,.6)';
  box.style.border='1px solid rgba(255,255,255,.08)';
  box.style.backdropFilter='blur(8px)';
  box.style.padding='8px 10px';
  box.style.borderRadius='12px';
  box.style.font='500 13px system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial';
  box.style.color='#e5e7eb';

  const label = document.createElement('span');
  label.textContent = 'Effects:';
  label.style.marginRight='8px';

  const select = document.createElement('select');
  select.innerHTML = `
    <option value="Low">Low</option>
    <option value="Balanced">Balanced</option>
    <option value="Cinematic">Cinematic</option>
  `;
  select.value = chosen;
Object.assign(select.style, {
  background:'rgba(20,20,40,0.9)',
  border:'1px solid rgba(255,255,255,.15)',
  color:'#fff',
  borderRadius:'10px',
  padding:'6px 10px',
  appearance:'none',
  WebkitAppearance:'none',
  MozAppearance:'none'
});

// ensure dropdown options are visible too
const style = document.createElement('style');
style.textContent = `
  select option {
    background-color: rgba(20,20,40,0.95);
    color: #e5e7eb;
  }
  select option:checked {
    background-color: rgba(99,102,241,0.6);
    color: white;
  }
  select option:hover {
    background-color: rgba(165,180,252,0.6);
    color: white;
  }
`;
document.head.appendChild(style);


  box.appendChild(label); box.appendChild(select);
  document.body.appendChild(box);

  function apply(name){
    const cfg = presets[name] || presets.Balanced;
    localStorage.setItem(KEY, name);
    // notify background canvas
    const ev = new CustomEvent('cosmic:preset-changed', { detail: cfg });
    window.dispatchEvent(ev);
    // if cosmicBg API exists, call directly too (helps on first load timing)
    if (window.cosmicBg && typeof window.cosmicBg.applyConfig === 'function') {
      window.cosmicBg.applyConfig(cfg);
    }
  }

  select.addEventListener('change', ()=> apply(select.value));

  // apply initially on load (in case bg is already running)
  apply(chosen);
})();
