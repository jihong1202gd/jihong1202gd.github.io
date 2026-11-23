(() => {
'use strict';
const MIN=300,MAX=3840;
const MOBILE_MAX=700,MIN_CONTENT_SCALE=.75;
const root=document.documentElement;
const shell=document.querySelector('.viewport-shell');
const stage=document.querySelector('.viewport-stage');
const page=stage.querySelector('.page');
const masthead=document.querySelector('.masthead');
const main=page.querySelector('main');
const footer=page.querySelector('footer');
// A clipped, out-of-flow probe measures the viewport without scrollbar feedback.
const viewportProbe=document.createElement('div');
viewportProbe.setAttribute('aria-hidden','true');
viewportProbe.style.cssText='position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;contain:strict;visibility:hidden;pointer-events:none';
const viewportBox=document.createElement('div');
viewportBox.style.cssText='width:100vw;height:100vh';
viewportProbe.append(viewportBox);
document.body.append(viewportProbe);
let pending=0,pendingMeasure=0,lastWidth=-1,lastHeight=-1;
let contentScale=1;
let lastRenderSignature='',lastContentSignature='';
function contentSignature(){
 return [masthead.offsetHeight,main.offsetHeight,footer.offsetHeight].join(':');
}
function isMobileLayout(layoutWidth){
 return layoutWidth<=MOBILE_MAX||matchMedia('(hover: none) and (pointer: coarse)').matches;
}
function readViewport(){
 // Fitted output cannot change this input; preserve fractional CSS pixels.
 const bounds=viewportBox.getBoundingClientRect();
 const width=bounds.width||innerWidth;
 const mobile=isMobileLayout(width);
 const viewport=window.visualViewport;
 let height=mobile?(root.clientHeight||innerHeight):(bounds.height||innerHeight);
 if(mobile&&viewport&&viewport.scale===1){
  height=Math.floor(Math.min(height,viewport.height));
 }
 return {width,height,mobile};
}
function fitContent(layoutWidth,layoutHeight){
 if(isMobileLayout(layoutWidth)){
  // Fit against the stable small viewport. Browser chrome and rubber-band
  // changes resize the backdrop/stage, but must not rescale the composition.
  contentScale=1;
  page.style.setProperty('--content-scale','1');
  const style=getComputedStyle(root);
  const top=parseFloat(style.getPropertyValue('--safe-top'))||0;
  const right=parseFloat(style.getPropertyValue('--safe-right'))||0;
  const bottom=parseFloat(style.getPropertyValue('--safe-bottom'))||0;
  const left=parseFloat(style.getPropertyValue('--safe-left'))||0;
  const edgeGap=parseFloat(style.getPropertyValue('--content-edge-gap'))||0;
  const stableHeight=parseFloat(getComputedStyle(page).minHeight)||layoutHeight;
  const split=window.portfolioMobileSurface?.element.dataset.contentLayout==='split';
  const contentTop=top+edgeGap+(split?masthead.offsetHeight:0);
  const availableHeight=Math.max(1,stableHeight-contentTop-bottom-edgeGap);
  const availableWidth=Math.max(1,layoutWidth-left-right-(split?edgeGap*2:0));
  const naturalHeight=Math.max(page.scrollHeight,page.offsetHeight);
  const scale=Math.min(1,(availableHeight-1)/naturalHeight,availableWidth/layoutWidth);
  page.style.setProperty('--content-inset-top',contentTop+'px');
  const paddingLeft=parseFloat(getComputedStyle(page).paddingLeft)||0;
  page.style.setProperty('--content-inset-left',(split?left+edgeGap-paddingLeft*scale:(left-right)/2)+'px');
  page.style.setProperty('--mobile-scale',String(scale));

  return;
 }
 page.style.removeProperty('--content-inset-top');
 page.style.removeProperty('--content-inset-left');
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
 const layoutWidth=Number(stage.dataset.layoutWidth);
 const height=isMobileLayout(layoutWidth)?Number(stage.dataset.layoutHeight):
  Math.max(Number(stage.dataset.layoutHeight),stage.getBoundingClientRect().height/scale);
 // Rounding either fitted dimension upward can create a scrollbar and refit loop.
 const renderWidth=layoutWidth*scale,renderHeight=height*scale;
 const signature=[layoutWidth,height,scale,renderWidth,renderHeight].join(':');
 if(signature===lastRenderSignature)return;
 lastRenderSignature=signature;
 if(shell.style.width!==renderWidth+'px')shell.style.width=renderWidth+'px';
 if(shell.style.height!==renderHeight+'px')shell.style.height=renderHeight+'px';
 shell.dataset.renderWidth=String(renderWidth);
 shell.dataset.renderHeight=String(renderHeight);
 dispatchEvent(new CustomEvent('portfolio-layout'));
}
function update(){
 pending=0;
 const {width,height,mobile}=readViewport();
 const viewport=window.visualViewport;
 if(mobile&&viewport&&viewport.scale>1.01)return;
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
 root.style.setProperty('--visible-viewport-height',height+'px');
 // The backdrop fills the viewport while only the content is transformed.
 stage.style.setProperty('--fit-height',mobile?layoutHeight+'px':'auto');
 stage.style.setProperty('--fit-overflow','visible');
 if(mobile)root.style.setProperty('--scenery-left','0%');
 else root.style.removeProperty('--scenery-left');
 page.style.setProperty('--page-width',mobile?layoutWidth+'px':'auto');
 page.style.setProperty('--page-zoom',mobile?'1':'var(--content-scale)');
 page.style.setProperty('--content-transform',mobile?'scale(var(--mobile-scale,1))':'none');
 fitContent(layoutWidth,layoutHeight);
 measure();
 // Read after applying our own fit so its ResizeObserver delivery is a no-op.
 lastContentSignature=contentSignature();
}
function schedule(){if(!pending)pending=requestAnimationFrame(update);}
function scheduleMeasure(){
 if(pendingMeasure)return;
 pendingMeasure=requestAnimationFrame(()=>{
  pendingMeasure=0;
  measure();
 });
}
new ResizeObserver(scheduleMeasure).observe(stage);
// Observe natural content, not the page height changed by our own zoom/min-height.
const contentObserver=new ResizeObserver(()=>{
 if(contentSignature()!==lastContentSignature)schedule();
});
for(const element of [masthead,main,footer])contentObserver.observe(element);
new ResizeObserver(()=>{
 const {width,height}=readViewport();
 if(width!==lastWidth||height!==lastHeight)schedule();
}).observe(root);
addEventListener('resize',schedule,{passive:true});
if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{
 if(window.visualViewport.scale===1)schedule();
},{passive:true});
// The index is a single fitted screen. Suppress one-finger vertical dragging
// only at native scale, so Safari cannot pull the home composition away.
// Range controls, text selection and native pinch/pan keep their own gestures.
let singleTouch=null;
document.addEventListener('touchstart',event=>{
 const touch=event.touches.length===1?event.touches[0]:null;
 singleTouch=touch?{x:touch.clientX,y:touch.clientY}:null;
},{passive:true,capture:true});
document.addEventListener('touchmove',event=>{
 if(!singleTouch||event.touches.length!==1||!isMobileLayout(root.clientWidth)||
    (window.visualViewport?.scale||1)>1.01)return;
 if(event.target.closest?.('input,select,textarea,[contenteditable="true"]')||
    document.getSelection()?.type==='Range')return;
 const touch=event.touches[0],dx=touch.clientX-singleTouch.x,dy=touch.clientY-singleTouch.y;
 if(Math.abs(dy)>6&&Math.abs(dy)>Math.abs(dx)&&event.cancelable)event.preventDefault();
},{passive:false,capture:true});
const clearTouch=()=>{singleTouch=null;};
document.addEventListener('touchend',clearTouch,{passive:true,capture:true});
document.addEventListener('touchcancel',clearTouch,{passive:true,capture:true});
if(document.fonts)document.fonts.ready.then(schedule);
update();
})();
