(() => {
  const pages = [...document.querySelectorAll('body > .slide[id], .v106-page-wrap .v106-page, main.v13-main > .page, #document .bs-page, .ap-document > .ap-page')];
  if (!pages.length) return;
  const current = () => pages.find(page => page.getClientRects().length && page.getBoundingClientRect().height > 0);
  const root = document.documentElement;
  const panel = document.createElement('div');
  panel.id = 'paper-controls';
  panel.hidden = true;
  panel.innerHTML = '<nav aria-label="문서 조작"><a href="index.html">목록</a><button type="button" data-c="toc">목차</button><button type="button" data-c="prev">이전</button><output aria-label="현재 장"></output><button type="button" data-c="next">다음</button><button type="button" data-c="minus" aria-label="문서 축소">−</button><button type="button" data-c="fit" aria-label="화면에 맞추기">맞춤</button><button type="button" data-c="plus" aria-label="문서 확대">＋</button></nav>';
  document.body.append(panel);
  const control = name => panel.querySelector('[data-c="'+name+'"]');
  const toc = document.querySelector('#v13-contents,#slide-toc,#contents');
  if (!toc) control('toc').remove();
  const levels = [1,1.5,2,2.5,3,4];
  let level = 0, panX = 0, panY = 0, enlarged, original;
  let start, timer;
  function active() { return window.paperDevice.matches && window.paperReader?.isReading(); }
  function modal() { return document.querySelector('dialog[open],[role="dialog"][aria-modal="true"]:not([hidden]):not(dialog)'); }
  function hide() { clearTimeout(timer); panel.hidden = true; }
  function reveal() {
    if (!active() || modal()) return hide();
    const i = pages.indexOf(current());
    panel.querySelector('output').value = (i+1)+' / '+pages.length;
    control('prev').disabled = i <= 0;
    control('next').disabled = i >= pages.length-1;
    control('minus').disabled = level === 0;
    control('plus').disabled = level === levels.length-1;
    control('fit').textContent = level ? Math.round(levels[level]*100)+'%' : '맞춤';
    clearTimeout(timer);
    panel.hidden = false;
    timer = setTimeout(() => { if (!panel.matches(':focus-within') || !panel.matches(':has(:focus-visible)')) hide(); }, 4500);
  }
  function reset() {
    if (enlarged) {
      if (original) enlarged.style.setProperty('transform', original.value, original.priority);
      else enlarged.style.removeProperty('transform');
      enlarged.removeAttribute('data-paper-enlarged');
    }
    enlarged = original = null;
    level = panX = panY = 0;
  }
  function draw() {
    const page = enlarged;
    const saved = original?.value;
    if (saved) page.style.setProperty('transform', saved, original.priority);
    else page.style.removeProperty('transform');
    const css = getComputedStyle(page);
    const base = css.transform === 'none' ? '' : css.transform;
    const [ox,oy] = css.transformOrigin.split(' ').map(parseFloat);
    const w = page.offsetWidth, h = page.offsetHeight, z = levels[level];
    const box = page.getBoundingClientRect();
    const side = matchMedia('(orientation:portrait)').matches;
    const scale = (side ? box.height : box.width) / w;
    const limitX = (z-1)*w/2, limitY = (z-1)*h/2;
    panX = Math.max(-limitX, Math.min(limitX, panX));
    panY = Math.max(-limitY, Math.min(limitY, panY));
    const x = (w/2-ox)*(1-z)+panX, y = (h/2-oy)*(1-z)+panY;
    page.style.setProperty('transform', base+' translate('+x+'px,'+y+'px) scale('+z+')', 'important');
    return scale;
  }
  function zoom(next) {
    if (!next) return reset();
    if (!enlarged) {
      enlarged = current();
      if (!enlarged) return;
      const value = enlarged.style.getPropertyValue('transform');
      original = value ? {value,priority:enlarged.style.getPropertyPriority('transform')} : null;
      enlarged.dataset.paperEnlarged = '';
    }
    level = next;
    draw();
  }
  panel.addEventListener('click', event => {
    const cmd = event.target.closest('button')?.dataset.c;
    if (!cmd || !active()) return;
    if (cmd==='prev' || cmd==='next') { reset(); window.paperReader.turnPage(cmd==='next'?1:-1); }
    else if (cmd==='toc') { reset(); location.hash = toc.id; }
    else zoom(cmd==='fit'?0:Math.max(0,Math.min(levels.length-1,level+(cmd==='plus'?1:-1))));
    reveal();
  });
  const interactive = 'a,button,input,textarea,select,summary,video,iframe,[role="button"],[contenteditable="true"],[data-image],[data-detail],[data-chat-detail],[data-media-kind],[data-profile-image]';
  document.addEventListener('click',event=>{
    if (!active() || modal() || event.target.closest('#paper-opening,#paper-controls,dialog,'+interactive)) return;
    if (panel.hidden) reveal(); else hide();
  });
  // Zoomed sheets pan in their own reading direction even under portrait orientation lock.
  document.addEventListener('touchstart', event=>{
    start = null;
    if (!enlarged || modal() || event.touches.length!==1 || event.target.closest('nav,dialog,#paper-opening') || (visualViewport?.scale??1)>1.01) return;
    const t=event.touches[0], b=enlarged.getBoundingClientRect(), rotated=matchMedia('(orientation:portrait)').matches;
    start={x:t.clientX,y:t.clientY,panX,panY,rotated,scale:(rotated?b.height:b.width)/enlarged.offsetWidth/levels[level]};
  },{passive:true});
  document.addEventListener('touchmove',event=>{
    if (!start || event.touches.length!==1 || !enlarged) { start=null;return; }
    const t=event.touches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
    if (Math.hypot(dx,dy)<5) return;
    if(event.cancelable) event.preventDefault();
    panX=start.panX+(start.rotated?dy:dx)/start.scale;
    panY=start.panY+(start.rotated?-dx:dy)/start.scale;
    draw();hide();
  },{passive:false});
  for (const type of ['touchend','touchcancel']) document.addEventListener(type,()=>{start=null;},{passive:true});
  function sync() {
    root.classList.toggle('paper-ui',Boolean(active()));
    if (!active()) {reset();hide();}
  }
  addEventListener('resize',()=>{sync();if(enlarged)draw();});
  addEventListener('hashchange',()=>{reset();if(!panel.hidden)reveal();});
  addEventListener('popstate',()=>{reset();hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  document.addEventListener('paper-turn',()=>{reset();hide();});
  document.addEventListener('focusin',e=>{if(e.target.closest('dialog'))hide();});
  window.paperDevice.addEventListener('change', sync);
  document.addEventListener('paper-reader-ready',sync);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
  sync();
})();
