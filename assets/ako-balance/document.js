(() => {
  'use strict';
  const roots=[...document.querySelectorAll('.bs-page')];
  const hosts=[...document.querySelectorAll('.page-host')];
  const dialog=document.querySelector('#detail-dialog');
  const detailBody=document.querySelector('#detail-body');
  const params = new URLSearchParams(location.search);
  const reader = document.querySelector('#document');
  const toolbar = document.querySelector('.viewer-toolbar');
  const viewToggle = document.querySelector('#view-strip');
  const zoomButtons = Object.fromEntries(['minus', 'fit', 'plus'].map(name => [
    name, document.querySelector('#reader-' + name)
  ]));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const printing = matchMedia('print');
  const capture = params.has('capture');
  const zoomSteps = [1, 1.5, 2, 2.5, 3, 4];
  const nativeViewports = new Set([window.visualViewport].filter(Boolean));
  try {
    if (window.top.visualViewport) nativeViewports.add(window.top.visualViewport);
  } catch { /* A cross-origin host controls its own viewport. */ }

  let current = 0;
  let lastTrigger = null;
  let movingTo = null;
  let zoom = 1;
  let resizeFrame = 0;
  let strip = params.get('view') === 'strip' || location.pathname.endsWith('/strip.html');
  if (capture) document.body.classList.add('capture');

  const nativeZoomed = () => [...nativeViewports].some(viewport =>
    viewport.scale > 0 && Math.abs(viewport.scale - 1) > 0.01);
  const hashIndex = () => roots.findIndex(page => '#' + page.id === location.hash);
  const initialIndex = strip ? -1 : hashIndex();
  let initialAnchorPending = initialIndex >= 0;
  const toolbarHeight = () => toolbar.offsetHeight;
  const pageTop = height => toolbarHeight() + Math.max(0, (innerHeight - toolbarHeight() - height) / 2);

  function fitPages() {
    const root = document.documentElement;
    const width = root.clientWidth || innerWidth;
    const availableHeight = Math.max(1, innerHeight - toolbarHeight() - 80);
    const fit = Math.min(width / 1960, availableHeight / 1080, 1);
    const stripFit = (width - (width <= 700 ? 36 : 72)) / (width <= 700 ? 1920 : 5760);
    const scale = capture ? 1 : Math.max(.001, strip ? Math.min(stripFit, .34) : fit * zoom);
    root.style.setProperty('--view-scale', String(scale));
    root.style.setProperty('--reader-anchor-top', (capture ? 0 : pageTop(1080 * scale)) + 'px');
    root.style.setProperty('--toolbar-height', toolbarHeight() + 'px');
    root.style.setProperty('--reader-gutter', Math.max(40, pageTop(1080 * scale) - toolbarHeight()) + 'px');
    root.style.setProperty('--page-gap', 60 * zoom + 'px');
    root.style.setProperty('--reader-width', width * (strip ? 1 : zoom) + 'px');
  }

  function updateView() {
    document.body.classList.toggle('strip-view', strip);
    viewToggle.textContent = strip ? '페이지 보기' : '전체 보기';
    viewToggle.setAttribute('aria-pressed', String(strip));
    zoomButtons.fit.textContent = zoom === 1 ? '맞춤' : Math.round(zoom * 100) + '%';
    zoomButtons.minus.disabled = strip || zoom === zoomSteps[0];
    zoomButtons.fit.disabled = strip;
    zoomButtons.plus.disabled = strip || zoom === zoomSteps.at(-1);
    fitPages();
  }

  function setZoom(next) {
    if (strip || next === zoom) return;
    const before = hosts[current].getBoundingClientRect();
    const previousZoom = zoom;
    const left = reader.scrollLeft / previousZoom;
    const offset = pageTop(before.height) - before.top;
    const inset = Math.abs(offset) < 2 ? 0 : offset;
    zoom = next;
    updateView();
    const after = hosts[current].getBoundingClientRect();
    reader.scrollLeft = zoom === 1 ? 0 : left * zoom;
    window.scrollTo({
      top: scrollY + after.top - pageTop(after.height) + inset * zoom / previousZoom,
      behavior: 'instant'
    });
  }

  function markPage(index, historyMode) {
    current = index;
    const hash = '#' + roots[index].id;
    if (historyMode === 'none' || location.hash === hash) return;
    if (historyMode === 'push') history.pushState(null, '', hash);
    else history.replaceState(null, '', hash);
  }

  function go(index, { instant = false, historyMode = 'replace' } = {}) {
    initialAnchorPending = false;
    const destination = Math.max(0, Math.min(roots.length - 1, index));
    if (strip) {
      strip = false;
      updateView();
    }
    const behavior = instant || reducedMotion.matches ? 'instant' : 'smooth';
    const rect = hosts[destination].getBoundingClientRect();
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const top = Math.max(0, Math.min(maximum, scrollY + rect.top - (capture ? 0 : pageTop(rect.height))));
    movingTo = behavior === 'smooth' ? { top, expires: performance.now() + 700 } : null;
    markPage(destination, historyMode);
    window.scrollTo({ top, behavior });
  }

  document.querySelector('#prev-page').addEventListener('click', () => go(current - 1));
  document.querySelector('#next-page').addEventListener('click', () => go(current + 1));
  document.querySelector('#reader-print').addEventListener('click', () => window.print());
  zoomButtons.minus.addEventListener('click', () => setZoom(zoomSteps[zoomSteps.indexOf(zoom) - 1]));
  zoomButtons.plus.addEventListener('click', () => setZoom(zoomSteps[zoomSteps.indexOf(zoom) + 1]));
  zoomButtons.fit.addEventListener('click', () => setZoom(1));
  viewToggle.addEventListener('click', () => {
    strip = !strip;
    movingTo = null;
    updateView();
    if (strip) {
      reader.scrollLeft = 0;
      window.scrollTo({ top: 0, behavior: 'instant' });
      hosts[current].scrollIntoView({ block: 'center', behavior: 'instant' });
    } else go(current, { instant: true });
  });
  hosts.forEach((host, i) => host.addEventListener('click', () => {
    if (strip) go(i, { instant: true, historyMode: 'push' });
  }));
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      const index = roots.findIndex(page => '#' + page.id === anchor.hash);
      if (index >= 0) {
        event.preventDefault();
        go(index, { instant: true, historyMode: 'push' });
        if (anchor.hash === '#contents') roots[index].focus({ preventScroll: true });
      }
    }
    const expand = event.target.closest('[data-image]');
    if (expand) {
      const figure = expand.closest('figure');
      const preview = document.createElement('img');
      preview.className = 'detail-image';
      preview.src = expand.dataset.image;
      preview.alt = figure.querySelector('img').alt;
      document.querySelector('#dialog-title').textContent = figure.querySelector('figcaption').textContent;
      lastTrigger = expand;
      detailBody.replaceChildren(preview);
      dialog.showModal();
      detailBody.scrollTop = 0;
      return;
    }
    const trigger=event.target.closest('[data-detail]');
    if(!trigger)return;
    const template=document.getElementById('detail-'+trigger.dataset.detail);
    if(!template)return;
    document.querySelector('#dialog-title').textContent='설계 근거와 상세 계산';
    lastTrigger=trigger;detailBody.replaceChildren(template.content.cloneNode(true));
    dialog.showModal();detailBody.scrollTop=0;
  });
  function close(){dialog.close();lastTrigger?.focus({preventScroll:true});}
  document.querySelector('#close-detail').addEventListener('click',close);
  dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))close();});
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  document.addEventListener('keydown', event => {
    if (dialog.open || nativeZoomed() || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.target.closest?.('input, textarea, select, [contenteditable]')) return;
    resetGesture();
    const targets = {
      ArrowRight: current + 1, PageDown: current + 1,
      ArrowLeft: current - 1, PageUp: current - 1,
      Home: 0, End: roots.length - 1
    };
    if (!Object.hasOwn(targets, event.key)) return;
    event.preventDefault();
    go(targets[event.key]);
  });
  document.addEventListener('dragstart', event => {
    if (event.target instanceof HTMLImageElement) event.preventDefault();
  });

  const gestureGap = 180;
  const wheelThreshold = 30;
  let lastWheelAt = -Infinity;
  let direction = 0;
  let accumulated = 0;
  let consumed = false;

  function resetGesture() {
    movingTo = null;
    lastWheelAt = -Infinity;
    direction = 0;
    accumulated = 0;
    consumed = false;
  }

  function nativeScrollTarget(target) {
    if (!(target instanceof Element)) return false;
    if (target.closest('input, textarea, select, [contenteditable]')) return true;
    for (let node = target; node && node !== document.body; node = node.parentElement) {
      const overflow = getComputedStyle(node).overflowY;
      if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight + 2) return true;
    }
    return false;
  }

  window.addEventListener('wheel', event => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || nativeZoomed() || printing.matches) return;
    if (!event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (dialog.open) {
      if (!dialog.contains(event.target) || !nativeScrollTarget(event.target)) event.preventDefault();
      return;
    }
    if (strip || capture || nativeScrollTarget(event.target)) return;
    event.preventDefault();

    const now = performance.now();
    const nextDirection = Math.sign(event.deltaY);
    if (now - lastWheelAt > gestureGap) {
      consumed = false;
      accumulated = 0;
      direction = nextDirection;
    }
    lastWheelAt = now;
    if (consumed) return;
    if (direction !== nextDirection) {
      accumulated = 0;
      direction = nextDirection;
    }
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    accumulated += Math.abs(event.deltaY) * unit;
    if (accumulated >= wheelThreshold) {
      consumed = true;
      go(current + direction);
    }
  }, { passive: false });

  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (strip || capture || nativeZoomed() || printing.matches || dialog.open || initialAnchorPending || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (movingTo && Math.abs(scrollY - movingTo.top) > 2 && performance.now() < movingTo.expires) return;
      movingTo = null;
      const center = (innerHeight + toolbarHeight()) / 2;
      const index = hosts.findIndex(host => host.getBoundingClientRect().bottom + 30 * zoom >= center);
      const visible = index < 0 ? roots.length - 1 : index;
      if (visible !== current) markPage(visible, 'replace');
    });
  }, { passive: true });

  function restoreLocation() {
    const index = hashIndex();
    if (index < 0 && location.hash) return;
    resetGesture();
    go(Math.max(0, index), { instant: true, historyMode: 'none' });
  }

  function requestFit() {
    if (nativeZoomed() || printing.matches || capture) return;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (nativeZoomed() || printing.matches) return;
      resetGesture();
      fitPages();
      if (!strip && !initialAnchorPending) go(current, { instant: true, historyMode: 'none' });
    });
  }

  document.addEventListener('pointerdown', resetGesture);
  if (!capture) history.scrollRestoration = 'manual';
  window.addEventListener('popstate', restoreLocation);
  window.addEventListener('hashchange', restoreLocation);
  window.addEventListener('resize', requestFit);
  for (const viewport of nativeViewports) viewport.addEventListener('resize', requestFit, { passive: true });
  new ResizeObserver(requestFit).observe(toolbar);
  printing.addEventListener('change', requestFit);
  updateView();
  if (initialAnchorPending) {
    current = initialIndex;
    const landOnInitialPage = () => requestAnimationFrame(() => {
      if (initialAnchorPending) go(initialIndex, { instant: true, historyMode: 'none' });
    });
    if (document.readyState === 'complete') landOnInitialPage();
    else window.addEventListener('load', landOnInitialPage, { once: true });
  }
})();
