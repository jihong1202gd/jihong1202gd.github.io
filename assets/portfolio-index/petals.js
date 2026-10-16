(() => {
'use strict';
const canvas=document.getElementById('petals'),ctx=canvas.getContext('2d');
const toggle=document.querySelector('.motion-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let width=0,height=0,last=0,frame=0,paused=reduced.matches;
let petals=[];
const rand=(a,b)=>a+Math.random()*(b-a);
function resize(){
 const stage=document.querySelector(".viewport-stage");
 width=stage.clientWidth;height=stage.scrollHeight;
 const scale=Number(stage.dataset.scale)||1;
 const dpr=Math.min((devicePixelRatio||1)*scale,2,Math.sqrt(16000000/(width*height)));
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
 petals=Array.from({length:width<700?26:44},()=>makePetal(true));
}
function makePetal(initial){
 return {x:rand(-width*.1,width*1.1),y:initial?rand(-30,height):-30,size:rand(7,15),speed:rand(24,44),drift:rand(-16,-5),phase:rand(0,Math.PI*2),angle:rand(0,6.3),spin:rand(-.8,.8),alpha:rand(.5,.82)};
}
function draw(p,t){
 const wave=Math.sin(t*.7+p.phase)*18;
 ctx.save();ctx.translate(p.x+wave,p.y);ctx.rotate(p.angle);
 ctx.scale(p.size,p.size*(Math.cos(t*.9+p.phase)*.3+.7));
 ctx.globalAlpha=p.alpha;
 const fill=ctx.createLinearGradient(-1,-1,1,1);
 fill.addColorStop(0,'#ffe8f1');fill.addColorStop(.45,'#f5a5c2');fill.addColorStop(1,'#e475a0');
 ctx.fillStyle=fill;ctx.beginPath();
 ctx.moveTo(0,1);ctx.bezierCurveTo(-1.1,.4,-.9,-.8,-.28,-1);
 ctx.lineTo(0,-.68);ctx.lineTo(.25,-.98);
 ctx.bezierCurveTo(.95,-.55,.8,.55,0,1);ctx.fill();ctx.restore();
}
function render(ms){
 if(paused)return;
 if(!last)last=ms;
 const dt=Math.min((ms-last)/1000,.06);last=ms;
 ctx.clearRect(0,0,width,height);
 const t=ms/1000;
 for(let i=0;i<petals.length;i++){
  const p=petals[i];p.y+=p.speed*dt;p.x+=p.drift*dt;p.angle+=p.spin*dt;
  if(p.y>height+25||p.x< -60)petals[i]=makePetal(false);
  draw(p,t);
 }
 frame=requestAnimationFrame(render);
}
function sync(){
 toggle.setAttribute('aria-pressed',String(paused));
 toggle.innerHTML=paused?'벚꽃 흩날리기 <span aria-hidden="true">▷</span>':'벚꽃 멈추기 <span aria-hidden="true">Ⅱ</span>';
 canvas.dataset.motion=paused?'paused':'running';
 cancelAnimationFrame(frame);last=0;
 if(!paused)frame=requestAnimationFrame(render);else ctx.clearRect(0,0,width,height);
}
toggle.addEventListener('click',()=>{paused=!paused;sync();});
reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);last=0;}else if(!paused)frame=requestAnimationFrame(render);});
addEventListener('portfolio-layout',resize);
resize();sync();
})();

