// Edit your projects here
window.COSMIC_PROJECTS = [
  {title:'Echo Protocol', type: "personal", hasCaseStudy:true, tagline:'Digging into anomalies in a frozen world.', role:'Solo Dev – Unity/ShaderGraph/Tools', href:'./projects/echo-protocol.html', datatags:"unity, tools, solo"},
  {title:'Ghost With a Gun', type: "personal",  hasCaseStudy:true, tagline:'Scream Jam prototype with squad.', role:'Gameplay + AI + UI – UE5', href:'#', datatags:"unity, tools"},
  {title:'Soundrift', hasCaseStudy:true, type: "personal",  tagline:'Ambient layering web app.', role:'Frontend + Audio + Deploy', href:'./projects/soundDrift.html', datatags:"web, js, solo"},
  {title:'Super Hit Baseball', hasCaseStudy:false, type: "professional",  tagline:'Skill based baseball', role:'UI, Server Communication, Gamepaly', href:'https://play.google.com/store/apps/details?id=com.offfgames.android.free.baseballbattle&hl=en_CA', datatags:"unity, c#, python, mobile"},
  {title:'Big Win Football', hasCaseStudy:false, type: "professional",  tagline:'Football team builder', role:'UI and Leaderboards', href:'https://play.google.com/store/apps/details?id=com.hotheadgames.google.free.bigwinfootball2&hl=en_CA', datatags:"unity, c#, python, mobile"},
  {title:'Civilization 6 netflix port', hasCaseStudy:false, type: "professional",  tagline:'Civ 6', role:'UI, Cloud Saves', href:'', datatags:"c++, mobile"},
  {title:'My Virtual Tanuki', hasCaseStudy:true, type: "personal",  tagline:'A virtual pet game about tanukis', role:'Gameplay, menus, save system, offline progress', href:'#', datatags:"unity, tools, solo"},
  {title:'Sir Sticky Tongue', type: "personal",  hasCaseStudy:true, tagline:'Ambient layering web app.', role:'Frontend + Audio + Deploy', href:'#', datatags:"unity, shadergraph"},
  {title:'GMTK Game Jam', hasCaseStudy:true, type: "personal",  tagline:'Ambient layering web app.', role:'Frontend + Audio + Deploy', href:'#', datatags:"unity, solo"},
  {title:'Tiny Tasks', hasCaseStudy:false, type: "personal",  tagline:'Ambient layering web app.', role:'Frontend + Audio + Deploy', href:'#', datatags:"mobile"},
  {title:'Minesweeper', hasCaseStudy:true, type: "personal",  tagline:'Ambient layering web app.', role:'Frontend + Audio + Deploy', href:'#', datatags:"web, js, solo"},
  {title:'Dream Bane', hasCaseStudy:false, type: "personal",  tagline:'Ambient layering web app.', role:'Frontend + Audio + Deploy', href:'#', datatags:"unity"},
  {title:'GGJam 2025', hasCaseStudy:true, type: "personal",  tagline:'Ambient layering web app.', role:'Frontend + Audio + Deploy', href:'#', datatags:"unity"},
  {title:'Tanuki Minecraft Mod', hasCaseStudy:false, type: "personal",  tagline:'Ambient layering web app.', role:'Frontend + Audio + Deploy', href:'#', datatags:"java, mod"},
  {title:'Core Breaker', hasCaseStudy:true, type: "personal",  tagline:'Ambient layering web app.', role:'Frontend + Audio + Deploy', href:'#', datatags:"unity, shadergraph, solo"},
];

(function renderProjects(){
  const wrap = document.getElementById('project-cards');
  if (!wrap) return;

  wrap.innerHTML = window.COSMIC_PROJECTS.map(p => `
    <a class="card" href="${p.href}" data-tags="${p.datatags}">
      <div style="display:flex;justify-content:flex-start;gap:12px;align-items:baseline;">
        ${p.type === 'professional' ? '<span class="badge pro">Studio</span>' : ''}
        ${p.type === 'personal' ? '<span class="badge indie">Indie</span>' : ''}
        <strong>${p.title}</strong>
        ${p.hasCaseStudy ? '<small>Case Study →</small>' : ''}
      </div>
      <div style="color:#d4d4d8">${p.tagline}</div>
      <small>${p.role}</small>
    </a>`
  ).join('');
})();