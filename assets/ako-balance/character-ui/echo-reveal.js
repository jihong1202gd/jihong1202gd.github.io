(() => {
  'use strict';
  const hero = document.querySelector('.echo-composition');
  if (!hero) return;
  const character = hero.querySelector('.echo-character');
  const stage = hero.querySelector('.echo-terminal-stage');
  const canvas = document.querySelector('.echo-formation');
  const ctx = canvas.getContext('2d');
  const replay = document.querySelector('.reveal-replay');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, generation = 0, frame = 0, elapsed = 0, last = 0;
  let motions = [], center = {x:0,y:0}, scale = 1;
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => {n=clamp(n);return n*n*(3-2*n);};
  function measure() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth*dpr; canvas.height = innerHeight*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const b = stage.getBoundingClientRect();
    center = {x:b.x+b.width*.5,y:b.y+b.height*.5};
    scale = b.width/335;
  }
  function clear() {ctx.clearRect(0,0,innerWidth,innerHeight);}
  function cancel() {
    generation++; cancelAnimationFrame(frame); frame=0;
    motions.forEach(m => m.cancel()); motions=[]; clear();
    hero.dataset.activeMotions='0';
  }
  function motion(el,frames,options) {
    const m=el.animate(frames,options);motions.push(m);return m;
  }
  function glow(x,y,r,a) {
    if(r<=0 || a<=0)return;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(255,249,193,${a})`);
    g.addColorStop(.2,`rgba(255,225,99,${a*.85})`);
    g.addColorStop(.55,`rgba(245,184,44,${a*.2})`);
    g.addColorStop(1,'rgba(245,184,44,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  // Circular motes spiral inward; the final warm core hands over to the real PNG.
  function draw(t) {
    clear();
    const u=(t-650)/1900;
    if(u<0 || t>3500)return;
    const fade=1-smooth((t-2530)/970);
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<28;i++) {
      const delay=(i%7)*.026;
      const p=clamp((u-delay)/(1-delay));
      const q=smooth(p), angle=i*2.399963+q*2.3;
      const radius=(130+(i%9)*23)*scale*(1-q);
      const x=center.x+Math.cos(angle)*radius;
      const y=center.y+Math.sin(angle)*radius*.82;
      const a=smooth(p*7)*(1-smooth((p-.82)/.18))*.6;
      glow(x,y,(12+(i%5)*3.8)*scale,a);
      ctx.strokeStyle=`rgba(255,224,112,${a*.65})`;
      ctx.lineWidth=.8*scale;
      ctx.beginPath();ctx.arc(x,y,(2.5+i%4)*scale,0,Math.PI*2);ctx.stroke();
    }
    const gather=smooth((t-1150)/1200);
    glow(center.x,center.y,(48+gather*68)*scale,gather*.6*fade);
    for(let j=0;j<3;j++) {
      const p=clamp((t-930-j*180)/1580);
      const r=(150*(1-smooth(p))+19)*scale;
      ctx.strokeStyle=`rgba(255,218,92,${Math.sin(p*Math.PI)*.34*fade})`;
      ctx.lineWidth=(1.1+j*.3)*scale;
      ctx.beginPath();ctx.arc(center.x,center.y,r,0,Math.PI*2);ctx.stroke();
    }
    ctx.globalCompositeOperation='source-over';
  }
  function idle() {
    const loop=(selector,frames,duration) => hero.querySelectorAll(selector).forEach(el=>motion(el,frames,{duration,iterations:Infinity,easing:'ease-in-out'}));
    loop('.echo-terminal-stage',[{transform:'translateY(0)'},{transform:'translateY(-4px)'},{transform:'translateY(0)'}],5600);
    loop('.echo-terminal-aura,.echo-lens-light',[{opacity:.5},{opacity:1},{opacity:.5}],4400);
    loop('.echo-energy-ring',[{transform:'rotate(-4deg)'},{transform:'rotate(4deg)'},{transform:'rotate(-4deg)'}],8000);
    const trail=hero.querySelector('.echo-energy-trail');
    if(trail)motion(trail,[{strokeDashoffset:'0'},{strokeDashoffset:'-1138'}],{duration:9000,iterations:Infinity});
    hero.dataset.activeMotions=String(motions.length);
  }
  function render(now) {
    elapsed+=Math.min(now-last,64);last=now;draw(elapsed);
    hero.dataset.terminalState=elapsed<650?'waiting':elapsed<1300?'gathering':elapsed<2100?'converging':elapsed<3500?'forming':'ready';
    if(elapsed>=3500) {
      hero.dataset.revealState='settled';hero.setAttribute('aria-busy','false');
      motions.forEach(m=>m.cancel());motions=[];clear();idle();frame=0;return;
    }
    frame=requestAnimationFrame(render);
  }
  async function play() {
    if(!active)return;
    cancel();const token=generation;
    hero.dataset.revealState='loading';hero.dataset.terminalState='waiting';
    hero.setAttribute('aria-busy','true');
    await Promise.all([...hero.querySelectorAll('img')].map(img=>img.decode().catch(()=>{})));
    if(token!==generation || !active)return;
    measure();elapsed=0;
    if(reduced.matches) {
      hero.dataset.revealState='settled';hero.dataset.terminalState='ready';
      hero.setAttribute('aria-busy','false');return;
    }
    hero.dataset.revealState='appearing';
    motion(character,[{opacity:0},{opacity:1}],{duration:1100,easing:'cubic-bezier(.2,.65,.3,1)',fill:'both'});
    motion(stage,[{opacity:0,filter:'brightness(2.8) sepia(1) saturate(1.5) drop-shadow(0 0 18px #ffda64)'},{opacity:1,filter:'brightness(1.8) sepia(.7) saturate(1.3) drop-shadow(0 0 12px #ffda64)',offset:.45},{opacity:1,filter:'none'}],{delay:2100,duration:1100,easing:'ease-out',fill:'both'});
    hero.dataset.activeMotions=String(motions.length);
    last=performance.now();if(!document.hidden)frame=requestAnimationFrame(render);
  }
  window.akoEchoReveal={select(visible){
    active=visible;cancel();hero.hidden=!visible;canvas.hidden=!visible;
    hero.dataset.revealState='idle';hero.dataset.terminalState='waiting';
    if(visible){replay.hidden=false;play();}
  }};
  replay.addEventListener('click',play);
  addEventListener('resize',()=>{if(active)measure();});
  document.addEventListener('visibilitychange',()=>{
    cancelAnimationFrame(frame);frame=0;
    motions.forEach(m=>document.hidden?m.pause():m.play());
    if(active&&!document.hidden&&!reduced.matches&&hero.dataset.revealState==='appearing'){
      last=performance.now();frame=requestAnimationFrame(render);
    }
  });
  reduced.addEventListener('change',()=>{if(active)play();});
  if(document.body.classList.contains('echo-preview'))window.akoEchoReveal.select(true);
})();
