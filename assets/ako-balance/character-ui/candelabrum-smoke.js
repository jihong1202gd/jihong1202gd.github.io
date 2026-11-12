(() => {
  'use strict';
  const hero = document.querySelector('.character-hero[data-hero-kind="weapon"]');
  const art = hero.querySelector('.hero-original');
  const back = hero.querySelector('.weapon-smoke-back');
  const front = hero.querySelector('.weapon-smoke-front');
  const backContext = back.getContext('2d');
  const frontContext = front.getContext('2d');
  const surface = document.createElement('canvas');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const region = {x: -35, y: 120, width: 560, height: 555};
  const gl = surface.getContext('webgl', {
    alpha: true, antialias: false, premultipliedAlpha: false,
    preserveDrawingBuffer: true, depth: false, stencil: false
  });
  if (!gl) {
    hero.dataset.smokeRenderer = 'unavailable';
    console.warn('Candelabrum smoke: WebGL unavailable');
    return;
  }
  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = position * .5 + .5;
      gl_Position = vec4(position, 0., 1.);
    }`;
  const fragment = `
    precision highp float;
    varying vec2 uv;
    uniform float time;
    uniform float side;
    float hash(vec3 p) {
      p = fract(p * .3183099 + vec3(.17, .31, .43));
      p *= 17.;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }
    float noise(vec3 p) {
      vec3 i = floor(p), f = fract(p);
      f = f * f * (3. - 2. * f);
      return mix(
        mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
    }
    float fbm(vec3 p) {
      float v = 0., a = .53;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.03 + vec3(7.1, 3.2, 5.7);
        a *= .49;
      }
      return v;
    }
    float cloud(vec2 p, vec2 center, vec2 radius) {
      vec2 d = (p - center) / radius;
      return exp(-dot(d,d) * 1.7);
    }
    void main() {
      vec2 world = vec2(-35. + uv.x * 560., 120. + (1. - uv.y) * 555.);
      vec2 p = vec2((world.x - 244.) / 180., (620. - world.y) / 370.);
      float t = time;
      // Advected 3D noise and local curls change the density field itself:
      // there is no moving image rectangle or fixed texture silhouette.
      vec3 travel = vec3(p * vec2(2.2,2.9) - vec2(0., t*.23), t*.105);
      vec2 warp = vec2(fbm(travel), fbm(travel+vec3(11.3,3.7,7.9))) - .5;
      vec2 q = p + warp * .62;
      vec2 left = q - vec2(-.48,.57), right = q - vec2(.47,.68);
      q += vec2(-left.y,left.x) * exp(-dot(left,left)*6.) * sin(t*.47+.7) * .23;
      q -= vec2(-right.y,right.x) * exp(-dot(right,right)*6.) * sin(t*.39+1.8) * .2;
      float envelope =
          cloud(q, vec2(-.54,.77), vec2(.47,.32)) * .95
        + cloud(q, vec2(.0,.99), vec2(.43,.32))
        + cloud(q, vec2(.55,.76), vec2(.46,.34)) * .95
        + cloud(q, vec2(-.35,.42), vec2(.4,.25)) * .72
        + cloud(q, vec2(.36,.4), vec2(.4,.25)) * .72
        + cloud(q, vec2(.0,.2), vec2(.24,.29)) * .7
        + cloud(q, vec2(.0,.025), vec2(.81,.095)) * .92;
      float coarse = fbm(vec3(q*vec2(3.1,4.2)-vec2(0.,t*.35), t*.17));
      float fine = fbm(vec3(q*vec2(8.,10.)+vec2(t*.12,-t*.61), t*.24+13.));
      float vapor = smoothstep(.27,.73,coarse*.7+fine*.3);
      float density = envelope * (.09 + vapor * .77);
      density *= smoothstep(.09,.62,envelope*.44+coarse-.13);
      float boundary = smoothstep(120.,175.,world.y) *
        (1.-smoothstep(625.,670.,world.y)) *
        smoothstep(-20.,25.,world.x) * (1.-smoothstep(445.,505.,world.x));
      density *= boundary;
      // Flow around the prop, not just across a plane behind it. Each stream
      // has its own angular velocity and ragged centerline. cos(angle) is depth:
      // the same stream passes behind the metal, then in front of it.
      float streams = 0., frontStreams = 0.;
      for (int i = 0; i < 3; i++) {
        float k = float(i), phase = k * 2.29;
        float angle = t * (.66 + k*.085) - q.y*(6.3+k*.6) + phase;
        float radius = .37 + .23*smoothstep(.08,.62,q.y);
        float center = sin(angle)*radius + sin(q.y*9.7+t*.51+phase)*.08;
        float width = .085 + .055*(.5+.5*sin(q.y*11.+t*.83+phase));
        float distance = (q.x-center)/width;
        float stream = exp(-distance*distance*1.35) *
          smoothstep(-.04,.06,p.y) * (1.-smoothstep(1.04,1.29,p.y)) *
          (.38+vapor*.62) * boundary;
        streams += stream;
        frontStreams += stream*smoothstep(-.22,.3,cos(angle));
      }
      float nearCloud = smoothstep(-.3,.35,sin(q.y*5.3-t*.71+warp.x*4.));
      float foreground = density*.16*nearCloud + frontStreams*.78;
      float background = density*.48 + (streams-frontStreams)*.62;
      float volume = mix(background,foreground,side);
      float strand = exp(-abs(coarse + fine*.17 - .57)*62.);
      float filament = strand * (.3 + vapor*.7) * min(envelope,1.) * boundary;
      filament *= mix(1.,nearCloud*.28,side);
      filament += mix(streams-frontStreams,frontStreams,side)*.2;
      float alpha = clamp(1.-exp(-volume*1.6) + filament*.22,0.,mix(.78,.68,side));
      vec3 color = mix(vec3(.46,.006,.016),vec3(.93,.027,.018),vapor);
      color += vec3(1.15,.19,.035) * filament;
      color += vec3(.12,.008,.002) * fine * fine;
      gl_FragColor = vec4(color,alpha);
    }`;
  function shader(type, source) {
    const item = gl.createShader(type);
    gl.shaderSource(item, source);
    gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(item));
    }
    return item;
  }
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const location = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  const clock = gl.getUniformLocation(program, 'time');
  const depthPass = gl.getUniformLocation(program, 'side');
  let frame = 0, lastDraw = 0, drawCount = 0;
  function measure() {
    const bounds = hero.getBoundingClientRect();
    const scale = Math.min(bounds.width/1086, bounds.height/1448);
    if (!scale) return;
    const left = (bounds.width - 1086*scale)/2 + region.x*scale;
    const ratio = Math.min(Math.max(devicePixelRatio || 1, 1.5), 2);
    const w = Math.round(region.width*scale*ratio);
    const h = Math.round(region.height*scale*ratio);
    for (const canvas of [back,front]) {
      canvas.style.left = left + 'px';
      canvas.style.top = region.y*scale + 'px';
      canvas.style.width = region.width*scale + 'px';
      canvas.style.height = region.height*scale + 'px';
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
      }
    }
    if (surface.width !== w || surface.height !== h) {
      surface.width = w; surface.height = h;
    }
    gl.viewport(0,0,w,h);
  }
  function render(t) {
    gl.uniform1f(clock,t);
    for (const [pass, canvas, context] of [[0,back,backContext],[1,front,frontContext]]) {
      gl.uniform1f(depthPass,pass);
      gl.drawArrays(gl.TRIANGLES,0,6);
      context.clearRect(0,0,canvas.width,canvas.height);
      context.drawImage(surface,0,0);
    }
    hero.dataset.smokeTime = t.toFixed(3);
    hero.dataset.smokeFrame = String(++drawCount);
  }
  function draw(now) {
    if (now-lastDraw >= 32) {
      render(now/1000);
      lastDraw = now;
    }
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    const visible = !hero.hidden && !document.hidden && art.naturalWidth > 0 &&
      hero.dataset.effectsReady === 'true';
    if (!visible || reduced.matches) {
      cancelAnimationFrame(frame); frame = 0;
      hero.dataset.mistMotion = 'paused';
      if (visible && reduced.matches) { measure(); render(1.7); }
      return;
    }
    if (frame) return;
    measure();
    hero.dataset.mistMotion = 'running';
    frame = requestAnimationFrame(draw);
  }
  hero.dataset.smokeRenderer = 'procedural-depth-flow';
  new MutationObserver(sync).observe(hero,{attributes:true,attributeFilter:['hidden','data-reveal-state','data-effects-ready']});
  new ResizeObserver(()=>{measure(); if (reduced.matches && !hero.hidden) render(1.7);}).observe(art);
  art.addEventListener('load',sync);
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  sync();
})();
