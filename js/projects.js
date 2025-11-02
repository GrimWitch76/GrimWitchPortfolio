// Edit your projects here
window.COSMIC_PROJECTS = [
  {title:'Echo Protocol', tagline:'Digging into anomalies in a frozen world.', role:'Solo Dev – Unity/ShaderGraph/Tools', href:'./projects/echo-protocol.html'},
  {title:'Ghost With a Gun', tagline:'Scream Jam prototype with squad.', role:'Gameplay + AI + UI – UE5', href:'#'},
  {title:'Soundrift', tagline:'Ambient layering web app.', role:'Frontend + Audio + Deploy', href:'#'},
];

(function renderProjects(){
  const wrap = document.getElementById('project-cards');
  if (!wrap) return;
  wrap.innerHTML = window.COSMIC_PROJECTS.map(p => `
    <a class="card" href="${p.href}">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline">
        <strong>${p.title}</strong>
        <small>Case Study →</small>
      </div>
      <div style="color:#d4d4d8">${p.tagline}</div>
      <small>${p.role}</small>
    </a>`
  ).join('');
})();

