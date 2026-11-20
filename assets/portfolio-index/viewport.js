(() => {
'use strict';
const MIN=300,MAX=3840;
const MOBILE_MAX=700,MIN_CONTENT_SCALE=.75;
const root=document.documentElement;
const shell=document.querySelector('.viewport-shell');
const stage=document.querySelector('.viewport-stage');
const page=stage.querySelector('.page');
const masthead=page.querySelector('.masthead');
const main=page.querySelector('main');
const footer=page.querySelector('footer');
let pending=0,lastWidth=-1,lastHeight=-1;
let contentScale=1;
function fitMobileContent(layoutHeight){
 // Include the final notice and controls when measuring the mobile page.
 function setScale(scale){
  contentScale=scale;
  page.style.setProperty('--content-scale',String(scale));
 }
 setScale(1);
 if(stage.scrollHeight<=layoutHeight)return;
 let lower=0,upper=1;
 for(let step=0;step<12;step++){
  const scale=(lower+upper)/2;
  setScale(scale);
  if(stage.scrollHeight<=layoutHeight)lower=scale;else upper=scale;
 }
 setScale(lower);
}
function isMobileLayout(layoutWidth){
 return layoutWidth<=MOBILE_MAX||matchMedia('(hover: none) and (pointer: coarse)').matches;
}
function fitContent(layoutWidth,layoutHeight){
 if(isMobileLayout(layoutWidth)){
  fitMobileContent(layoutHeight);
  return;
 }
 let nextScale=1;
 if(layoutWidth>MOBILE_MAX){
  const style=getComputedStyle(page);
  const padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);
  const naturalHeight=masthead.offsetHeight+main.offsetHeight+footer.offsetHeight+padding+2;
  nextScale=Math.max(MIN_CONTENT_SCALE,Math.min(1,layoutHeight/naturalHeight));
 }
 if(nextScale!==contentScale){
  contentScale=nextScale;
  page.style.setProperty('--content-scale',String(contentScale));
 }
}
function measure(){
 const scale=Number(stage.dataset.scale)||1;
 const height=Math.max(stage.scrollHeight,stage.offsetHeight,isMobileLayout(Number(stage.dataset.layoutWidth))?0:stage.getBoundingClientRect().height/scale);
 shell.style.width=Math.ceil(Number(stage.dataset.layoutWidth)*scale)+'px';
 shell.style.height=Math.ceil(height*scale)+'px';
 shell.dataset.renderWidth=String(Math.ceil(Number(stage.dataset.layoutWidth)*scale));
 shell.dataset.renderHeight=String(Math.ceil(height*scale));
 dispatchEvent(new CustomEvent('portfolio-layout'));
}
function update(){
 pending=0;
 const width=root.clientWidth||innerWidth;
 let height=root.clientHeight||innerHeight;
 if(isMobileLayout(width)&&visualViewport&&visualViewport.scale===1){
  height=Math.floor(Math.min(height,visualViewport.height));
 }
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
 fitContent(layoutWidth,layoutHeight);
 measure();
}
function schedule(){if(!pending)pending=requestAnimationFrame(update);}
new ResizeObserver(measure).observe(stage);
new ResizeObserver(schedule).observe(page);
new ResizeObserver(()=>{if(root.clientWidth!==lastWidth||root.clientHeight!==lastHeight)schedule();}).observe(root);
addEventListener('resize',schedule,{passive:true});
if(visualViewport)visualViewport.addEventListener('resize',()=>{
 if(visualViewport.scale===1)schedule();
},{passive:true});
if(document.fonts)document.fonts.ready.then(schedule);
update();
})();