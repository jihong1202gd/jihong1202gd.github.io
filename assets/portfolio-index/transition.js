(() => {
  'use strict';
  const routes = new Set(['about.html', 'project-kizaki-ako.html',
    'wuthering-waves-control-analysis.html', 'study-character-making.html']);
  const url = new URL(location.href);
  const file = url.pathname.split('/').pop();
  const entry = url.searchParams.get('open-portfolio');
  const arriving = routes.has(file) && url.searchParams.get('portfolio-opening') === 'sakura';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const MIN_PRESENTATION_MS = 3000;
  const INTRO_REVEAL_MS = 1150;
  const profile = url.searchParams.get('transition-profile') === '1';
  const navigationStarted = Number(url.searchParams.get('portfolio-started'));
  const navigationElapsed = Date.now()-navigationStarted;
  const elapsedBeforeArrival = navigationStarted>0 && navigationElapsed>=0 && navigationElapsed<15000 ? navigationElapsed : 0;
  const requestedMotionOff = url.searchParams.get('petal-motion') === 'off';
  let motionOff = reduced.matches || requestedMotionOff;

  function cleanAddress() {
    for (const key of ['open-portfolio', 'portfolio-opening', 'portfolio-started', 'petal-motion']) url.searchParams.delete(key);
    history.replaceState(history.state, '', url);
  }

  function createCover(covered, target, intro = false) {
    const host = document.createElement('div');
    host.id = intro ? 'index-entry-transition' : 'portfolio-transition';
    host.dataset.phase = intro ? 'waiting' : covered ? 'loading' : 'closing';
    host.dataset.minimumMs = String(MIN_PRESENTATION_MS);
    host.dataset.backdrop = !covered && !intro ? 'hill' : 'white';
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:block;'+(!covered&&!intro?'background:#fff;':'');
    const shadow = host.attachShadow({mode: 'open'});
    shadow.innerHTML = `<style>
      :host{color-scheme:light;font:13px/1.6 system-ui,sans-serif}
      .departure-scenery{position:absolute;inset:0;overflow:hidden;background:#fff}
      .departure-scenery img{position:absolute;bottom:0;left:50%;width:max(110vw,160vh);height:auto;max-width:none;transform:translateX(-50%)}
      canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
      .message{position:absolute;bottom:max(28px,env(safe-area-inset-bottom));left:18px;right:18px;text-align:center;color:#9b7183;font-size:12px;letter-spacing:.04em}
      .message span{padding:5px 12px;background:#ffffffd9;border-radius:16px}
      .recovery{display:none;margin-top:12px;gap:10px;justify-content:center;flex-wrap:wrap}
      .recovery a{padding:7px 14px;border:1px solid #ead2dc;border-radius:18px;background:#fff;color:#97556d;text-decoration:none}
      .recovery a:focus-visible{outline:3px solid #ed326e;outline-offset:3px}
      :host([data-slow]) .recovery{display:flex}
      @media print{:host{visibility:hidden}}
    </style>${!covered && !intro ? '<div class="departure-scenery" aria-hidden="true"></div>' : ''}<canvas class="white" aria-hidden="true"></canvas><canvas class="petals" aria-hidden="true"></canvas>
    ${intro ? '' : '<div class="message" role="status" aria-live="polite"><span>포트폴리오를 여는 중</span><div class="recovery"><a class="direct">문서 바로 열기</a><a class="return">목차로 돌아가기</a></div></div>'}`;
    if (!intro) {
      shadow.querySelector('.message span').textContent = '포트폴리오를 여는 중';
      shadow.querySelector('.direct').href = target.href;
      shadow.querySelector('.return').href = new URL('index.html', url).href;
    }
    const white = shadow.querySelector('.white'), canvas = shadow.querySelector('.petals');
    const paint = white.getContext('2d'), ctx = canvas.getContext('2d');
    if (!paint || !ctx) throw new Error('Canvas unavailable');
    document.documentElement.append(host);
    let width, height, base, petals = [], frame = 0, last = 0, progress = covered ? 1 : 0;
    let disposed = false, finishTimer = 0, openingStarted = null, openingFraction = 0;
    let originalPetals = null;
    let started = performance.now(),departureReady=covered||intro||reduced.matches,imageTimer=0;
    const frameTimes=[],drawTimes=[];let previousProfileFrame=0;
    function profileReport() {
      if(!profile)return;
      const sorted=[...frameTimes].sort((a,b)=>a-b),sum=frameTimes.reduce((a,b)=>a+b,0);
      const result={mode:intro?'index':covered?'document':'departure',width,height,
        samples:frameTimes.length,fps:sum?1000*frameTimes.length/sum:0,
        p95FrameMs:sorted[Math.floor((sorted.length-1)*.95)]||0,
        framesOver33Ms:frameTimes.filter(x=>x>33.4).length,
        averageDrawMs:drawTimes.length?drawTimes.reduce((a,b)=>a+b,0)/drawTimes.length:0,
        peakDrawMs:drawTimes.length?Math.max(...drawTimes):0};
      const report=document.createElement('script');report.type='application/json';report.id='transition-performance';
      report.textContent=JSON.stringify(result);document.documentElement.append(report);
    }
    const rand = (a, b) => a + Math.random() * (b - a);
    const smooth = u => {u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
    let activeCount=0, gust=0, petalScale=1, journey=0;
    let savedField=null;
    if(covered&&!intro&&!motionOff)try {
      const saved=JSON.parse(sessionStorage.getItem('portfolio-transition-field'));
      sessionStorage.removeItem('portfolio-transition-field');
      if(saved&&saved.target===target.pathname&&Date.now()-saved.at>=0&&Date.now()-saved.at<15000&&Array.isArray(saved.petals))savedField=saved;
    }catch(_){}
    // Paint one tile per cover; dense gusts reuse it instead of allocating gradients each frame.
    const sprite=document.createElement('canvas');sprite.width=72;sprite.height=72;
    const tile=sprite.getContext('2d');tile.translate(36,36);tile.scale(32,32);
    const pink=tile.createLinearGradient(-1,-1,1,1);
    pink.addColorStop(0,'#ffe8f1');pink.addColorStop(.45,'#f5a5c2');pink.addColorStop(1,'#e475a0');
    tile.fillStyle=pink;tile.beginPath();tile.moveTo(0,1);tile.bezierCurveTo(-1.1,.4,-.9,-.8,-.28,-1);
    tile.lineTo(0,-.68);tile.lineTo(.25,-.98);tile.bezierCurveTo(.95,-.55,.8,.55,0,1);tile.fill();
    function field(ms) {
      const age=Math.max(0,ms-started);
      journey=intro?(openingStarted===null||ms<openingStarted?
        Math.min(.73,age/(MIN_PRESENTATION_MS-INTRO_REVEAL_MS)*.73):.73+.27*openingFraction):
        Math.min(1,((covered?elapsedBeforeArrival:0)+age)/2200);
      gust=intro?1-smooth(journey):smooth(journey);
      const peak=intro?base*5:Math.min(1600,Math.max(base*10,Math.round(width*height/900)));
      activeCount=motionOff?0:Math.round(base+(peak-base)*gust);
      petalScale=intro?1+gust*.45:1;
      // Depth layers emerge across the whole field as the shared wind strengthens.
      if(!motionOff)while(petals.length<activeCount)petals.push(make(false,true));
      host.dataset.petalCount=String(activeCount);host.dataset.gust=gust.toFixed(3);
    }
    function make(initial=true,depthLayer=false) {
      return {x:initial||depthLayer?rand(-width*.1,width*1.1):rand(-Math.max(110,width*.18),-90),y:rand(-25,height+25),
        size:rand(6,Math.random()<.16?27:15),speed:rand(24,44),drift:rand(-16,-5),phase:rand(0,Math.PI*2),
        angle:rand(0,6.3),spin:rand(-.8,.8),alpha:rand(.5,.82),visibility:initial?1:0};
    }
    function carryField() {
      if(intro||motionOff)return;
      try{sessionStorage.setItem('portfolio-transition-field',JSON.stringify({target:target.pathname,at:Date.now(),width,height,petals}));}catch(_){}
    }
    function resize() {
      const oldWidth=width,oldHeight=height;
      width = Math.max(1, innerWidth); height = Math.max(1, innerHeight);
      base = width < 700 ? 26 : 44;
      const dpr = Math.min(devicePixelRatio || 1, 2, Math.sqrt(16000000/(width*height)));
      for (const surface of [white, canvas]) {
        surface.width = Math.max(1,Math.round(width*dpr));
        surface.height = Math.max(1,Math.round(height*dpr));
        surface.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
      }
      if(savedField) {
        petals=savedField.petals.slice(0,1600).map(p=>({...p,x:p.x*width/savedField.width,y:p.y*height/savedField.height}));
        host.dataset.continuity='restored';savedField=null;
      } else if(oldWidth&&oldHeight) {
        for(const p of petals){p.x*=width/oldWidth;p.y*=height/oldHeight;}
      } else {
        petals=Array.from({length:motionOff?0:base*(intro?5:1)},()=>make());
      }
      if(motionOff)petals=[];
      field(performance.now());
      host.dataset.baseCount = String(base);
      whiten();
    }
    function whiten() {
      paint.clearRect(0,0,width,height);
      if (progress >= 1) {paint.fillStyle='#fff';paint.fillRect(0,0,width,height);return;}
      if (progress <= 0) return;
      paint.save();paint.translate(width/2,height/2);paint.scale(width/2,height/2);
      const hole = 1.8*(1-progress)-.35, outer = Math.max(.001,hole+.35);
      const fill = paint.createRadialGradient(0,0,Math.max(0,hole),0,0,outer);
      fill.addColorStop(0,`rgba(255,255,255,${Math.max(0,-hole/.35)})`);
      fill.addColorStop(1,'#fff');paint.fillStyle=fill;paint.fillRect(-1,-1,2,2);paint.restore();
    }
    function draw(p, t) {
      ctx.save();ctx.translate(p.x+Math.sin(p.phase)*18,p.y);ctx.rotate(p.angle);
      const size=p.size*petalScale;
      ctx.scale(size,size*(Math.cos(p.phase*1.3)*.3+.7));
      const blend=intro?Math.min(1,(1-openingFraction)/.15):1;
      ctx.globalAlpha=Math.min(.95,p.alpha+gust*(intro?0:.12))*blend*p.visibility;
      ctx.drawImage(sprite,-1.125,-1.125,2.25,2.25);ctx.restore();
    }
    function drawBeret(ms) {
      if (!intro || motionOff) return;
      const t=(ms-started)/1000,u=journey;
      const cubic=(a,b,c,d,v)=>{const q=1-v;return q*q*q*a+3*q*q*v*b+3*q*v*v*c+v*v*v*d;};
      let x,y,turn;
      if(u<.25) {
        const v=u/.25;
        x=cubic(-.14,.04,.26,.50,v)*width;y=cubic(.66,.67,.60,.50,v)*height;
        turn=-.25+v*.1;
      } else if(u<.50) {
        const v=(u-.25)/.25;
        x=cubic(.50,.76,.74,.52,v)*width;y=cubic(.50,.30,.08,.10,v)*height;
        turn=-.15-v*2.8;
      } else if(u<.73) {
        const v=(u-.50)/.23;
        x=cubic(.52,.20,.18,.50,v)*width;y=cubic(.10,.02,.33,.50,v)*height;
        turn=-2.95-v*3;
      } else {
        const v=(u-.73)/.27;
        x=cubic(.50,.72,.87,1.15,v)*width;y=cubic(.50,.59,.41,.37,v)*height;
        turn=-5.95+v*.5;
      }
      // Perspective follows screen position, so both centre crossings grow equally.
      const distance=((x/width-.5)/.30)**2+((y/height-.5)/.32)**2;
      const sizeFactor=1.25+3.8*Math.exp(-distance*1.25);
      host.dataset.beretX=x.toFixed(1);host.dataset.beretY=y.toFixed(1);host.dataset.beretScale=sizeFactor.toFixed(3);
      const size=Math.max(76,Math.min(160,width*.20))*sizeFactor;
      ctx.save();ctx.translate(x,y);ctx.rotate(turn+Math.sin(t*3)*.08);
      ctx.scale(size/2,size/2*(.85+Math.cos(t*2.8)*.1));
      ctx.lineWidth=.025;ctx.strokeStyle='#b1a4ad';ctx.lineJoin='round';
      ctx.shadowColor='rgba(143,100,119,.14)';ctx.shadowBlur=12;ctx.shadowOffsetY=5;
      ctx.fillStyle='#eee5e7';ctx.beginPath();ctx.ellipse(.03,.28,.66,.17,-.05,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.shadowBlur=0;ctx.shadowOffsetY=0;
      ctx.fillStyle='#fffdfa';ctx.beginPath();ctx.moveTo(-.88,.16);
      ctx.bezierCurveTo(-.87,-.19,-.36,-.56,.17,-.49);
      ctx.bezierCurveTo(.69,-.44,1.02,-.12,.86,.13);
      ctx.bezierCurveTo(.65,.35,-.38,.47,-.81,.32);
      ctx.bezierCurveTo(-.91,.29,-.93,.22,-.88,.16);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#c9bbc3';ctx.lineWidth=.018;ctx.beginPath();ctx.moveTo(-.74,.28);
      ctx.bezierCurveTo(-.15,.06,.42,.02,.8,.13);ctx.stroke();
      ctx.strokeStyle='#b1a4ad';ctx.lineWidth=.025;ctx.fillStyle='#fffdfa';ctx.beginPath();
      ctx.moveTo(-.04,-.49);ctx.bezierCurveTo(-.13,-.57,-.12,-.67,-.04,-.65);
      ctx.bezierCurveTo(.02,-.63,.02,-.55,.03,-.49);ctx.fill();ctx.stroke();ctx.restore();
    }
    function render(ms) {
      if (disposed || document.hidden) {frame=0;last=0;return;}
      if(!departureReady){frame=requestAnimationFrame(render);return;}
      const drawStarted=profile?performance.now():0;
      if(profile&&previousProfileFrame)frameTimes.push(ms-previousProfileFrame);
      previousProfileFrame=ms;
      const dt=last?Math.min((ms-last)/1000,.06):0;last=ms;
      if (intro && openingStarted !== null) {
        const elapsed=Math.max(0,Math.min(1,(ms-openingStarted)/INTRO_REVEAL_MS));
        openingFraction=elapsed*elapsed*(3-2*elapsed);
        progress=1-openingFraction;whiten();
        host.dataset.phase='opening';
        if (elapsed===1) {stop();return;}
      } else if (!covered && progress<1) {
        const elapsed = reduced.matches ? 1 : Math.max(0,Math.min(1,(ms-started-300)/700));
        progress=elapsed*elapsed*(3-2*elapsed);whiten();
        if (elapsed===1) {
          host.dataset.phase='covered';
        }
      }
      field(ms);
      if(intro&&originalPetals&&openingFraction>.85)originalPetals.hidden=false;
      ctx.clearRect(0,0,width,height);
      let drawn=0;
      const swirl=intro?(journey>.25&&journey<.73?Math.sin((journey-.25)/.48*Math.PI):0):gust*.65;
      for(let i=0;i<petals.length;i++) {
        let p=petals[i];
        const targetAlpha=!motionOff&&i<activeCount?1:0;
        p.visibility+=(targetAlpha-p.visibility)*(1-Math.exp(-dt/.40));
        if(p.visibility<.002&&targetAlpha===0)continue;
        const dx=p.x-width*.50,dy=p.y-height*.30;
        const influence=swirl*Math.exp(-((dx/(width*.4))**2+(dy/(height*.45))**2));
        const vx=p.drift+gust*width*.20+dy*influence*1.5;
        const vy=p.speed-gust*height*.10-dx*influence*1.5;
        p.x+=vx*dt;p.y+=vy*dt;p.angle+=p.spin*(1+gust*2)*dt;p.phase+=(.7+gust)*dt;
        if(p.y>height+80||p.y< -100||p.x< -Math.max(180,width*.4)||p.x>width+80) {
          const opacity=p.visibility;p=petals[i]=make(false);p.visibility=opacity;
        }
        draw(p,ms/1000);if(p.visibility>.01)drawn++;
      }
      host.dataset.drawnCount=String(drawn);
      drawBeret(ms);
      if(profile)drawTimes.push(performance.now()-drawStarted);
      frame=requestAnimationFrame(render);
    }
    function visibility() {previousProfileFrame=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else if(!frame&&!disposed)frame=requestAnimationFrame(render);}
    function stop() {
      if (disposed) return;disposed=true;cancelAnimationFrame(frame);clearTimeout(slowTimer);clearTimeout(finishTimer);clearTimeout(imageTimer);
      removeEventListener('resize',resize);reduced.removeEventListener('change',motionPreference);
      document.removeEventListener('visibilitychange',visibility);
      document.removeEventListener('DOMContentLoaded',hideOriginalPetals);
      if (originalPetals) originalPetals.hidden=false;
      profileReport();host.remove();
    }
    function finish() {
      if (disposed || host.dataset.phase==='revealing') return;
      if (intro) {
        if (reduced.matches) {stop();return;}
        if (openingStarted===null) openingStarted=Math.max(performance.now(),started+MIN_PRESENTATION_MS-INTRO_REVEAL_MS);
        if (!finishTimer) finishTimer=setTimeout(stop,Math.max(0,openingStarted-performance.now())+INTRO_REVEAL_MS+400);
        return;
      }
      host.dataset.phase='revealing';
      if(reduced.matches){stop();return;}
      const animation=host.animate([{opacity:1},{opacity:0}],{duration:260,fill:'forwards'});
      animation.finished.then(stop,stop);finishTimer=setTimeout(stop,400);
    }
    const slowTimer=intro?0:setTimeout(()=>{host.dataset.slow='';shadow.querySelector('.message span').textContent='연결이 늦어지고 있어요';},8000);
    function hideOriginalPetals() {if(intro&&!disposed){originalPetals=document.getElementById('petals');if(originalPetals)originalPetals.hidden=true;}}
    function motionPreference() {
      motionOff=reduced.matches||requestedMotionOff;
      if(intro&&reduced.matches){stop();return;}
      if(reduced.matches&&!departureReady){clearTimeout(imageTimer);departureReady=true;started=performance.now();last=0;}
      resize();
    }
    addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',visibility);
    reduced.addEventListener('change',motionPreference);
    if (intro) {hideOriginalPetals();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hideOriginalPetals,{once:true});}
    resize();frame=requestAnimationFrame(render);
    if(!departureReady) {
      host.dataset.phase='preparing';
      const image=document.createElement('img');
      const prepared=ok=>{
        if(disposed||departureReady)return;
        clearTimeout(imageTimer);departureReady=true;started=performance.now();last=0;previousProfileFrame=0;
        if(ok)shadow.querySelector('.departure-scenery').append(image);
        host.dataset.backgroundReady=ok?'decoded':'fallback';host.dataset.phase='closing';
      };
      const loaded=()=>{
        if(typeof image.decode==='function')image.decode().then(()=>prepared(true),()=>prepared(false));
        else prepared(true);
      };
      imageTimer=setTimeout(()=>prepared(false),4000);
      image.addEventListener('load',loaded,{once:true});image.addEventListener('error',()=>prepared(false),{once:true});
      image.alt='';
      image.src=new URL('assets/portfolio-index/sakura-hill-4x.webp',url).href;
      if(image.complete&&image.naturalWidth>0)loaded();
    }
    return {host,finish,stop,carryField,ready:()=>departureReady&&progress>=1,
      startedAt:()=>Date.now()-(performance.now()-started)};
  }

  if (arriving) {
    cleanAddress();
    let cover;
    try {
      cover=createCover(true,url);
      const earliestReveal = performance.now() + (reduced.matches ? 0 : Math.max(0,MIN_PRESENTATION_MS-elapsedBeforeArrival-260));
      const watchdog=setTimeout(()=>cover.finish(),15000);
      const ready=()=>{
        const fonts=document.fonts?document.fonts.ready:Promise.resolve();
        Promise.race([fonts,new Promise(resolve=>setTimeout(resolve,1200))]).then(()=>{
          clearTimeout(watchdog);setTimeout(()=>cover.finish(),Math.max(0,earliestReveal-performance.now()));
        });
      };
      if(document.readyState==='complete')ready();else addEventListener('load',ready,{once:true});
      addEventListener('pageshow',event=>{if(event.persisted)cover.stop();});
    } catch (_) {if(cover)cover.stop();document.getElementById('portfolio-transition')?.remove();}
    return;
  }

  const indexPage=file===''||file==='index.html';
  if (indexPage && !routes.has(entry) && !reduced.matches) {
    let intro;
    try {
      intro=createCover(true,url,true);
      const watchdog=setTimeout(()=>intro.finish(),4500);
      const ready=()=>{
        const fonts=document.fonts?document.fonts.ready:Promise.resolve();
        Promise.race([fonts,new Promise(resolve=>setTimeout(resolve,800))]).then(()=>{clearTimeout(watchdog);intro.finish();});
      };
      if(document.readyState==='complete')ready();else addEventListener('load',ready,{once:true});
      addEventListener('pageshow',event=>{if(event.persisted)intro.stop();});
    } catch (_) {if(intro)intro.stop();document.getElementById('index-entry-transition')?.remove();}
  }

  function bindChapters() {
  const chapters=document.querySelectorAll('a.chapter');
  for (const link of chapters) {
    link.target='_blank';link.rel='noopener';
    link.addEventListener('click',event=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const target=new URL(link.href);
      if(target.origin!==url.origin||!routes.has(target.pathname.split('/').pop()))return;
      const opening=new URL('index.html',url);
      opening.searchParams.set('open-portfolio',target.pathname.split('/').pop());
      if(reduced.matches||document.querySelector('#petals')?.dataset.motion==='paused')opening.searchParams.set('petal-motion','off');
      if(profile)opening.searchParams.set('transition-profile','1');
      const original=link.getAttribute('href');link.href=opening.href;
      setTimeout(()=>link.setAttribute('href',original),0);
    });
  }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindChapters,{once:true});else bindChapters();

  if (!routes.has(entry)) return;
  function startOutgoing() {
  const target=new URL(entry,url);cleanAddress();
  // Warm only the HTML during the closing animation; assets load normally in the real document.
  const prefetch=document.createElement('link');prefetch.rel='prefetch';prefetch.href=target.href;document.head.append(prefetch);
  let cover;
  try {
    const existing=document.getElementById('petals');if(existing)existing.hidden=true;
    cover=createCover(false,target);
    function handoff() {
      if(!cover.ready()){requestAnimationFrame(handoff);return;}
      const destination=new URL(target);destination.searchParams.set('portfolio-opening','sakura');
      destination.searchParams.set('portfolio-started',String(cover.startedAt()));
      if(motionOff)destination.searchParams.set('petal-motion','off');
      if(profile)destination.searchParams.set('transition-profile','1');
      requestAnimationFrame(()=>{cover.carryField();location.replace(destination.href);});
    }
    requestAnimationFrame(handoff);
  } catch (_) {if(cover)cover.stop();location.replace(target.href);}
  }
  // The opaque hill cover is mounted in the head, before index content can paint.
  startOutgoing();
})();
