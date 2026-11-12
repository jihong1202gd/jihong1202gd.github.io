(() => {
  'use strict';
  const heroes = Object.fromEntries([...document.querySelectorAll('.character-hero')]
    .map(element => [element.dataset.heroKind, element]));
  let hero = heroes.weapon;
  let original = hero.querySelector('.hero-original');
  let silhouette = hero.querySelector('.hero-mist');
  const glow = document.querySelector('.hero-glow');
  const canvas = document.querySelector('.hero-particles');
  const replay = document.querySelector('.reveal-replay');
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 2600;
  const effectsDelay = 1000;
  let runId = 0, frame = 0, finishTimer = 0, effectsTimer = 0, animations = [], active = false;

  function clearRun() {
    runId++;
    cancelAnimationFrame(frame);
    clearTimeout(finishTimer);
    clearTimeout(effectsTimer);
    hero.dataset.effectsReady = 'false';
    animations.forEach(animation => animation.cancel());
    animations = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hero.setAttribute('aria-busy', 'false');
  }
  function animate(element, keyframes) {
    if(element === silhouette && (hero.dataset.heroKind === 'weapon' || hero.dataset.heroKind === 'attributes')) {
      keyframes = keyframes.map(step => ({
        ...step, filter: step.filter + ' url(#weapon-silhouette-tint)'
      }));
    }
    const animation = element.animate(keyframes, {
      duration, easing: 'linear', fill: 'both'
    });
    animations.push(animation);
  }
  function particles(start, id) {
    const bounds = hero.getBoundingClientRect();
    const width = innerWidth, height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let seed = 1448;
    const random = () => {
      seed = seed * 16807 % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const stamp = document.createElement('canvas');
    stamp.width = stamp.height = 192;
    const ink = stamp.getContext('2d');
    for(let i=0;i<24;i++){
      const x=44+random()*104,y=44+random()*104,r=32+random()*42;
      const g=ink.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,'rgba(193,11,42,.13)');
      g.addColorStop(.35,'rgba(153,4,31,.10)');
      g.addColorStop(1,'rgba(91,0,22,0)');
      ink.fillStyle=g;ink.fillRect(x-r,y-r,r*2,r*2);
    }
    const clouds=Array.from({length:14},(_,i)=>{
      const side=i%3;
      return {
        fromX:side===0?-.15-random()*.15:side===1?1.15+random()*.15:.1+random()*.8,
        fromY:side===2?1.12+random()*.2:.15+random()*.85,
        x:(bounds.left+(i%4===0?.22+random()*.25:.48+random()*.4)*bounds.width)/width,
        y:(bounds.top+(.12+random()*.83)*bounds.height)/height,
        radius:.16+random()*.10,phase:random()*Math.PI*2
      };
    });
    const motes=Array.from({length:36},()=>({
      x:.1+random()*.84,y:.14+random()*.78,
      phase:random()*Math.PI*2,radius:.7+random()*1.4
    }));
    function draw(now) {
      if(id!==runId||!active||hero.dataset.revealState==='settled')return;
      const t=Math.min(1,(now-start)/duration);
      if(t>=1){ctx.clearRect(0,0,width,height);hero.dataset.revealState='settled';hero.setAttribute('aria-busy','false');return;}
      const phase=t<.10?'gathering':t<.28?'fog-cloud':
        t<.46?'silhouette':t<.84?'materializing':'dissipating';
      hero.dataset.revealState=phase;
      ctx.clearRect(0,0,width,height);
      const q=Math.min(1,t/.30),gather=1-(1-q)**3;
      const release=Math.max(0,(t-.46)/.54);
      const fogOpacity=t<.12?Math.sin(t/.12*Math.PI/2):
        t<.38?1:Math.max(0,1-(t-.38)/.62)**1.7;
      clouds.forEach(cloud=>{
        const x=(cloud.fromX+(cloud.x-cloud.fromX)*gather
          +Math.sin(cloud.phase+t*3)*.035
          +(cloud.x<.6?-1:1)*release*.17)*width;
        const y=(cloud.fromY+(cloud.y-cloud.fromY)*gather
          -release*.16+Math.cos(cloud.phase+t*3)*.02)*height;
        const radius=cloud.radius*width*(1.16-gather*.48+release*.38);
        ctx.save();
        ctx.globalAlpha=fogOpacity*.55;
        ctx.translate(x,y);ctx.rotate(Math.sin(cloud.phase+t*2)*.35);
        ctx.scale(1.3,.92);
        ctx.drawImage(stamp,-radius,-radius,radius*2,radius*2);
        ctx.restore();
      });
      const strength=Math.sin(Math.PI*t)**1.3;
      ctx.globalCompositeOperation='screen';
      motes.forEach(mote=>{
        const side=mote.x<.58?-1:1;
        const x=(mote.x-side*.18*Math.sin(gather*Math.PI/2)
          +side*release*.22+Math.sin(mote.phase+t*5)*.025)*width;
        const y=(mote.y-release*.2+Math.cos(mote.phase+t*3)*.022)*height;
        const alpha=strength*(.18+.20*Math.sin(mote.phase)**2);
        ctx.strokeStyle='rgba(240,56,83,'+alpha*.5+')';ctx.lineWidth=.65;
        ctx.beginPath();ctx.moveTo(x-side*width*.035,y+height*.03);
        ctx.quadraticCurveTo(x+width*.016,y-height*.015,x,y);ctx.stroke();
        ctx.fillStyle='rgba(255,103,123,'+alpha+')';
        ctx.beginPath();ctx.arc(x,y,mote.radius,0,Math.PI*2);ctx.fill();
      });
      ctx.globalCompositeOperation='source-over';
      if(t<1)frame=requestAnimationFrame(draw);
      else ctx.clearRect(0,0,width,height);
    }
    frame=requestAnimationFrame(draw);
  }

  async function play() {
    if(!active) return;
    clearRun();
    const id = runId;
    hero.dataset.revealState = 'loading';
    hero.dataset.revealDurationMs = String(duration);
    await Promise.allSettled([original.decode(), silhouette.decode()]);
    if(id !== runId || !active) return;
    hero.hidden = false;
    if(reduced.matches || !original.animate || !silhouette.naturalWidth) {
      hero.dataset.revealState = 'settled';
      hero.dataset.effectsReady = 'true';
      return;
    }
    hero.dataset.revealState = 'gathering';
    hero.dataset.effectsDelayMs = String(effectsDelay);
    delete hero.dataset.effectsElapsedMs;
    const effectsStart = performance.now();
    effectsTimer = setTimeout(() => {
      if (id !== runId || !active || hero.hidden) return;
      hero.dataset.effectsElapsedMs = String(Math.round(performance.now() - effectsStart));
      hero.dataset.effectsReady = 'true';
    }, effectsDelay);
    hero.setAttribute('aria-busy','true');
    animate(silhouette, [
      {offset:0,opacity:0,filter:'blur(20px)',transform:'translateY(18px) scale(.96)'},
      {offset:.27,opacity:0,filter:'blur(18px)',transform:'translateY(12px) scale(.97)'},
      {offset:.36,opacity:.82,filter:'blur(4px)',transform:'translateY(3px) scale(.995)'},
      {offset:.44,opacity:.86,filter:'blur(1px)',transform:'translateY(0) scale(1)'},
      {offset:.61,opacity:.6,filter:'blur(4px)',transform:'translateY(-5px) scale(1.025)'},
      {offset:.82,opacity:.1,filter:'blur(14px)',transform:'translateY(-20px) scale(1.075)'},
      {offset:1,opacity:0,filter:'blur(22px)',transform:'translateY(-34px) scale(1.11)'}
    ]);
    const appearance = [
      {offset:0,opacity:0,filter:'blur(7px) brightness(.88)'},
      {offset:.34,opacity:0,filter:'blur(7px) brightness(.88)'},
      {offset:.50,opacity:.6,filter:'blur(3px) brightness(.98)'},
      {offset:.72,opacity:.98,filter:'blur(.3px) brightness(1.02)'},
      {offset:.86,opacity:1,filter:'blur(0) brightness(1)'},
      {offset:1,opacity:1,filter:'blur(0) brightness(1)'}
    ];
    animate(original, appearance);
    // Flames and the temple mark follow the character. Surrounding
    // aura/orbs use the separate one-second effects timer.
    hero.querySelectorAll('.weapon-flame-layer,.attribute-anger-layer').forEach(layer => {
      animate(layer, appearance);
    });
    animate(glow, [
      {offset:0,opacity:0,transform:'scale(.92)'},
      {offset:.4,opacity:.36,transform:'scale(1)'},
      {offset:.63,opacity:.16,transform:'scale(1.06)'},
      {offset:.9,opacity:0,transform:'scale(1.15)'},
      {offset:1,opacity:0,transform:'scale(1.15)'}
    ]);
    particles(performance.now(), id);
    finishTimer = setTimeout(() => {
      if(id !== runId || !active) return;
      hero.dataset.revealState = 'settled';
      hero.setAttribute('aria-busy','false');
      animations.forEach(animation=>animation.cancel());
      animations=[];
      cancelAnimationFrame(frame);
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }, duration);
  }

  window.akoCharacterReveal = {
    select(kind) {
      clearRun();
      Object.values(heroes).forEach(element => {
        element.hidden = true;
        element.dataset.revealState = 'idle';
      });
      const next = heroes[kind];
      active = Boolean(next);
      replay.hidden = !active;
      canvas.hidden = !active;
      glow.hidden = !active;
      if(!active) return;
      hero = next;
      original = hero.querySelector('.hero-original');
      silhouette = hero.querySelector('.hero-mist');
      play();
    }
  };
  replay.addEventListener('click',play);
  reduced.addEventListener('change',()=>{if(active)play()});
})();
