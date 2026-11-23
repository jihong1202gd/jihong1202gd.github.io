// Parse-blocking index entry: hide the index before a deferred document transition can paint.
(() => {
  'use strict';
  const address = new URL(location.href);
  const route = address.searchParams.get('open-portfolio');
  const routes = new Set(['about.html', 'project-kizaki-ako.html', 'kizaki-ako-balance.html',
    'wuthering-waves-control-analysis.html', 'study-character-making.html']);
  const file = routes.has(route) ? route : routes.has(route + '.html') ? route + '.html' : null;
  if (!file) return;
  const target = new URL(file, address);
  target.hash = address.hash;
  // Local files cannot expose a sibling iframe reliably; keep the registered document and hash.
  if (address.protocol === 'file:') {location.replace(target.href);return;}
  const root = document.documentElement;
  root.dataset.portfolioShell = 'loading';
  const startedAt = performance.now();
  const status = document.createElement('div');
  status.id = 'portfolio-load-status';
  status.hidden = true;
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const message = document.createElement('p');
  const recovery = document.createElement('div');
  recovery.className = 'recovery';
  const direct = document.createElement('a');
  direct.textContent = '문서 바로 열기';
  direct.href = target.href;
  const back = document.createElement('a');
  back.textContent = '목차로 돌아가기';
  const home = new URL(address.href);
  home.search = '';
  home.hash = '';
  back.href = home.href;
  recovery.append(direct, back);
  status.append(message, recovery);
  function mount() {
    if (!document.body) return;
    document.body.append(status);
    observer.disconnect();
  }
  const observer = new MutationObserver(mount);
  observer.observe(root, {childList: true});
  mount();
  let complete = false;
  let noticeTimer, slowTimer;
  function show(state = 'loading') {
    if (complete) return;
    if (state === 'error') {clearTimeout(noticeTimer);clearTimeout(slowTimer);}
    status.dataset.state = state;
    message.textContent = state === 'error' ? '문서를 불러오지 못했어요' :
      state === 'slow' ? '연결이 늦어지고 있어요' : '기획서를 펼치는 중';
    status.hidden = false;
  }
  function finish() {
    complete = true;
    clearTimeout(noticeTimer);clearTimeout(slowTimer);
    status.hidden = true;
  }
  noticeTimer = setTimeout(() => show(), 2000);
  slowTimer = setTimeout(() => show('slow'), 15000);
  window.portfolioEntryState = Object.freeze({startedAt, target: target.href, show, finish});
})();
