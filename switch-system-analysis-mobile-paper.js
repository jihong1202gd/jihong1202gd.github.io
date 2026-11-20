
(() => {
  const root = document.documentElement;
  const main = document.querySelector('.v106-main');
  const pages = [...main.querySelectorAll('.v106-page-wrap')];
  const mobile = window.paperDevice;
  const portrait = matchMedia('(orientation: portrait)');
  let current = pages[0];


  const nav = document.createElement('nav');
  nav.className = 'mobile-paper-nav';
  nav.setAttribute('aria-label', '지면 이동');
  nav.innerHTML = '<button type="button" aria-label="이전 지면">‹</button><button type="button" aria-label="다음 지면">›</button>';
  const [previous, next] = nav.children;
  document.body.append(nav);

  function go(offset) {
    const target = pages[pages.indexOf(current) + offset];
    if (target) navigateTo(target.id);
  }

  previous.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  window.mobilePaperSelect = page => {
    if (!mobile.matches) return;
    current.classList.remove('mobile-paper-current');
    current = page;
    current.classList.add('mobile-paper-current');
    previous.disabled = current === pages[0];
    next.disabled = current === pages.at(-1);
  };

  function sync() {
    if ((visualViewport?.scale ?? 1) > 1.01) return;

    if (!mobile.matches) {
      if (root.hasAttribute('data-mobile-paper')) {
        root.removeAttribute('data-mobile-paper');
        root.removeAttribute('data-mobile-paper-nav');
        current.classList.remove('mobile-paper-current');
        navigateTo(current.id, false);
      }
      return;
    }

    const isPortrait = portrait.matches;
    const cross = isPortrait ? innerWidth : innerHeight;
    const long = isPortrait ? innerHeight : innerWidth;
    root.dataset.mobilePaper = isPortrait ? 'portrait' : 'landscape';
    root.style.setProperty('--mobile-paper-scale', String(Math.min(cross / 1080, long / 1920)));
    root.toggleAttribute('data-mobile-paper-nav', (long - cross * 16 / 9) / 2 >= 56);
    window.mobilePaperSelect(pages.find(page => '#' + page.id === location.hash) ?? current);
  }

  function blocked() {
    return !mobile.matches || (visualViewport?.scale ?? 1) > 1.01 ||
      !!document.querySelector('dialog[open]');
  }

  window.bindPaperSwipe(() => mobile.matches, go);
  window.addEventListener('keydown', event => {
    if (blocked() || event.defaultPrevented ||
      event.target.closest('input, select, textarea, button, a, [contenteditable="true"]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') go(-1);
    if (event.key === 'ArrowRight' || event.key === 'PageDown') go(1);
  });
  mobile.addEventListener('change', sync);
  portrait.addEventListener('change', sync);
  window.addEventListener('resize', sync);
  visualViewport?.addEventListener('resize', sync);
  sync();
})();
