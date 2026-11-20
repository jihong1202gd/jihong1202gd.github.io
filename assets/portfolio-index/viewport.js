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
let pending=0,lastWidth=-1,lastHeight=-1;
let contentScale=1;
function isMobileLayout(layoutWidth){
 return layoutWidth<=MOBILE_MAX||matchMedia('(hover: none) and (pointer: coarse)').matches;
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
  Math.max(stage.scrollHeight,stage.offsetHeight,stage.getBoundingClientRect().height/scale);
 shell.style.width=Math.ceil(layoutWidth*scale)+'px';
 shell.style.height=Math.ceil(height*scale)+'px';
 shell.dataset.renderWidth=String(Math.ceil(layoutWidth*scale));
 shell.dataset.renderHeight=String(Math.ceil(height*scale));
 dispatchEvent(new CustomEvent('portfolio-layout'));
}
function update(){
 pending=0;
 const width=root.clientWidth||innerWidth;
 let height=root.clientHeight||innerHeight;
 const mobile=isMobileLayout(width);
 const viewport=window.visualViewport;
 if(mobile&&viewport&&viewport.scale>1.01)return;
 if(mobile&&viewport&&viewport.scale===1){
  height=Math.floor(Math.min(height,viewport.height));
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
}
function schedule(){if(!pending)pending=requestAnimationFrame(update);}
new ResizeObserver(measure).observe(stage);
new ResizeObserver(schedule).observe(page);
new ResizeObserver(()=>{if(root.clientWidth!==lastWidth||root.clientHeight!==lastHeight)schedule();}).observe(root);
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
