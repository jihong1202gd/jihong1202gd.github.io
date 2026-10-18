(() => {
'use strict';
const canvas=document.getElementById('petals'),ctx=canvas.getContext('2d');
const hoverCanvas=document.getElementById('hover-petals'),hoverCtx=hoverCanvas.getContext('2d');
const toggle=document.querySelector('.motion-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let width=0,height=0,last=0,frame=0,paused=reduced.matches;
let petals=[],gusts=[];
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
function cardBox(row){
 const stage=document.querySelector('.viewport-stage');
 const origin=stage.getBoundingClientRect(),box=row.getBoundingClientRect();
 const scale=Number(stage.dataset.scale)||1;
 return {left:(box.left-origin.left)/scale,top:(box.top-origin.top)/scale,
  right:(box.right-origin.left)/scale,bottom:(box.bottom-origin.top)/scale};
}
function stirCard(row,event){
 if(paused||reduced.matches||!finePointer.matches||event.pointerType==='touch')return;
 const box=cardBox(row),now=performance.now();
 const leaves=Array.from({length:5},(_,i)=>{
  const upper=i<3;
  return {x:upper?box.left+(box.right-box.left)*(.08+i*.2):box.right+rand(8,15),
   y:upper?box.top-rand(8,15):box.bottom-(i-3)*18,
   travelX:upper?rand(95,145):rand(55,90),travelY:upper?rand(24,45):rand(60,95),
   delay:i*42,duration:rand(1050,1400),size:rand(4.5,6.5),phase:rand(0,6.3),
   angle:rand(-1,1),spin:rand(1.2,2.2),alpha:0,wave:3};
 });
 gusts.push({born:now,leaves});
 if(gusts.length>4)gusts.shift();
}
for(const row of document.querySelectorAll('.contents li'))
 row.addEventListener('pointerenter',event=>stirCard(row,event));
function drawGusts(ms,t){
 gusts=gusts.filter(gust=>ms-gust.born<1650);
 for(const gust of gusts){
  for(const leaf of gust.leaves){
   const progress=(ms-gust.born-leaf.delay)/leaf.duration;
   if(progress<0||progress>=1)continue;
   const flow=progress*progress*(3-2*progress);
   const fade=Math.min(1,progress/.16)*Math.pow(1-progress, .65);
   draw({...leaf,x:leaf.x+leaf.travelX*flow,
    y:leaf.y-leaf.travelY*flow-Math.sin(progress*Math.PI)*9,
    angle:leaf.angle+leaf.spin*progress,alpha:.84*fade},t,hoverCtx);
  }
 }
}
const rand=(a,b)=>a+Math.random()*(b-a);
function resize(){
 const stage=document.querySelector(".viewport-stage");
 width=stage.clientWidth;height=stage.scrollHeight;
 const scale=Number(stage.dataset.scale)||1;
 const dpr=Math.min((devicePixelRatio||1)*scale,2,Math.sqrt(16000000/(width*height)));
 for(const layer of [canvas,hoverCanvas]){
  layer.width=Math.round(width*dpr);layer.height=Math.round(height*dpr);
  layer.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
 }
 petals=Array.from({length:width<700?26:44},()=>makePetal(true));
 gusts=[];
}
function makePetal(initial){
 return {x:rand(-width*.1,width*1.1),y:initial?rand(-30,height):-30,size:rand(7,15),speed:rand(24,44),drift:rand(-16,-5),phase:rand(0,Math.PI*2),angle:rand(0,6.3),spin:rand(-.8,.8),alpha:rand(.5,.82)};
}
function draw(p,t,target=ctx){
 const wave=Math.sin(t*.7+p.phase)*(p.wave??18);
 target.save();target.translate(p.x+wave,p.y);target.rotate(p.angle);
 target.scale(p.size,p.size*(Math.cos(t*.9+p.phase)*.3+.7));
 target.globalAlpha=p.alpha;
 const fill=target.createLinearGradient(-1,-1,1,1);
 fill.addColorStop(0,'#ffe8f1');fill.addColorStop(.45,'#f5a5c2');fill.addColorStop(1,'#e475a0');
 target.fillStyle=fill;target.beginPath();
 target.moveTo(0,1);target.bezierCurveTo(-1.1,.4,-.9,-.8,-.28,-1);
 target.lineTo(0,-.68);target.lineTo(.25,-.98);
 target.bezierCurveTo(.95,-.55,.8,.55,0,1);target.fill();target.restore();
}
function render(ms){
 if(paused)return;
 if(!last)last=ms;
 const dt=Math.min((ms-last)/1000,.06);last=ms;
 ctx.clearRect(0,0,width,height);
 hoverCtx.clearRect(0,0,width,height);
 const t=ms/1000;
 for(let i=0;i<petals.length;i++){
  const p=petals[i];p.y+=p.speed*dt;p.x+=p.drift*dt;p.angle+=p.spin*dt;
  if(p.y>height+25||p.x< -60)petals[i]=makePetal(false);
  draw(p,t);
 }
 drawGusts(ms,t);
 frame=requestAnimationFrame(render);
}
function sync(){
 toggle.setAttribute('aria-pressed',String(paused));
 toggle.innerHTML=paused?'벚꽃 흩날리기 <span aria-hidden="true">▷</span>':'벚꽃 멈추기 <span aria-hidden="true">Ⅱ</span>';
 canvas.dataset.motion=paused?'paused':'running';
 cancelAnimationFrame(frame);last=0;
 if(!paused)frame=requestAnimationFrame(render);else{gusts=[];ctx.clearRect(0,0,width,height);hoverCtx.clearRect(0,0,width,height);}
}
toggle.addEventListener('click',()=>{paused=!paused;sync();});
reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);last=0;gusts=[];hoverCtx.clearRect(0,0,width,height);}else if(!paused)frame=requestAnimationFrame(render);});
addEventListener('portfolio-layout',resize);
resize();sync();
})();

