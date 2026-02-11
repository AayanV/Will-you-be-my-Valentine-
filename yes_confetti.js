(() => {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  const confettiCount = 160;
  const gravity = 0.18;
  const drag = 0.995;

  // Fun palette
  const colors = ["#ff4d6d", "#ffb703", "#8ecae6", "#8338ec", "#3a86ff", "#06d6a0", "#ff006e"];

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  const pieces = Array.from({ length: confettiCount }, () => ({
    x: rand(0, window.innerWidth),
    y: rand(-window.innerHeight, 0),
    w: rand(6, 12),
    h: rand(8, 16),
    vx: rand(-2.5, 2.5),
    vy: rand(1, 4),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.08, 0.08),
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: rand(0.75, 1),
  }));

  let start = performance.now();
  const durationMs = 9000; // confetti runs ~9 seconds

  function draw(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of pieces) {
      // physics
      p.vy += gravity;
      p.vx *= drag;
      p.vy *= drag;

      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      // wrap / respawn
      if (p.y > window.innerHeight + 40) {
        p.y = -20;
        p.x = rand(0, window.innerWidth);
        p.vx = rand(-2.5, 2.5);
        p.vy = rand(1, 4);
      }
      if (p.x < -40) p.x = window.innerWidth + 40;
      if (p.x > window.innerWidth + 40) p.x = -40;

      // render
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    // stop after duration (leave last frame for a moment)
    if (elapsed < durationMs) {
      requestAnimationFrame(draw);
    } else {
      // fade out quickly
      let fade = 1;
      const fadeOut = () => {
        fade -= 0.06;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.globalAlpha = Math.max(fade, 0);
        for (const p of pieces) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
        if (fade > 0) requestAnimationFrame(fadeOut);
        else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      };
      requestAnimationFrame(fadeOut);
    }
  }

  requestAnimationFrame(draw);
})();
