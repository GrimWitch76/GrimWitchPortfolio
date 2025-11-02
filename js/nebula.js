const nebula = document.getElementById("nebula");
const nctx = nebula.getContext("2d");

function resizeNebula() {
  nebula.width = window.innerWidth;
  nebula.height = window.innerHeight;
}
window.addEventListener("resize", resizeNebula);
resizeNebula();

const blobs = Array.from({ length: 5 }, () => ({
  x: Math.random() * nebula.width,
  y: Math.random() * nebula.height,
  r: 350 + Math.random() * 250,
  hue: Math.random() * 360,
  speed: 0.0005 + Math.random() * 0.001,
  offset: Math.random() * 1000
}));

let mouse = { x: nebula.width / 2, y: nebula.height / 2 };
window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function drawNebula(time) {
  nctx.clearRect(0, 0, nebula.width, nebula.height);

  blobs.forEach((b) => {
    // subtle breathing motion
    const shiftX = Math.sin(time * b.speed + b.offset) * 80;
    const shiftY = Math.cos(time * b.speed + b.offset) * 80;

    // parallax mouse influence (tiny offset toward cursor)
    const parallaxX = (mouse.x - nebula.width / 2) * 0.02;
    const parallaxY = (mouse.y - nebula.height / 2) * 0.02;

    const cx = b.x + shiftX - parallaxX;
    const cy = b.y + shiftY - parallaxY;

    const grad = nctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
    grad.addColorStop(0, `hsla(${b.hue}, 70%, 65%, 0.05)`);  // toned down opacity
    grad.addColorStop(0.4, `hsla(${b.hue}, 70%, 55%, 0.03)`);
    grad.addColorStop(1, "transparent");

    nctx.fillStyle = grad;
    nctx.fillRect(0, 0, nebula.width, nebula.height);
  });

  requestAnimationFrame(drawNebula);
}
requestAnimationFrame(drawNebula);
