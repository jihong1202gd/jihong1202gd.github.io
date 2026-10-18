(() => {
  'use strict';
  let musicStopChannel;
  try { musicStopChannel = new BroadcastChannel('jihong-portfolio-bgm'); } catch (_) {}
  function requestMusicStop() {
    try { localStorage.setItem('jihong-portfolio-bgm-v1', 'off'); } catch (_) {}
    // A distinct request also reaches tabs when the saved preference was already off.
    try { localStorage.setItem('jihong-portfolio-bgm-stop-v1', `${Date.now()}:${Math.random()}`); } catch (_) {}
    window.dispatchEvent(new Event('portfolio-bgm-stop'));
    try { musicStopChannel?.postMessage('stop'); } catch (_) {}
  }
  function bindMusicEscape(target) {
    try {
      const doc = target.document;
      if (!doc.documentElement || doc.documentElement.dataset.bgmEscapeBound) return;
      doc.documentElement.dataset.bgmEscapeBound = 'true';
      target.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !event.repeat) requestMusicStop();
      }, true);
      // Keyboard events in a frame do not bubble to the surrounding document.
      doc.addEventListener('load', event => {
        if (event.target.tagName === 'IFRAME') bindMusicEscape(event.target.contentWindow);
      }, true);
      for (const frame of doc.querySelectorAll('iframe')) bindMusicEscape(frame.contentWindow);
    } catch (_) { /* External frames keep their own keyboard controls. */ }
  }
  bindMusicEscape(window);
  const routes = new Set(['about.html', 'project-kizaki-ako.html',
    'wuthering-waves-control-analysis.html', 'study-character-making.html']);
  const openedStorageKey = 'jihong-portfolio-opened-v1';
  function recordOpenedDocument() {
    const route = location.pathname.split('/').pop();
    if (!routes.has(route)) return;
    try {
      const saved = JSON.parse(localStorage.getItem(openedStorageKey) || '[]');
      const opened = new Set((Array.isArray(saved) ? saved : []).filter(item => routes.has(item)));
      if (opened.has(route)) return;
      opened.add(route); localStorage.setItem(openedStorageKey, JSON.stringify([...opened]));
    } catch (_) {}
  }
  if (document.readyState === 'complete') recordOpenedDocument();
  else addEventListener('load', recordOpenedDocument, { once: true });
  const url = new URL(location.href);
  const file = url.pathname.split('/').pop();
  const entry = url.searchParams.get('open-portfolio');
  const arriving = routes.has(file) && url.searchParams.get('portfolio-opening') === 'sakura';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const MIN_PRESENTATION_MS = 3000;
  const INTRO_REVEAL_MS = 1150;
  const DOCUMENT_REVEAL_MS = 1000;
  const profile = url.searchParams.get('transition-profile') === '1';
  const navigationStarted = Number(url.searchParams.get('portfolio-started'));
  const navigationElapsed = Date.now()-navigationStarted;
  const elapsedBeforeArrival = navigationStarted>0 && navigationElapsed>=0 && navigationElapsed<15000 ? navigationElapsed : 0;
  const requestedMotionOff = url.searchParams.get('petal-motion') === 'off';
  let motionOff = reduced.matches || requestedMotionOff;

  function cleanAddress() {
    for (const key of ['open-portfolio', 'portfolio-opening', 'portfolio-started', 'petal-motion', 'portfolio-version']) url.searchParams.delete(key);
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
      .message{position:absolute;bottom:max(28px,calc(env(safe-area-inset-bottom) + 16px));left:16px;right:16px;display:flex;flex-direction:column;align-items:center;text-align:center;color:#bd3c69;font-family:"Malgun Gothic",sans-serif;max-height:calc(100vh - 40px);overflow:auto;padding:72px 32px 0;left:0;right:0;box-sizing:border-box;transition:opacity .18s}
      :host([data-phase="revealing"]) .message{opacity:0;pointer-events:none}
      .loading-card{position:relative;box-sizing:border-box;width:min(440px,100%);padding:18px 24px;border:1px solid #e3cbd6;border-radius:24px;background:rgba(255,255,255,.78);box-shadow:0 3px 12px #7343550a}

      .perched-beret{position:absolute;left:-48px;top:-55px;width:102px;height:70px;overflow:visible;pointer-events:none;transform-origin:76% 83%;transform:rotate(-15deg);animation:beret-breeze 2.6s ease-in-out infinite;filter:drop-shadow(0 3px 2px #73435518)}
      @keyframes beret-breeze{0%,100%{transform:rotate(-15deg)}28%{transform:rotate(calc(-15deg - var(--beret-sway,2deg)))}57%{transform:rotate(calc(-15deg + var(--beret-sway,2deg)))}78%{transform:rotate(-15deg)}}
      @media(max-width:480px){.perched-beret{width:78px;height:54px;left:-30px;top:-42px}}
      @media(prefers-reduced-motion:reduce){.perched-beret{animation:none}}
      .message span{display:block;font-size:clamp(18px,1.8vw,24px);font-weight:650;line-height:1.55;letter-spacing:.02em;word-break:keep-all}
      .loading-meter{position:relative;margin-top:14px}
      .loading-track{height:5px;overflow:hidden;border-radius:3px;background:#ecdce4}
      .loading-fill{width:100%;height:100%;transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,#ed326e,#ffb40d)}
      .loading-disc{position:absolute;right:-12px;top:50%;width:24px;height:24px;transform:translateY(-50%);pointer-events:none}
      .disc-spin{display:block;width:100%;height:100%;transform-origin:center;animation:disc-turn 1.5s linear infinite}
      @keyframes disc-turn{to{transform:rotate(360deg)}}
      @media(prefers-reduced-motion:reduce){.disc-spin{animation:none}}
      @media(prefers-reduced-motion:reduce){.loading-fill{animation:none;transition:none}}
      .recovery{display:none;margin-top:12px;gap:10px;justify-content:center;flex-wrap:wrap}
      .recovery a{padding:7px 14px;border:1px solid #ead2dc;border-radius:18px;background:#fff;color:#97556d;text-decoration:none}
      .recovery a:focus-visible{outline:3px solid #ed326e;outline-offset:3px}
      :host([data-slow]) .recovery{display:flex}
      @media print{:host{visibility:hidden}}
    </style>${!covered && !intro ? '<div class="departure-scenery" aria-hidden="true"></div>' : ''}<canvas class="white" aria-hidden="true"></canvas><canvas class="petals" aria-hidden="true"></canvas>
    ${intro ? '' : '<div class="message" role="status" aria-live="polite"><div class="loading-card"><svg class="perched-beret" viewBox="-1.05 -.8 2.1 1.45" aria-hidden="true" focusable="false"><g stroke="#b1a4ad" stroke-width=".025" stroke-linejoin="round"><ellipse cx=".03" cy=".28" rx=".66" ry=".17" transform="rotate(-3 .03 .28)" fill="#eee5e7"/><path fill="#fffdfa" d="M-.88 .16C-.87-.19-.36-.56.17-.49C.69-.44 1.02-.12.86.13C.65.35-.38.47-.81.32C-.91.29-.93.22-.88.16Z"/><path fill="none" stroke="#c9bbc3" stroke-width=".018" d="M-.74 .28C-.15 .06 .42 .02 .8 .13"/><path fill="#fffdfa" d="M-.04-.49C-.13-.57-.12-.67-.04-.65C.02-.63.02-.55.03-.49Z"/></g></svg><span>기획서를 펼치는 중</span><div class="loading-meter" aria-hidden="true"><div class="loading-track"><div class="loading-fill"></div></div><div class="loading-disc" aria-hidden="true"><svg class="disc-spin" viewBox="0 0 24 24" focusable="false"><defs><linearGradient id="disc-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fafbfc"/><stop offset=".3" stop-color="#c4cad4"/><stop offset=".52" stop-color="#fff"/><stop offset=".8" stop-color="#cdd2dc"/><stop offset="1" stop-color="#f8f8fc"/></linearGradient></defs><circle cx="12" cy="12" r="11" fill="url(#disc-metal)" stroke="#bfc1ca" stroke-width=".8"/><path d="M12 12 20.5 5A11 11 0 0 1 22.3 8.2Z" fill="#ed326e" opacity=".65"/><path d="M12 12 3.6 19.1A11 11 0 0 1 1.7 15.9Z" fill="#ffb40d" opacity=".7"/><path d="M12 12 4.1 4.4A11 11 0 0 1 7.4 2Z" fill="#fff" opacity=".75"/><circle cx="12" cy="12" r="4.7" fill="none" stroke="#aeb4c0" stroke-width=".5"/><circle cx="12" cy="12" r="2.8" fill="#fffdfa" stroke="#afb2bc" stroke-width=".7"/></svg></div></div></div><div class="recovery"><a class="direct">문서 바로 열기</a><a class="return">목차로 돌아가기</a></div></div>'}`;
    if (!intro) {
      shadow.querySelector('.message span').textContent = '기획서를 펼치는 중';
      shadow.querySelector('.direct').href = target.href;
      shadow.querySelector('.return').href = new URL('index.html', url).href;
    }
    const white = shadow.querySelector('.white'), canvas = shadow.querySelector('.petals');
    const paint = white.getContext('2d'), ctx = canvas.getContext('2d');
    const loadingFill=intro?null:shadow.querySelector('.loading-fill');let lastBar=0;
    let initialBar=.04;
    if(covered&&!intro)try {
      const saved=JSON.parse(sessionStorage.getItem('portfolio-transition-progress'));
      sessionStorage.removeItem('portfolio-transition-progress');
      if(saved&&saved.target===target.pathname&&Date.now()-saved.at>=0&&Date.now()-saved.at<15000&&Number.isFinite(saved.value))initialBar=Math.max(.04,Math.min(.9,saved.value));
    }catch(_){}
    function updateBar(value) {
      if(!loadingFill)return;
      const next=Math.max(lastBar,Math.min(1,value));
      if(next===lastBar)return;
      loadingFill.style.transform=`scaleX(${next})`;lastBar=next;
      host.dataset.loadingProgress=next.toFixed(5);
    }
    updateBar(initialBar);
    if (!paint || !ctx) throw new Error('Canvas unavailable');
    const rootStyle=document.documentElement.style;
    const savedScrollStyles=['overflow','scrollbar-gutter'].map(name=>[name,rootStyle.getPropertyValue(name),rootStyle.getPropertyPriority(name)]);
    rootStyle.setProperty('overflow','hidden');rootStyle.setProperty('scrollbar-gutter','auto');
    document.documentElement.append(host);
    let width, height, base, petals = [], frame = 0, last = 0, progress = covered ? 1 : 0;
    let disposed = false, finishTimer = 0, openingStarted = null, openingFraction = 0;
    let revealStarted = null, revealFraction = 0;
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
      host.style.setProperty('--beret-sway', (2 + gust * 10).toFixed(2) + 'deg');host.dataset.petalCount=String(activeCount);host.dataset.gust=gust.toFixed(3);
    }
    function make(initial=true,depthLayer=false) {
      return {x:initial||depthLayer?rand(-width*.1,width*1.1):rand(-Math.max(110,width*.18),-90),y:rand(-25,height+25),
        size:rand(6,Math.random()<.16?27:15),speed:rand(24,44),drift:rand(-16,-5),phase:rand(0,Math.PI*2),
        angle:rand(0,6.3),spin:rand(-.8,.8),alpha:rand(.5,.82),visibility:initial?1:0};
    }
    function carryField() {
      if(!intro)try{sessionStorage.setItem('portfolio-transition-progress',JSON.stringify({target:target.pathname,at:Date.now(),value:lastBar}));}catch(_){}
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
      if (!intro && revealStarted !== null) {
        if(revealFraction>=1)return;
        paint.save();paint.translate(width/2,height/2);paint.scale(width/2,height/2);
        const edge=1.9*(1-revealFraction)-.45;
        const inner=Math.max(0,edge-.35),outer=Math.max(.001,edge+.35);
        const alpha=Math.min(1,Math.max(0,(edge+.35)/.7));
        const fill=paint.createRadialGradient(0,0,inner,0,0,outer);
        fill.addColorStop(0,`rgba(255,255,255,${alpha})`);
        fill.addColorStop(1,'rgba(255,255,255,0)');
        paint.fillStyle=fill;paint.fillRect(-1,-1,2,2);paint.restore();return;
      }
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
      const blend=intro?Math.min(1,(1-openingFraction)/.15):1-revealFraction;
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
      } else if (revealStarted !== null) {
        const elapsed=Math.max(0,Math.min(1,(ms-revealStarted)/DOCUMENT_REVEAL_MS));
        revealFraction=smooth(elapsed);host.dataset.revealFraction=revealFraction.toFixed(4);whiten();
        if(elapsed===1){stop();return;}
      } else if (!covered && progress<1) {
        const elapsed = reduced.matches ? 1 : Math.max(0,Math.min(1,(ms-started-300)/700));
        progress=elapsed*elapsed*(3-2*elapsed);whiten();
        if (elapsed===1) {
          host.dataset.phase='covered';
        }
      }
      field(ms);
      if(!intro)updateBar(host.dataset.phase==='revealing'?1:Math.min(.9,.1+.8*((covered?elapsedBeforeArrival:0)+ms-started)/MIN_PRESENTATION_MS));
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
        const depth=.72+p.size/22;
        const vx=Math.abs(p.drift)+gust*width*.55*depth+dy*influence*1.5;
        const vy=p.speed*(1+gust*.7)-gust*height*.13*depth-dx*influence*1.5;
        const response=1-Math.exp(-dt/.18);
        p.vx=p.vx===undefined?vx:p.vx+(vx-p.vx)*response;
        p.vy=p.vy===undefined?vy:p.vy+(vy-p.vy)*response;
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle+=p.spin*(1+gust*2)*dt;p.phase+=(.7+gust*2.3)*dt;
        if(p.y>height+80||p.y< -100||p.x< -Math.max(180,width*.4)||p.x>width+80) {
          const opacity=p.visibility;p=petals[i]=make(false);p.visibility=opacity;
        }
        draw(p,ms/1000);if(p.visibility>.01)drawn++;
      }
      host.dataset.drawnCount=String(drawn);
      host.dataset.windSpeed=String(Math.round(gust*width*.55));
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
      for(const [name,value,priority] of savedScrollStyles){if(value)rootStyle.setProperty(name,value,priority);else rootStyle.removeProperty(name);}
    }
    function finish() {
      if (disposed || host.dataset.phase==='revealing') return;
      if (intro) {
        if (reduced.matches) {stop();return;}
        if (openingStarted===null) openingStarted=Math.max(performance.now(),started+MIN_PRESENTATION_MS-INTRO_REVEAL_MS);
        if (!finishTimer) finishTimer=setTimeout(stop,Math.max(0,openingStarted-performance.now())+INTRO_REVEAL_MS+400);
        return;
      }
      host.dataset.phase='revealing';updateBar(1);
      if(reduced.matches){stop();return;}
      revealStarted=performance.now();host.dataset.revealDirection='edges-to-center';
      host.style.background='transparent';shadow.querySelector('.departure-scenery')?.remove();
      whiten();finishTimer=setTimeout(stop,DOCUMENT_REVEAL_MS+400);
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

  function prewarmDocuments() {
    if(!indexPage||routes.has(entry))return;
    const connection=navigator.connection;
    if(connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType||''))return;
    const seen=new Set();
    function hint(path,as) {
      const address=new URL(path,url).href;
      if(seen.has(address))return;seen.add(address);
      const link=document.createElement('link');link.rel='prefetch';link.href=address;link.as=as;
      if(as==='font'){link.type='font/ttf';link.crossOrigin='anonymous';}
      document.head.append(link);
      document.documentElement.dataset.portfolioPrefetchCount=String(seen.size);
    }
    for(const chapter of document.querySelectorAll('a.chapter')) {
      const warm=()=>hint(chapter.getAttribute('href'),'document');
      chapter.addEventListener('pointerenter',warm,{once:true});
      chapter.addEventListener('focus',warm,{once:true});
    }
    function idleWarm() {
      if(document.getElementById('index-entry-transition')){setTimeout(idleWarm,150);return;}
      const run=()=>{
        for(const route of routes)hint(route,'document');
        hint('assets/fonts/NotoSansKR-VF.ttf','font');
      };
      if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:1800});else setTimeout(run,400);
    }
    if(document.readyState==='complete')idleWarm();else addEventListener('load',idleWarm,{once:true});
  }

  function bindChapters() {
  prewarmDocuments();
  const chapters=document.querySelectorAll('a.chapter');
  for (const link of chapters) {
    link.target='_blank';link.rel='noopener';
    link.addEventListener('auxclick', event => {
      if (event.button === 1 && !event.defaultPrevented) window.dispatchEvent(new Event('portfolio-bgm-pause'));
    });
    link.addEventListener('click',event=>{
      if(event.defaultPrevented||event.button!==0)return;
      const target=new URL(link.href);
      if(target.origin!==url.origin||!routes.has(target.pathname.split('/').pop()))return;
      window.dispatchEvent(new Event('portfolio-bgm-pause'));
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const opening=new URL('index.html',url);
      opening.searchParams.set('open-portfolio',target.pathname.split('/').pop());
      opening.searchParams.set('portfolio-version','20261018-14');
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
    let cover,frame,watchdog;
    try {
      // Keep this document and its animated cover alive until the child is ready.
      cover=createCover(false,target);
      document.documentElement.dataset.portfolioShell='loading';
      const style=document.createElement('style');
      style.textContent='html[data-portfolio-shell]{overflow:hidden;scrollbar-gutter:auto}html[data-portfolio-shell] .viewport-shell{display:none}#portfolio-document{position:fixed;inset:38px 0 0;width:100%;height:calc(100% - 38px);border:0;display:block;background:#fff;z-index:2147483646}.portfolio-print-source{position:fixed;right:max(12px,env(safe-area-inset-right));top:4px;z-index:2147483646;padding:5px 11px;border:1px solid #e3cbd6;border-radius:16px;background:rgba(255,255,255,.92);color:#745463;text-decoration:none;font:11px/1.6 \"Malgun Gothic\",sans-serif}.portfolio-print-source:focus-visible{outline:3px solid #ed326e;outline-offset:3px}@media print{.portfolio-print-source{display:none}}';
      document.head.append(style);
      const pauseIndex=()=>{
        const toggle=document.querySelector('.motion-toggle');
        if(toggle&&toggle.getAttribute('aria-pressed')==='false')toggle.click();
      };
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',pauseIndex,{once:true});else pauseIndex();
      frame=document.createElement('iframe');frame.id='portfolio-document';
      frame.title='포트폴리오 문서';frame.tabIndex=0;frame.allowFullscreen=true;
      frame.setAttribute('aria-hidden','true');frame.inert=true;
      const printSource=document.createElement('a');printSource.className='portfolio-print-source';
      printSource.textContent='인쇄용 문서 열기 ↗';printSource.href=target.href;
      printSource.target='_blank';printSource.rel='noopener';printSource.hidden=true;
      let ready=false,revealed=false;
      function printDocument(event) {
        if(!ready||event.defaultPrevented||event.altKey||(!event.ctrlKey&&!event.metaKey)||event.key.toLowerCase()!=='p')return;
        event.preventDefault();frame.contentWindow.focus();frame.contentWindow.print();
      }
      function delayedNotice() {
        cover.host.dataset.slow='';
      }
      frame.addEventListener('error',delayedNotice);
      frame.addEventListener('load',()=>{
        let doc;
        try{doc=frame.contentDocument;if(!doc?.body)throw new Error('Document unavailable');}
        catch(_){delayedNotice();return;}
        const fonts=doc.fonts?doc.fonts.ready:Promise.resolve();
        Promise.race([fonts,new Promise(resolve=>setTimeout(resolve,1200))]).then(()=>{
          ready=true;clearTimeout(watchdog);
          frame.title=doc.title||'포트폴리오 문서';
          frame.contentWindow.addEventListener('keydown',printDocument,true);
          // Keep ordinary cross-document links as top-level navigation; anchors stay inside.
          for(const link of doc.querySelectorAll('a[href]')) {
            const address=new URL(link.getAttribute('href'),target);
            if(!link.hasAttribute('download')&&(!link.target||link.target==='_self')&&address.origin===target.origin&&address.pathname!==target.pathname&&/\.html$/.test(address.pathname))link.target='_top';
          }
        });
      });
      frame.src=target.href;document.documentElement.append(frame);document.documentElement.append(printSource);
      addEventListener('keydown',printDocument,true);
      watchdog=setTimeout(delayedNotice,15000);
      function revealWhenReady() {
        if(!cover.host.isConnected)return;
        const age=Date.now()-cover.startedAt();
        if(!ready||!cover.ready()||(!reduced.matches&&age<MIN_PRESENTATION_MS-260)){
          requestAnimationFrame(revealWhenReady);return;
        }
        if(revealed)return;revealed=true;
        document.title=frame.title;
        history.replaceState(history.state,'',target);
        document.documentElement.dataset.portfolioShell='ready';
        frame.removeAttribute('aria-hidden');frame.inert=false;printSource.hidden=false;
        cover.finish();
        setTimeout(()=>frame.focus({preventScroll:true}),DOCUMENT_REVEAL_MS+60);
      }
      requestAnimationFrame(revealWhenReady);
    }catch(_){clearTimeout(watchdog);if(cover)cover.stop();location.replace(target.href);}
  }
  startOutgoing();
})();
