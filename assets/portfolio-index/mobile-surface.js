(() => {
'use strict';
const surface=document.querySelector('.mobile-surface');
if(!surface)return;
const root=document.documentElement;
const media=matchMedia('(max-width:700px),(hover:none) and (pointer:coarse)');
let pending=0,geometry=null;
function update(){
 pending=0;
 placePetals();
 if((visualViewport?.scale||1)>1.01)return;
 if(!media.matches){
  surface.style.removeProperty('height');
  for(const name of ['--surface-content-top','--surface-image-height','--surface-image-top'])root.style.removeProperty(name);
  if(geometry)scrollTo(0,0);
  geometry=null;return;
 }
 const page=surface.querySelector('.page');
 // Read viewport units through a real box rather than parse a "100lvh" token.
 const probe=document.createElement('div');
 probe.style.cssText='position:absolute;visibility:hidden;pointer-events:none;height:100lvh;width:0';
 surface.append(probe);const full=Math.max(innerHeight,probe.getBoundingClientRect().height);probe.remove();
 const visible=visualViewport?.height||innerHeight;
 const stable=parseFloat(getComputedStyle(page).minHeight)||visible;
 // Buffer is proportional to the measured large viewport, not a Safari inset guess.
 const padding=Math.ceil(full/4),height=full+2*padding;
 const scrollTop=padding+(full-visible)/2;
 const imageHeight=Math.max(full,root.clientWidth*1.5); // existing 1536 x 2304 art
 surface.style.height=height+'px';
 root.style.setProperty('--surface-content-top',(padding+(full-stable)/2)+'px');
 root.style.setProperty('--surface-image-height',imageHeight+'px');
 root.style.setProperty('--surface-image-top',(padding+full-imageHeight)+'px');
 geometry={padding,height,full,visible,stable,scrollTop};
 // Put real painted content above and below the visual viewport for Safari sampling.
 scrollTo({top:scrollTop,left:0,behavior:'instant'});
 surface.dataset.ready='true';
 dispatchEvent(new CustomEvent('portfolio-surface',{detail:geometry}));
}
function schedule(){if(!pending)pending=requestAnimationFrame(update);}
window.portfolioMobileSurface={element:surface,get geometry(){return geometry;},update:schedule};
// Ambient petals paint the whole band; content keeps its stable fit and original scale.
const stage=surface.querySelector('.viewport-stage');
const masthead=surface.querySelector('.masthead'),page=stage.querySelector('.page'),notice=surface.querySelector('.ai-notice');
function placePetals(){
 for(const id of ['petals','hover-petals']){const layer=document.getElementById(id),parent=media.matches?surface:stage;if(layer.parentElement!==parent)parent.append(layer);}
 const split=media.matches&&root.clientWidth<=700;
 surface.dataset.contentLayout=split?'split':'original';
 const parent=split?surface:page;
 if(masthead.parentElement!==parent)parent.prepend(masthead);
 const noticeParent=split?surface:page;
 if(notice.parentElement!==noticeParent)noticeParent.append(notice);
}
placePetals();media.addEventListener('change',placePetals);
addEventListener('resize',schedule,{passive:true});
visualViewport?.addEventListener('resize',schedule,{passive:true});
addEventListener('pageshow',schedule,{passive:true});
media.addEventListener('change',schedule);
if(document.fonts)document.fonts.ready.then(schedule);
update();
})();
