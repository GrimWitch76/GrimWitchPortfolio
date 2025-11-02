// Year stamp
document.getElementById('y').textContent = new Date().getFullYear();

document.querySelectorAll('a[href^="/projects/"]').forEach(a=>{
  a.addEventListener('mouseenter', ()=>{
    const l = document.createElement('link');
    l.rel = 'prefetch'; l.href = a.href; document.head.appendChild(l);
  }, {once:true});
});