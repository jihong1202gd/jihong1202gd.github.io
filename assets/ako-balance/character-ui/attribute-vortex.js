(() => {
  'use strict';
  const hero = document.querySelector('.character-hero[data-hero-kind="attributes"]');
  const layer = hero.querySelector('.attribute-orb-surfaces');
  const canvases = [...layer.querySelectorAll('.attribute-vortex-canvas')];
  const contexts = canvases.map(canvas => canvas.getContext('2d'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const surface = document.createElement('canvas');
  const gl = surface.getContext('webgl', {
    alpha:true, antialias:false, premultipliedAlpha:false,
    preserveDrawingBuffer:true, depth:false, stencil:false
  });
  if (!gl) {
    hero.dataset.vortexRenderer = 'unavailable';
    console.warn('Attribute vortex: WebGL unavailable');
    return;
  }
  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {uv=position*.5+.5; gl_Position=vec4(position,0.,1.);}
  `;
  const fragment = `
    precision highp float;
    varying vec2 uv;
    uniform float time;
    uniform float side;
    uniform vec4 orbs[3];
    float hash(vec3 p) {
      p=fract(p*.3183099+vec3(.17,.31,.43)); p*=17.;
      return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
    }
    float noise(vec3 p) {
      vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
      return mix(
        mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
            mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
            mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    float fbm(vec3 p) {
      float value=0., weight=.53;
      for(int i=0;i<4;i++) {
        value+=weight*noise(p);
        p=p*2.03+vec3(7.1,3.2,5.7); weight*=.49;
      }
      return value;
    }
    mat2 rotate(float a) {return mat2(cos(a),-sin(a),sin(a),cos(a));}
    // Ragged spiral arcs, on independent tilted planes. The angular life mask
    // lets each arc form, wind inward/outward and dissolve instead of a rigid ring.
    vec3 coil(vec2 point, float t, float seed, float turbulence) {
      float direction=mod(seed,2.)<1.?1.:-1.;
      float roll=seed*1.91+t*(.32+seed*.019)*direction+
        sin(t*.27+seed)*.29;
      vec2 p=rotate(roll)*point;
      float flatten=.48+.21*sin(t*.31+seed*2.3);
      p.y/=flatten;
      float angle=atan(p.y,p.x);
      float progress=fract(angle/6.2831853*direction-t*(.18+seed*.012)+seed*.319);
      float radius=.82+progress*.98+.17*sin(angle*3.+t*.93+seed)+
        (turbulence-.5)*.36;
      // Independent irregular pulses: width, density and color share
      // the same compression value, so thickening also looks heavier/darker.
      float surge=pow(clamp(
        .58*sin(t*.87+seed*1.83)+.28*sin(t*1.51+seed*.61)+
        .22*sin(t*.37+seed*2.7),0.,1.),3.);
      float width=(.09+.10*(.5+.5*sin(angle*4.-t*.83+seed)))*
        (1.+surge*1.7);
      float d=(length(p)-radius)/width;
      float life=smoothstep(0.,.17,progress)*(1.-smoothstep(.74,1.,progress));
      float ribbon=exp(-d*d*1.2)*life;
      float haze=exp(-d*d*.21)*life*.24;
      float density=(ribbon+haze)*(.4+turbulence*.85)*(1.+surge*1.55);
      float front=smoothstep(-.22,.28,sin(angle)*cos(roll*.53));
      return vec3(density*(1.-front),density*front,density*surge);
    }
    void main() {
      vec2 world=vec2(-60.+uv.x*700.,-80.+(1.-uv.y)*700.);
      float t=time;
      vec3 advect=vec3(world/91.+vec2(t*.11,-t*.17),t*.15);
      float n=fbm(advect);
      float fine=fbm(advect*2.31+vec3(3.,t*.17,11.));
      vec2 curl=(vec2(n,fine)-.5)*18.;
      vec3 density=vec3(0.);
      float sphereMask=1.;
      for(int i=0;i<3;i++) {
        vec4 orb=orbs[i];
        vec2 p=(world-orb.xy-vec2(0.,8.)+curl)/(59.*orb.z);
        for(int axis=0;axis<3;axis++) {
          float k=float(axis)+float(i)*3.;
          density+=coil(p,t,k+1.,n)*.58;
        }
        // Preserve the matte blood-sphere surface; the turbulent layers curl
        // around its perimeter rather than putting a moving specular mark on it.
        sphereMask*=smoothstep(39.*orb.z,48.*orb.z,length(world-orb.xy));
      }
      // A wider independent vortex is centered over the raised palm. Its
      // counter-rotating streams overlap those travelling with the three orbs.
      vec2 hand=(world-vec2(158.,350.)+curl*1.4)/100.;
      for(int i=0;i<4;i++) {
        float k=float(i);
        density+=coil(hand,t*.84,k+11.,fine)*.42;
      }
      vec2 field=(world-vec2(245.,258.))/213.;
      float envelope=exp(-dot(field,field)*1.35);
      density+=vec3(.13,.07,0.)*envelope*smoothstep(.33,.7,n);
      float amount=mix(density.x,density.y,side);
      amount*=mix(1.,sphereMask,side);
      float boundary=smoothstep(-60.,-15.,world.x)*(1.-smoothstep(535.,635.,world.x))*
        smoothstep(-80.,-25.,world.y)*(1.-smoothstep(520.,610.,world.y));
      amount*=boundary;
      float filament=exp(-abs(n+fine*.19-.58)*65.);
      float compression=clamp(density.z/max(density.x+density.y,.01),0.,1.);
      vec3 color=mix(vec3(.47,.006,.02),vec3(.96,.027,.018),fine);
      color+=vec3(.82,.12,.025)*filament;
      color*=mix(vec3(1.),vec3(.62,.48,.52),compression*.8);
      float alpha=clamp(1.-exp(-amount*1.1),0.,mix(.64,.6,side)+compression*.18);
      gl_FragColor=vec4(color,alpha);
    }`;
  function compile(type, source) {
    const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  const program=gl.createProgram();
  gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const clock=gl.getUniformLocation(program,'time');
  const pass=gl.getUniformLocation(program,'side');
  const sources=gl.getUniformLocation(program,'orbs[0]');
  let count=0, latest;
  function measure() {
    const bounds=canvases[0].getBoundingClientRect();
    if(!bounds.width||!bounds.height) return;
    const ratio=Math.min(Math.max(devicePixelRatio||1,1.5),2);
    const width=Math.ceil(bounds.width*ratio),height=Math.ceil(bounds.height*ratio);
    for(const canvas of [...canvases,surface]) {
      if(canvas.width!==width||canvas.height!==height) {canvas.width=width;canvas.height=height;}
    }
    gl.viewport(0,0,width,height);
  }
  function render(time,orbs) {
    latest={time,orbs};
    if(hero.hidden || !surface.width || !orbs?.length) return;
    gl.uniform1f(clock,time);
    gl.uniform4fv(sources,new Float32Array(orbs.flatMap(orb=>[orb.x,orb.y,orb.scale,orb.depth])));
    canvases.forEach((canvas,i)=>{
      gl.uniform1f(pass,i); gl.drawArrays(gl.TRIANGLES,0,6);
      contexts[i].clearRect(0,0,canvas.width,canvas.height);
      contexts[i].drawImage(surface,0,0);
    });
    hero.dataset.vortexFrame=String(++count);
    hero.dataset.vortexTime=time.toFixed(3);
  }
  function sync() {
    const active=!hero.hidden && hero.dataset.effectsReady==='true' && !document.hidden;
    hero.dataset.vortexMotion=active?(reduced.matches?'still':'running'):'paused';
    if(active) {measure(); if(latest) render(latest.time,latest.orbs);}
  }
  window.akoAttributeVortex={render};
  hero.dataset.vortexRenderer='procedural-counter-vortices';
  new ResizeObserver(()=>{measure();if(latest&&!hero.hidden)render(latest.time,latest.orbs);}).observe(layer);
  new MutationObserver(sync).observe(hero,{attributes:true,attributeFilter:['hidden','data-reveal-state','data-effects-ready']});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  measure();sync();
})();
