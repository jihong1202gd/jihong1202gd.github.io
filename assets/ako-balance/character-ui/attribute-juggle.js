(() => {
  'use strict';
  const hero = document.querySelector('.character-hero[data-hero-kind="attributes"]');
  const layer = hero?.querySelector('.attribute-orb-surfaces');
  if (!layer) return;
  const content = layer.querySelector('[data-juggle-content]');
  const balls = [...layer.querySelectorAll('[data-juggle-orb]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const patterns = [
    {id:'toss', period:4200},
    {id:'figure-eight', period:4600},
    {id:'carousel', period:3600},
    {id:'spiral', period:4000}
  ];
  const transition = 800;
  const segments = [];
  const recentPatterns = [];
  function choosePattern(start) {
    const previous = segments.at(-1)?.pattern;
    const choices = patterns.map((_, i) => i).filter(i => i !== previous);
    const pattern = choices[Math.floor(Math.random() * choices.length)];
    const duration = patterns[pattern].period;
    segments.push({start, end:start + duration, pattern, previous});
    if (segments.length > 4) segments.shift();
    recentPatterns.push(patterns[pattern].id);
    layer.dataset.motionPattern = patterns[pattern].id;
    layer.dataset.patternHistory = recentPatterns.slice(-8).join(',');
    layer.dataset.patternCount = String(patterns.length);
  }
  choosePattern(0);
  let frame = 0, last = 0, lastDraw = 0, elapsed = 0;

  const tau = Math.PI * 2;
  const ns = 'http://www.w3.org/2000/svg';
  function make(tag, attrs, parent) {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    parent.appendChild(el);
    return el;
  }
  // Three thin crimson rings rotate on separate planes, split around the sphere.
  const effects = balls.map((ball, i) => {
    const back = make('g', {'data-orb-ring':'back', 'data-ring-orb':i}, ball);
    ball.insertBefore(back, ball.firstChild);
    const front = make('g', {'data-orb-ring':'front', 'data-ring-orb':i}, ball);
    function bands(parent) {
      const glows=Array.from({length:3},()=>make('path',{fill:'#d52a31',opacity:'.28',filter:'url(#juggle-fog-soft)'},parent));
      const lanes=['#df3a39','#c51b2c','#e64d42'].map((color,j)=>make('path',{fill:color,opacity:String(.86-j*.09),'data-ring-axis':j},parent));
      return {glows,lanes};
    }
    const dust=Array.from({length:12},()=>make('circle',{fill:'#e86655',r:'1',opacity:'.45'},front));
    return {back,front,backBands:bands(back),frontBands:bands(front),dust};
  });
  function ringBand(inner, outer, start, tilt, yaw, roll) {
    const points=[];
    for(let k=0;k<=28;k++)points.push(project(start+k*Math.PI/28,outer,tilt,yaw,roll));
    for(let k=28;k>=0;k--)points.push(project(start+k*Math.PI/28,inner,tilt,yaw,roll));
    return points.map((p,k)=>(k?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' ')+' Z';
  }
  function paintRing(fx, i, t) {
    const axes=Array.from({length:3},(_,j)=>({
      radius:[60,68,76][j],width:[2,1.7,1.5][j],
      tilt:[1.10,.82,1.25][j]+.10*Math.sin(t*.37+i+j),
      yaw:[.08,-.42,.31][j]+.12*Math.sin(t*.23+j+i*.4),
      roll:[-.52,.8,1.6][j]+i*.38+t*tau/[9.2,-12.4,15.8][j]
    }));
    axes.forEach(({radius,width,tilt,yaw,roll},j)=>{
      const start=Math.atan2(Math.sin(yaw),Math.sin(tilt)*Math.cos(yaw));
      const front=ringBand(radius-width/2,radius+width/2,start,tilt,yaw,roll);
      const back=ringBand(radius-width/2,radius+width/2,start+Math.PI,tilt,yaw,roll);
      fx.frontBands.lanes[j].setAttribute('d',front);
      fx.backBands.lanes[j].setAttribute('d',back);
      fx.frontBands.glows[j].setAttribute('d',front);
      fx.backBands.glows[j].setAttribute('d',back);
    });
    fx.dust.forEach((dust,j)=>{
      const axis=axes[j%3];
      const p=project(j*tau/12+t*(j%2?-.45:.38),axis.radius,axis.tilt,axis.yaw,axis.roll);
      dust.setAttribute('cx',p.x.toFixed(2));dust.setAttribute('cy',p.y.toFixed(2));
      dust.setAttribute('r',(.9+.25*Math.sin(t*.8+j)).toFixed(2));
      (p.z>=0?fx.front:fx.back).appendChild(dust);
    });
  }
  function project(angle, radius, tilt, yaw, roll) {
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle) * Math.cos(tilt);
    const z = radius * Math.sin(angle) * Math.sin(tilt);
    const xx = x * Math.cos(yaw) + z * Math.sin(yaw);
    const zz = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const perspective = 270 / (270 - zz);
    return {x:(xx * Math.cos(roll) - y * Math.sin(roll)) * perspective,
      y:(xx * Math.sin(roll) + y * Math.cos(roll)) * perspective, z:zz};
  }
  function position(pattern, time, orb) {
    const raw = (time / patterns[pattern].period + orb / 3) * tau;
    if (pattern === 1) {
      return {x:277 + 143 * Math.sin(raw), y:218 - 123 * Math.sin(raw * 2), depth:.9 * Math.cos(raw)};
    }
    if (pattern === 2) {
      return {x:275 + 150 * Math.cos(raw), y:175 + 55 * Math.sin(raw) + 28 * Math.sin(raw * 2), depth:Math.sin(raw)};
    }
    if (pattern === 3) {
      const radius = 108 + 30 * Math.sin(raw * 2);
      return {x:270 + radius * Math.cos(raw), y:220 + radius * 1.12 * Math.sin(raw), depth:.85 * Math.sin(raw - .4)};
    }
    const a = raw - .11 * tau * Math.sin(raw);
    const breath = Math.sin(time * tau / 12600);
    const y = 220 - (155 + 12 * breath) * Math.cos(a) + 14 * Math.sin(a * 2);
    const x = 285 + (138 + 12 * breath) * Math.sin(a) - 28 * (1 - Math.cos(a));
    return {x, y, depth: .8 * Math.sin(a + .35) + .2 * Math.sin(a * 2), a};
  }
  function sample(time, orb) {
    time = Math.max(0, time);
    const segment = segments.findLast(s => s.start <= time) || segments[0];
    const next = position(segment.pattern, time, orb);
    if (segment.previous === undefined || time - segment.start >= transition) return next;
    const old = position(segment.previous, time, orb);
    const q = Math.min(1, (time - segment.start) / transition);
    const blend = q * q * q * (q * (q * 6 - 15) + 10);
    return {x:old.x + (next.x - old.x) * blend, y:old.y + (next.y - old.y) * blend, depth:old.depth + (next.depth - old.depth) * blend};
  }
  function paint() {
    while (elapsed >= segments.at(-1).end) choosePattern(segments.at(-1).end);
    const order = [];
    const vortexOrbs = [];
    balls.forEach((ball, i) => {
      const phase = elapsed / 4200 + i / 3;
      const p = sample(elapsed, i);
      const scale = .92 + p.depth * .14;
      vortexOrbs.push({x:p.x,y:p.y,scale,depth:p.depth});
      ball.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) scale(${scale.toFixed(3)})`);
      ball.querySelector('[data-liquid-swirl]').setAttribute('transform', `rotate(${(phase * 135).toFixed(2)})`);
      paintRing(effects[i], i, elapsed / 1000);
      order.push({ball, depth: p.depth});
    });
    order.sort((a, b) => a.depth - b.depth).forEach(({ball}) => content.appendChild(ball));
    window.akoAttributeVortex?.render(elapsed / 1000, vortexOrbs);
    layer.dataset.phase = (elapsed / patterns[segments.at(-1).pattern].period % 1).toFixed(4);
  }
  function tick(now) {
    if (last) elapsed += Math.min(now - last, 100);
    last = now;
    if (now - lastDraw >= 30) { paint(); lastDraw = now; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    const active = !hero.hidden && hero.dataset.effectsReady === 'true' && !document.hidden;
    if (!active || reduced.matches) {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      hero.dataset.juggleMotion = active ? 'still' : 'paused';
      if (active) paint();
      return;
    }
    if (frame) return;
    hero.dataset.juggleMotion = 'running';
    paint(); frame = requestAnimationFrame(tick);
  }
  new MutationObserver(sync).observe(hero, {attributes: true, attributeFilter: ['hidden', 'data-reveal-state', 'data-effects-ready']});
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  paint(); sync();
})();
