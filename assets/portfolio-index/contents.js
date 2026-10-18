(() => {
  'use strict';
  const storageKey = 'jihong-portfolio-opened-v1';
  const routes = new Set(['about.html', 'project-kizaki-ako.html', 'wuthering-waves-control-analysis.html', 'study-character-making.html']);
  const rows = [...document.querySelectorAll('.contents li')].map(element => {
    const link = element.querySelector('a.chapter');
    const route = new URL(link.href).pathname.split('/').pop();
    const marker = document.createElement('span');
    marker.className = 'chapter-opened'; marker.hidden = true;
    marker.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'opened-label'; label.hidden = true;
    label.textContent = ' (열어본 문서)';
    link.querySelector('.chapter-number').append(marker);
    link.append(label);
    return { element, link, route, marker, label };
  });
  function updateOpened() {
    let opened = [];
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(value)) opened = value.filter(route => routes.has(route));
    } catch (_) {}
    for (const row of rows) {
      const seen = opened.includes(row.route);
      row.element.dataset.opened = String(seen);
      row.marker.hidden = !seen; row.label.hidden = !seen;
      const number = row.link.querySelector('.chapter-number');
      if (seen) number.title = '열어본 문서'; else number.removeAttribute('title');
    }
  }
  updateOpened();
  addEventListener('storage', event => { if (event.key === storageKey || event.key === null) updateOpened(); });
  addEventListener('pageshow', updateOpened);
  addEventListener('focus', updateOpened);

})();
