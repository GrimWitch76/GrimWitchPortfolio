(() => {
  'use strict';

  // Intersection reveal
  const io = new IntersectionObserver((ents) => {
    ents.forEach(ent => ent.target.classList.toggle('visible', ent.isIntersecting));
  }, { threshold: 0.12 });

  document.querySelectorAll('.about-section .reveal').forEach(el => io.observe(el));

  // Timeline progress fill
  const timeline = document.getElementById('timeline');
  const prog = document.getElementById('tlProgress');
  if (timeline && prog) {
    const update = () => {
      const rect = timeline.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const start = Math.max(0, vh * 0.12 - rect.top);
      const end = rect.height;
      const clamped = Math.max(0, Math.min(end, start));
      prog.style.height = `${clamped}px`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
  }

  // Respect Motion toggle: disable smooth scrolling when off
  const setScrollBehavior = () => {
    const off = document.documentElement.dataset.motion === 'off';
    document.documentElement.style.scrollBehavior = off ? 'auto' : 'smooth';
  };
  setScrollBehavior();
  window.addEventListener('cosmic:motion', setScrollBehavior);
})();

document.querySelectorAll('.tl-item[data-star="true"]').forEach(el=>{
  new IntersectionObserver((ents,obs)=>{
    ents.forEach(ent=>{
      if(ent.isIntersecting){ el.classList.add('comet'); obs.unobserve(el); }
    });
  },{threshold:.6}).observe(el);
});