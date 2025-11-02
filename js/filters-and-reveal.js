/* Project filters (Unity / UE5 / Web / etc.) + scroll reveal */
(function ProjectFilters(){
const grid = document.getElementById('project-cards') || document.querySelector('.cards');
if (!grid) return;


// ---- 1) Discover tags on cards ----
const cards = Array.from(grid.querySelectorAll('.card'));
const tagSet = new Set(['All']);
const cardTags = new Map(); // card -> Set(tags)


cards.forEach(card=>{
const raw = (card.dataset.tags || '').toLowerCase();
const tags = new Set(raw.split(/[\s,]+/).filter(Boolean));
tags.forEach(t=> tagSet.add(cap(t)));
if (tags.size===0) tagSet.add('Other');
cardTags.set(card, tags);
card.classList.add('reveal');
});


const PREFERRED = ['All','Unity','UE5','Web','Tools','Solo','Team','Other'];
const tagsOrdered = Array.from(tagSet).sort((a,b)=>{
const ai=PREFERRED.indexOf(a), bi=PREFERRED.indexOf(b);
if (ai!==-1 || bi!==-1){ return (ai===-1?999:ai) - (bi===-1?999:bi); }
return a.localeCompare(b);
});


// ---- 2) Render filter bar ----
let bar = document.querySelector('.filterbar');
if (!bar){
bar = document.createElement('div');
bar.className = 'filterbar';
grid.parentElement.insertBefore(bar, grid);
}
bar.innerHTML = '';
tagsOrdered.forEach(t=>{
const chip = document.createElement('a');
chip.type='a';
chip.className='chip';
chip.dataset.tag = t.toLowerCase();
chip.setAttribute('data-no-warp',''); // prevents warp transitions
chip.innerHTML = `<span class="dot"></span>${t}`;
bar.appendChild(chip);
});


// restore selection from URL or storage
const KEY='cosmic_filter';
let current = (new URL(location.href)).searchParams.get('tag') || localStorage.getItem(KEY) || 'all';
activate(current);


// click handler with View Transitions when supported
bar.addEventListener('click', (e)=>{
const chip = e.target.closest('.chip'); if(!chip) return;
const tag = chip.dataset.tag;
if (!tag) return;
// explicitly skip warp effects
e.preventDefault();
activate(tag);
});


function activate(tag){
current = (tag||'all').toLowerCase();
localStorage.setItem(KEY, current);
bar.querySelectorAll('.chip').forEach(c=> c.dataset.active = (c.dataset.tag===current));


cards.forEach(card=>{
const tags = cardTags.get(card) || new Set();
const match = current==='all' || tags.has(current);
if (match){
if (card.hasAttribute('hidden')){
card.removeAttribute('hidden');
requestAnimationFrame(()=> card.classList.remove('is-out'));
} else {
card.classList.remove('is-out');
}
} else {
card.classList.add('is-out');
setTimeout(()=> card.setAttribute('hidden',''), 180);
}
});


const url = new URL(location.href);
if (current==='all') url.searchParams.delete('tag'); else url.searchParams.set('tag', current);
history.replaceState(null,'',url);
}


// ---- 3) Scroll reveal ----
const motionReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!motionReduced){
const io = new IntersectionObserver((entries)=>{
for (const ent of entries){
const el = ent.target;
if (ent.isIntersecting){
el.classList.add('visible');
} else {
el.classList.remove('visible');
}
}
}, { root: null, threshold: 0.12, rootMargin: '0px 0px -8% 0px' });


cards.forEach((card, i)=>{
card.style.setProperty('--reveal-delay', (i%6)*40 + 'ms');
io.observe(card);
});
}


function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
})();