// A swipe follows the displayed sheet even if the phone is locked in portrait.
window.bindPaperSwipe = function (isReading, turnPage) {
  window.paperReader = {isReading, turnPage};
  document.dispatchEvent(new Event('paper-reader-ready'));
  let start;
  const rotated = () => matchMedia('(orientation: portrait)').matches;
  const available = () => isReading() && !document.getElementById('portfolio-transition') && !document.querySelector('[data-paper-enlarged]') && (window.visualViewport?.scale ?? 1) <= 1.01 &&
    !document.querySelector('dialog[open], [aria-modal="true"]:not([hidden]):not(dialog)');

  function ownsDrag(target) {
    if (target.closest('nav, input, textarea, select, video, audio, iframe, [contenteditable="true"], [role="slider"]')) return true;
    for (let el = target; el && el !== document.body; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 1 && /^(auto|scroll)$/.test(getComputedStyle(el).overflowY)) return true;
    }
    return false;
  }

  function distance(touch) {
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    return start.rotated ? {up: dx, across: dy} : {up: -dy, across: dx};
  }

  document.addEventListener('touchstart', event => {
    start = null;
    if (event.touches.length !== 1 || !available() || ownsDrag(event.target)) return;
    const touch = event.touches[0];
    start = {id: touch.identifier, x: touch.clientX, y: touch.clientY, rotated: rotated()};
  }, {capture: true, passive: true});

  document.addEventListener('touchmove', event => {
    if (!start) return;
    if (event.touches.length !== 1 || !available() || start.rotated !== rotated()) {
      start = null;
      return;
    }
    const {up, across} = distance(event.touches[0]);
    if (Math.abs(up) > 8 && Math.abs(up) > Math.abs(across) * 1.3 && event.cancelable) event.preventDefault();
  }, {capture: true, passive: false});

  document.addEventListener('touchend', event => {
    if (!start) return;
    const touch = Array.from(event.changedTouches).find(item => item.identifier === start.id);
    const movement = touch && distance(touch);
    const eligible = !event.touches.length && available() && start.rotated === rotated();
    start = null;
    if (!eligible || !movement) return;
    const {up, across} = movement;
    if (Math.abs(up) < 42 || Math.abs(up) < Math.abs(across) * 1.3) return;
    if (event.cancelable) event.preventDefault();
    document.dispatchEvent(new Event('paper-turn'));
    const step = up > 0 ? 1 : -1;
    const changedDocument = window.portfolioTurnDocument
      ? window.portfolioTurnDocument(step)
      : step > 0 && window.portfolioAdvanceDocument?.();
    if (changedDocument) return;
    turnPage(step);
  }, {capture: true, passive: false});

  document.addEventListener('touchcancel', () => { start = null; }, {capture: true, passive: true});
};
