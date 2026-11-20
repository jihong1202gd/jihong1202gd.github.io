
(() => {
  const narrowTouch = window.paperDevice;
  const root = document.documentElement;
  const body = document.body;
  const paper = document.querySelector('main.v13-main');
  const pages = [...paper.children];
  let controls = document.querySelector('.pr-mobile-controls');
  if (!controls) {
    const template = document.createElement('template');
    template.innerHTML = "<nav class=\"pr-mobile-controls\" aria-label=\"모바일 페이지 이동\">\n<div class=\"pr-control-start\">\n<button class=\"pr-prev\" type=\"button\">이전</button>\n<button class=\"pr-toc\" type=\"button\">목차</button>\n</div>\n<div class=\"pr-control-end\">\n<output aria-label=\"현재 쪽\"></output>\n<button class=\"pr-next\" type=\"button\">다음</button>\n</div>\n</nav>";
    controls = template.content.firstElementChild;
    document.body.append(controls);
  }
  const previous = controls.querySelector('.pr-prev');
  const next = controls.querySelector('.pr-next');
  let index = 0;
  let width = 0;
  let height = 0;
  let portrait = true;
  const isActive = () => body.classList.contains('pr-rotated');
  const isZoomed = () => (visualViewport?.scale ?? 1) > 1.01;
  const modalOpen = () => Boolean(document.querySelector('dialog[open]'));
  const hashIndex = () => pages.findIndex(page => '#' + page.id === location.hash);

  function show(indexToShow, push = false) {
    if (indexToShow < 0 || indexToShow >= pages.length) return;
    index = indexToShow;
    if (push && hashIndex() !== index) history.pushState(null, '', '#' + pages[index].id);
    pages.forEach((page, i) => page.classList.toggle('pr-current', i === index));
    controls.querySelector('output').textContent = (index + 1) + ' / ' + pages.length;
    previous.disabled = index === 0;
    next.disabled = index === pages.length - 1;
  }

  function fit() {
    const active = isActive();
    if (!narrowTouch.matches) {
      if (active) {
        body.classList.remove('pr-rotated','pr-portrait','pr-landscape','pr-no-gutter','pr-at-fit');
        pages[index].classList.remove('pr-current');
        window.adjustScale?.();
      }
      return;
    }
    body.classList.toggle('pr-at-fit',!isZoomed());
    if (isZoomed()) return;
    width = root.clientWidth;
    height = root.clientHeight;
    portrait = width < height;
    const shortSide = Math.min(width,height);
    const longSide = Math.max(width,height);
    const scale = Math.min(shortSide / 1080, longSide / 1920);
    const gutter = Math.max(0, (longSide - 1920 * scale) / 2);
    paper.style.setProperty('--pr-turn', portrait ? '90deg' : '0deg');
    paper.style.setProperty('--pr-scale', scale);
    body.style.setProperty('--pr-gutter', gutter + 'px');
    body.classList.add('pr-rotated');
    body.classList.toggle('pr-portrait',portrait);
    body.classList.toggle('pr-landscape',!portrait);
    body.classList.toggle('pr-no-gutter',gutter < 46);
    show(active ? index : Math.max(0,hashIndex()));
  }

  window.prMobileActive = isActive;
  document.addEventListener('click', event => {
    if (!isActive()) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = pages.findIndex(page => '#' + page.id === link.getAttribute('href'));
    if (target < 0) return;
    event.preventDefault();
    show(target,true);
  });

  function bindControl(button, action) {
    let start;
    let lastTouchActivation = -Infinity;
    button.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch') start = event;
    });
    button.addEventListener('pointercancel', () => { start = null; });
    button.addEventListener('pointerup', event => {
      const down = start;
      start = null;
      if (event.pointerType !== 'touch' || down?.pointerId !== event.pointerId || button.disabled) return;
      const released = document.elementFromPoint(event.clientX,event.clientY);
      if (!button.contains(released) || Math.hypot(down.clientX-event.clientX,down.clientY-event.clientY)>12) return;
      lastTouchActivation = performance.now();
      action();
    });
    button.addEventListener('click', event => {
      if (event.detail > 0 && performance.now()-lastTouchActivation < 700) return;
      action();
    });
  }
  bindControl(previous, () => show(index - 1,true));
  bindControl(next, () => show(index + 1,true));
  bindControl(controls.querySelector('.pr-toc'), () => show(pages.findIndex(page => page.id === 'v13-contents'),true));
  addEventListener('hashchange', () => {
    if (isActive()) show(Math.max(0,hashIndex()));
  });
  addEventListener('resize',fit);
  visualViewport?.addEventListener('resize',fit,{passive:true});
  addEventListener('keydown', event => {
    if (!isActive() || modalOpen() || isZoomed() || event.target.closest('input,textarea,select')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1),true);
    }
  });
  window.bindPaperSwipe(isActive, step => show(index + step, true));
  fit();
})();
