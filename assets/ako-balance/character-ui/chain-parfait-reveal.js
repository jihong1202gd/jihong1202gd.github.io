(() => {
  'use strict';
  const hero = document.querySelector('[data-hero-kind="chain"]');
  const image = hero.querySelector('.hero-original');
  const canvas = document.querySelector('.chain-highlights');
  const ctx = canvas.getContext('2d');
  const replay = document.querySelector('.reveal-replay');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 1500;
  let entrance = null;
  let active = false, frame = 0, token = 0, elapsed = 0, last = 0, lastDraw = 0;
  let width = 0, height = 0, scale = 1, originX = 0, originY = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

  function measure() {
    width = innerWidth;
    height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measureHero();
  }
  function measureHero() {
    const bounds = hero.getBoundingClientRect();
    scale = Math.min(bounds.width / 1086, bounds.height / 1448);
    originX = bounds.left + (bounds.width - 1086 * scale) / 2;
    originY = bounds.top;
  }
  function cancel() {
    token++;
    cancelAnimationFrame(frame);
    frame = 0;
    if (entrance) entrance.cancel();
    entrance = null;
    ctx.clearRect(0, 0, width, height);
    canvas.dataset.lightTarget = 'none';
    hero.setAttribute('aria-busy', 'false');
  }
  function setTarget(value) {
    if (canvas.dataset.lightTarget !== value) canvas.dataset.lightTarget = value;
  }
  function sparkle(x, y, radius, alpha, red = false) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.translate(originX + x * scale, originY + y * scale);
    ctx.globalAlpha = alpha;
    const size = radius * scale;
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 4);
    glow.addColorStop(0, red ? 'rgba(255,211,205,.9)' : 'rgba(255,250,230,.95)');
    glow.addColorStop(.2, red ? 'rgba(255,154,165,.3)' : 'rgba(255,247,220,.3)');
    glow.addColorStop(1, 'rgba(255,220,210,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-size * 4, -size * 4, size * 8, size * 8);
    ctx.restore();
  }
  const syrupPath = [[224,429],[233,479],[220,545],[252,606],[228,681],[223,760]];
  function pathPoint(progress) {
    const t = clamp(progress) * (syrupPath.length - 1);
    const i = Math.min(syrupPath.length - 2, Math.floor(t));
    const q = t - i, a = syrupPath[i], b = syrupPath[i + 1];
    return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q];
  }
  function syrupSheen(progress) {
    if (progress <= 0 || progress >= 1) return;
    ctx.save();
    ctx.translate(originX, originY);
    ctx.scale(scale, scale);
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255,152,165,.7)';
    ctx.shadowBlur = 8;
    for (let i = 0; i < 12; i++) {
      const q = progress - i * .009;
      if (q <= 0) continue;
      const a = pathPoint(q), b = pathPoint(Math.min(1, q + .014));
      ctx.strokeStyle = 'rgba(255,242,224,' + (1 - i / 12) * .25 + ')';
      ctx.lineWidth = 1.8 - i * .08;
      ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
    }
    ctx.restore();
  }
  function pulse(time, start, length) {
    const t = (time - start) / length;
    return t > 0 && t < 1 ? Math.sin(t * Math.PI) ** 2 : 0;
  }
  function render(now) {
    if (!active || document.hidden || reduced.matches) { frame = 0; return; }
    elapsed += Math.min(80, now - last);
    last = now;
    if (now - lastDraw >= 32) {
      lastDraw = now;
      measureHero();
      ctx.clearRect(0, 0, width, height);
      if (elapsed < duration) {
        hero.dataset.revealState = 'appearing';
        sparkle(282, 567, 3.5, pulse(elapsed, 550, 850) * .2);
        syrupSheen((elapsed - 500) / 950);
        setTarget('glass-syrup');
      } else {
        if (hero.dataset.revealState !== 'settled') {
          hero.dataset.revealState = 'settled';
          hero.setAttribute('aria-busy', 'false');
          if (entrance) entrance.cancel();
          entrance = null;
        }
        const idle = ((elapsed - duration) / 1000) % 6.6;
        const glass = pulse(idle, .25, .85);
        const rose = pulse(idle, 2.7, .9);
        const foot = pulse(idle, 5, .6);
        sparkle(282, 567, 3, glass * .18);
        sparkle(138, 518, 3, rose * .13, true);
        sparkle(214, 997, 2.5, foot * .12);
        setTarget(rose > 0 ? 'rose' : glass > 0 || foot > 0 ? 'glass' : 'none');
      }
    }
    frame = requestAnimationFrame(render);
  }
  async function play() {
    if (!active) return;
    cancel();
    const id = token;
    elapsed = 0;
    hero.dataset.revealState = 'loading';
    hero.setAttribute('aria-busy', 'true');
    await image.decode().catch(() => {});
    if (id !== token || !active) return;
    hero.hidden = false;
    measure();
    if (reduced.matches) {
      hero.dataset.revealState = 'settled';
      hero.setAttribute('aria-busy', 'false');
      return;
    }
    hero.dataset.revealState = 'appearing';
    entrance = image.animate([{opacity:0},{opacity:1}], {
      duration: 1100, easing:'cubic-bezier(.2,.65,.3,1)', fill:'both'
    });
    last = performance.now();
    lastDraw = 0;
    if (!document.hidden) frame = requestAnimationFrame(render);
  }
  window.akoChainReveal = {
    select(visible) {
      active = visible;
      cancel();
      canvas.hidden = !visible;
      hero.hidden = !visible;
      hero.dataset.revealState = 'idle';
      if (visible) { replay.hidden = false; play(); }
    }
  };
  replay.addEventListener('click', play);
  addEventListener('resize', () => { if (active) measure(); });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (active && !document.hidden && !reduced.matches) {
      last = performance.now();
      frame = requestAnimationFrame(render);
    }
  });
  reduced.addEventListener('change', () => { if (active) play(); });
})();
