(() => {
  'use strict';
  const hero = document.querySelector('.character-hero[data-hero-kind="weapon"]');
  const image = hero.querySelector('.hero-original');
  const flames = [...hero.querySelectorAll('.candle-flame-tongue')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, lastDraw = 0;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    hero.dataset.candleMotion = 'paused';
  }
  function draw(now) {
    if (now - lastDraw >= 32) {
      const t = now / 1000;
      // Local origins are the wicks: the illustration and props stay still.
      flames.forEach((flame, i) => {
        const phase = i * 1.83;
        const bend = Math.sin(t * (2.7 + i * .23) + phase) * 3.4
          + Math.sin(t * 6.9 + phase) * 1.1;
        const sx = .98 + Math.sin(t * 4.2 + phase) * .055;
        const sy = 1 + Math.sin(t * (3.3 + i * .19) + phase) * .075;
        flame.setAttribute('transform',
          'skewX(' + bend.toFixed(3) + ') scale(' + sx.toFixed(4) + ' ' + sy.toFixed(4) + ')');
        flame.setAttribute('opacity', (.94 + Math.sin(t * 7.1 + phase) * .05).toFixed(4));
      });
      lastDraw = now;
    }
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    const shouldRun = !hero.hidden && !['idle','loading'].includes(hero.dataset.revealState)
      && !document.hidden && !reduced.matches && image.naturalWidth > 0;
    if (!shouldRun) return stop();
    if (frame) return;
    hero.dataset.candleMotion = 'running';
    frame = requestAnimationFrame(draw);
  }
  new MutationObserver(sync).observe(hero, {attributes: true,
    attributeFilter: ['hidden', 'data-reveal-state']});
  image.addEventListener('load', sync);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  sync();
})();
