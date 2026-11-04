(() => {
  'use strict';
  if (window.top !== window || document.getElementById('portfolio-reader-tools')) return;

  const documents = {
    'about.html': { name: '자기 PR', contents: 'v13-contents' },
    'project-kizaki-ako.html': { name: '캐릭터 제안서', contents: 'slide-toc' },
    'wuthering-waves-control-analysis.html': { name: '전투 조작 분석', contents: 'contents' },
    'study-character-making.html': { name: '스터디 부록', contents: 'opening' }
  };
  const scriptUrl = document.currentScript.src;
  const address = new URL(location.href);
  const frameSource = document.getElementById('portfolio-document')?.getAttribute('src');
  const route = frameSource ? new URL(frameSource, address).pathname.split('/').pop() :
    address.searchParams.get('open-portfolio') || address.pathname.split('/').pop();
  if (!documents[route]) return;
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('reader.css?v=20261104-2', scriptUrl).href;
  document.head.append(stylesheet);

  function start() {
    const frame = document.getElementById('portfolio-document');
    const source = frame ? new URL(frame.src) : address;
    const toolbar = document.createElement('nav');
    toolbar.id = 'portfolio-reader-tools';
    toolbar.setAttribute('aria-label', '문서 열람 도구');
    toolbar.innerHTML = '<a class="reader-list" href="index.html" aria-label="포트폴리오 목록으로 돌아가기">포트폴리오 목록</a>' +
      '<label class="reader-switch"><span>문서 이동</span><select aria-label="다른 포트폴리오 문서로 이동"></select></label>' +
      '<div class="reader-actions"><button class="reader-contents" type="button">문서 목차</button>' +
      '<div class="reader-zoom" role="group" aria-label="문서 확대와 축소">' +
      '<button class="reader-minus" type="button" aria-label="문서 축소">−</button>' +
      '<button class="reader-fit" type="button" aria-label="화면에 맞추기" title="화면에 맞추기">맞춤</button>' +
      '<button class="reader-plus" type="button" aria-label="문서 확대">+</button></div>' +
      '<a class="reader-pdf" download>PDF ↓</a></div>';
    const switcher = toolbar.querySelector('.reader-switch select');
    for (const [index, [path, info]] of Object.entries(documents).entries()) {
      const option = document.createElement('option');
      option.value = path;
      option.textContent = index + '. ' + info.name;
      option.selected = path === route;
      switcher.append(option);
    }
    switcher.addEventListener('change', () => {
      if (switcher.value === route) return;
      const next = new URL('index.html', source);
      next.searchParams.set('open-portfolio', switcher.value);
      next.searchParams.set('portfolio-version', '20261104-reader-2');
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) next.searchParams.set('petal-motion', 'off');
      location.assign(next.href);
    });
    const pdf = toolbar.querySelector('.reader-pdf');
    pdf.href = new URL(route.replace(/\.html$/, '.pdf'), source).href;
    pdf.setAttribute('aria-label', documents[route].name + ' PDF 내려받기');
    let printLink = document.querySelector('.portfolio-print-source');
    if (!printLink) {
      printLink = document.createElement('a');
      printLink.href = source.href;
      printLink.target = '_blank';
      printLink.rel = 'noopener';
    }
    printLink.classList.add('reader-print');
    printLink.textContent = '인쇄 ↗';
    printLink.setAttribute('aria-label', '인쇄용 문서 새 탭에서 열기');
    toolbar.querySelector('.reader-actions').append(printLink);
    document.documentElement.append(toolbar);
    if (!frame) document.documentElement.dataset.portfolioReaderDirect = '';
    let toolbarHeight = 0;
    const syncToolbarHeight = () => {
      const height = toolbar.getBoundingClientRect().height;
      if (height === toolbarHeight) return;
      toolbarHeight = height;
      document.documentElement.style.setProperty('--portfolio-reader-offset', height + 'px');
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    };
    new ResizeObserver(syncToolbarHeight).observe(toolbar);
    syncToolbarHeight();

    let doc, win, original, zoom = 1;
    const steps = [1, 1.5, 2, 2.5, 3, 4];
    const minus = toolbar.querySelector('.reader-minus');
    const plus = toolbar.querySelector('.reader-plus');
    const fit = toolbar.querySelector('.reader-fit');
    const contents = toolbar.querySelector('.reader-contents');
    minus.disabled = plus.disabled = contents.disabled = true;

    function restoreStyles() {
      if (!doc?.body || !original) return;
      for (const key of ['zoom', 'width']) {
        if (original[key]) doc.body.style.setProperty(key, original[key]);
        else doc.body.style.removeProperty(key);
      }
      for (const item of original.dialogs) {
        if (item.zoom) item.element.style.zoom = item.zoom;
        else item.element.style.removeProperty('zoom');
      }
    }

    function applyZoom(next, keepPosition = true) {
      if (!doc?.body || !win || !original) return;
      const old = zoom;
      const leftX = win.scrollX / old;
      const topY = win.scrollY / old;
      zoom = next;
      restoreStyles();
      if (zoom !== 1) {
        // The document keeps its own page layout and fit logic; magnify that result.
        doc.body.style.width = doc.documentElement.clientWidth + 'px';
        doc.body.style.zoom = String(zoom);
        for (const item of original.dialogs) item.element.style.zoom = String(1 / zoom);
      }
      fit.textContent = zoom === 1 ? '맞춤' : Math.round(zoom * 100) + '%';
      fit.setAttribute('aria-label', zoom === 1 ? '화면에 맞춰 보는 중' : Math.round(zoom * 100) + '% 확대 중, 화면에 맞추기');
      minus.disabled = zoom === steps[0];
      plus.disabled = zoom === steps[steps.length - 1];
      if (keepPosition) requestAnimationFrame(() => win.scrollTo({
        left: zoom === 1 ? 0 : leftX * zoom,
        top: topY * zoom, behavior: 'instant'
      }));
    }

    function bindDocument() {
      const candidate = frame ? frame.contentDocument : document;
      if (!candidate?.body || (frame && new URL(candidate.URL).pathname !== source.pathname)) return;
      doc = candidate;
      win = frame ? frame.contentWindow : window;
      original = {
        zoom: doc.body.style.getPropertyValue('zoom'),
        width: doc.body.style.getPropertyValue('width'),
        dialogs: [...doc.querySelectorAll('dialog')].map(element => ({ element, zoom: element.style.zoom }))
      };
      zoom = 1;
      contents.disabled = !doc.getElementById(documents[route].contents);
      applyZoom(1, false);
      win.addEventListener('resize', () => requestAnimationFrame(() => applyZoom(zoom, false)));
      win.addEventListener('beforeprint', restoreStyles);
      win.addEventListener('afterprint', () => requestAnimationFrame(() => applyZoom(zoom, false)));
    }

    minus.addEventListener('click', () => applyZoom(steps[Math.max(0, steps.indexOf(zoom) - 1)]));
    plus.addEventListener('click', () => applyZoom(steps[Math.min(steps.length - 1, steps.indexOf(zoom) + 1)]));
    fit.addEventListener('click', () => applyZoom(1));
    contents.addEventListener('click', () => {
      const target = doc?.getElementById(documents[route].contents);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const top = win.portfolioReaderPageTop?.(rect.height) || 0;
      win.scrollTo({ top: win.scrollY + rect.top - top, behavior: 'instant' });
    });
    if (frame) {
      frame.addEventListener('load', bindDocument);
      if (frame.contentDocument?.readyState === 'complete') bindDocument();
    } else bindDocument();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
