(() => {
'use strict';
const MIN=300,MAX=3840;
const root=document.documentElement;
const shell=document.querySelector('.viewport-shell');
const stage=document.querySelector('.viewport-stage');
let pending=0,lastWidth=-1,lastHeight=-1;
function measure(){
 const scale=Number(stage.dataset.scale)||1;
 const height=Math.max(stage.scrollHeight,stage.offsetHeight,stage.getBoundingClientRect().height/scale);
 shell.style.width=Math.ceil(Number(stage.dataset.layoutWidth)*scale)+'px';
 shell.style.height=Math.ceil(height*scale)+'px';
 shell.dataset.renderWidth=String(Math.ceil(Number(stage.dataset.layoutWidth)*scale));
 shell.dataset.renderHeight=String(Math.ceil(height*scale));
 dispatchEvent(new CustomEvent('portfolio-layout'));
}
function update(){
 pending=0;
 const width=root.clientWidth||innerWidth,height=root.clientHeight||innerHeight;
 const scale=Math.max(1,width/MAX,height/MAX);
 const layoutWidth=Math.max(MIN,Math.min(MAX,width/scale));
 const layoutHeight=Math.max(MIN,Math.min(MAX,height/scale));
 if(width!==lastWidth||height!==lastHeight){
  lastWidth=width;lastHeight=height;
  stage.style.setProperty('--layout-width',layoutWidth+'px');
  stage.style.setProperty('--layout-height',layoutHeight+'px');
  stage.style.setProperty('--page-scale',String(scale));
  stage.dataset.scale=String(scale);
  stage.dataset.layoutWidth=String(layoutWidth);
  stage.dataset.layoutHeight=String(layoutHeight);
  stage.dataset.min=String(MIN);stage.dataset.max=String(MAX);
 }
 measure();
}
function schedule(){if(!pending)pending=requestAnimationFrame(update);}
new ResizeObserver(measure).observe(stage);
new ResizeObserver(()=>{if(root.clientWidth!==lastWidth||root.clientHeight!==lastHeight)schedule();}).observe(root);
addEventListener('resize',schedule,{passive:true});
if(document.fonts)document.fonts.ready.then(schedule);
update();
})();
