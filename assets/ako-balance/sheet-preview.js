(() => {
  const portrait = matchMedia('(orientation: portrait)');
  if (new URLSearchParams(location.search).has('capture')) return;
  const mobile = () => window.paperDevice.matches;
  const followViewport = () => {
    if (mobile() !== document.documentElement.classList.contains('balance-sheets')) location.reload();
  };
  window.paperDevice.addEventListener('change', followViewport);
  if (!mobile()) return;

  const root = document.documentElement;
  const reader = document.getElementById('document');
  const hosts = [...reader.querySelectorAll('.page-host')];
  const sheets = hosts.map(host => host.querySelector('.bs-page'));
  const dialog = document.getElementById('detail-dialog');
  const detail = document.getElementById('detail-body');
  const title = document.getElementById('dialog-title');
  const nav = document.createElement('nav');
  nav.className = 'sheet-navigation';
  nav.setAttribute('aria-label', '아코 밸런스 지면 이동');
  const counter = document.createElement('output');
  const button = (label, action) => {
    const control = document.createElement('button');
    control.type = 'button';
    control.textContent = label;
    control.addEventListener('click', action);
    return control;
  };
  let index = 0;
  let trigger;
  let navigationTimer;

  function hideNavigation() {
    window.clearTimeout(navigationTimer);
    nav.classList.remove('is-open');
  }

  function revealNavigation() {
    window.clearTimeout(navigationTimer);
    nav.classList.add('is-open');
    navigationTimer = window.setTimeout(hideNavigation, 5000);
  }

  function isZoomed() {
    return Math.abs((window.visualViewport?.scale ?? 1) - 1) > 0.01;
  }
  const previous = button('이전', () => show(index - 1, true));
  const contents = button('목차', () => show(sheets.findIndex(sheet => sheet.id === 'contents'), true));
  const next = button('다음', () => show(index + 1, true));
  nav.append(previous, contents, counter, next);
  reader.after(nav);
  window.bindPaperSwipe(mobile, step => show(index + step, true));
  root.classList.add('balance-sheets');
  history.scrollRestoration = 'manual';

  function fit() {
    const sideways = portrait.matches;
    const width = root.clientWidth;
    const height = innerHeight;
    const naturalWidth = sideways ? 1080 : 1920;
    const naturalHeight = sideways ? 1920 : 1080;
    const scale = Math.min(width / naturalWidth, height / naturalHeight);
    const gutter = (sideways ? height - naturalHeight * scale : width - naturalWidth * scale) / 2;
    root.classList.toggle('sheet-sideways', sideways);
    root.classList.toggle('sheet-docked', gutter >= 52);
    root.classList.toggle('sheet-overlay', gutter < 1);
    if (gutter >= 1) hideNavigation();
    root.style.setProperty('--sheet-viewport-height', height + 'px');
    root.style.setProperty('--sheet-width', naturalWidth * scale + 'px');
    root.style.setProperty('--sheet-height', naturalHeight * scale + 'px');
    root.style.setProperty('--sheet-gutter', gutter + 'px');
    root.style.setProperty('--sheet-scale', scale);
  }

  function show(target, record = false) {
    index = Math.max(0, Math.min(sheets.length - 1, target));
    hosts.forEach((host, position) => host.toggleAttribute('data-current-sheet', position === index));
    previous.disabled = index === 0;
    next.disabled = index === sheets.length - 1;
    counter.value = (index + 1) + ' / ' + sheets.length;
    const hash = '#' + sheets[index].id;
    if (record && location.hash !== hash) history.pushState(null, '', hash);
    window.scrollTo(0, 0);
    if (nav.classList.contains('is-open')) revealNavigation();
  }

  function restore() {
    show(sheets.findIndex(sheet => '#' + sheet.id === location.hash));
  }

  function close() {
    dialog.close();
    trigger?.focus({preventScroll: true});
  }

  reader.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      const target = sheets.findIndex(sheet => '#' + sheet.id === link.hash);
      if (target >= 0) {
        event.preventDefault();
        show(target, true);
        if (link.hash === '#contents') sheets[target].focus({preventScroll: true});
      }
    }
    const control = event.target.closest('[data-image], [data-detail]');
    if (!control) {
      const blank = event.target.matches('.bs-page, .bs-content, .toc-columns, .part-core, .part-nodes');
      if (blank && event.detail === 1 && !dialog.open && !isZoomed() && root.classList.contains('sheet-overlay')) {
        if (nav.classList.contains('is-open')) hideNavigation();
        else revealNavigation();
      }
      return;
    }
    hideNavigation();

    if (control.dataset.image) {
      const figure = control.closest('figure');
      const image = figure.querySelector('img').cloneNode();
      image.className = 'detail-image';
      image.src = control.dataset.image;
      title.textContent = figure.querySelector('figcaption').textContent;
      detail.replaceChildren(image);
    } else {
      const template = document.getElementById('detail-' + control.dataset.detail);
      if (!template) return;
      title.textContent = '설계 근거와 상세 계산';
      detail.replaceChildren(template.content.cloneNode(true));
    }
    trigger = control;
    dialog.showModal();
    detail.scrollTop = 0;
  });

  document.getElementById('close-detail').addEventListener('click', close);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) close();
  });
  window.addEventListener('popstate', restore);
  window.addEventListener('hashchange', restore);
  window.addEventListener('resize', fit);
  window.visualViewport?.addEventListener('resize', () => {
    if (isZoomed()) hideNavigation();
  });
  fit();
  restore();
})();
