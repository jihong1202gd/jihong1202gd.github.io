const root = document.documentElement;
const slides = Array.from(document.querySelectorAll('body > .slide[id]'));
const byId = new Map(slides.map((slide, index) => [slide.id, index]));
const isPhone = window.paperDevice;
if (isPhone.matches && window.frameElement?.id === 'portfolio-document') {
  window.top.location.replace(window.location.href);
}
const navigation = document.createElement('nav');
navigation.className = 'paper-navigation';
navigation.setAttribute('aria-label', '문서 쪽 이동');
navigation.innerHTML = '<div class="paper-strip paper-top"><button type="button" data-step="-1">이전</button><button type="button" data-page="slide-toc">목차</button></div><div class="paper-strip paper-bottom"><output aria-live="polite"></output><button type="button" data-step="1">다음</button></div>';
document.body.append(navigation);
const previous = navigation.querySelector('[data-step="-1"]');
const next = navigation.querySelector('[data-step="1"]');
const count = navigation.querySelector('output');
let current = byId.get(location.hash.slice(1)) ?? 0;
let wasPhone = false;
let backgroundTap = null;
let overlayTimer = null;

function hasOverlayNavigation() {
  return navigation.classList.contains('paper-fallback');
}

function hideOverlay() {
  clearTimeout(overlayTimer);
  overlayTimer = null;
  if (hasOverlayNavigation()) navigation.hidden = true;
}

function canTapBackground() {
  return isPhone.matches && hasOverlayNavigation() &&
    Math.abs((window.visualViewport?.scale ?? 1) - 1) < 0.01 &&
    !document.querySelector('dialog[open]');
}

function isPaperBackground(target) {
  const slide = slides[current];
  // Two full-page canvases and the closing illustration also form the paper background.
  return target === slide || (target?.parentElement === slide && target.matches(
    '.p2b-v2-canvas, .p2c-v1-canvas, #slide-end > img.ako-static-035e1cf7'
  ));
}

function movedSinceDown(event, tap) {
  return Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 12;
}

document.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'touch') return;
  backgroundTap = null;
  if (!event.isPrimary || !canTapBackground() || !isPaperBackground(event.target)) return;
  backgroundTap = {id: event.pointerId, x: event.clientX, y: event.clientY, started: event.timeStamp};
}, {passive: true});
document.addEventListener('pointermove', event => {
  if (backgroundTap?.id === event.pointerId && movedSinceDown(event, backgroundTap)) backgroundTap = null;
}, {passive: true});
document.addEventListener('pointercancel', () => { backgroundTap = null; }, {passive: true});
document.addEventListener('pointerup', event => {
  const tap = backgroundTap;
  if (!tap || tap.id !== event.pointerId) return;
  backgroundTap = null;
  if (!canTapBackground() || movedSinceDown(event, tap) || event.timeStamp - tap.started > 450 ||
      !isPaperBackground(document.elementFromPoint(event.clientX, event.clientY))) return;
  if (overlayTimer !== null) {
    hideOverlay();
    return;
  }
  navigation.hidden = false;
  overlayTimer = window.setTimeout(hideOverlay, 6000);
}, {passive: true});

function sizePaper() {
  if (!isPhone.matches) return;
  const width = root.clientWidth;
  const height = window.innerHeight;
  const sideways = width < height;
  const scale = sideways ? Math.min(width / 1080, height / 1920) : Math.min(width / 1920, height / 1080);
  const gap = ((sideways ? height : width) - 1920 * scale) / 2;
  const fallback = gap < 46;
  if (fallback !== hasOverlayNavigation() || sideways !== root.classList.contains('paper-sideways')) {
    backgroundTap = null;
    hideOverlay();
  }
  navigation.classList.toggle('paper-fallback', fallback);
  root.classList.toggle('paper-sideways', sideways);
  root.style.setProperty('--paper-angle', sideways ? '90deg' : '0deg');
  root.style.setProperty('--paper-scale', scale);
  root.style.setProperty('--paper-gap', Math.max(0,gap) + 'px');
  navigation.hidden = fallback && overlayTimer === null;
}

function sync() {
  const phone = isPhone.matches;
  root.classList.toggle('mobile-paper', phone);
  for (const [index, slide] of slides.entries()) {
    slide.classList.toggle('paper-current', phone && index === current);
  }
  count.value = (current + 1) + ' / ' + slides.length;
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  if (phone) sizePaper();
  else {
    backgroundTap = null;
    hideOverlay();
    navigation.hidden = true;
  }
  if (!phone && wasPhone) slides[current].scrollIntoView({behavior: 'instant'});
  wasPhone = phone;
}

function go(index, record) {
  if (index === undefined || index < 0 || index >= slides.length) return;
  hideOverlay();
  current = index;
  if (record) history.pushState(null, '', '#' + slides[current].id);
  sync();
}

navigation.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  go(button.dataset.page ? byId.get(button.dataset.page) : current + Number(button.dataset.step), true);
});
document.addEventListener('click', event => {
  const anchor = event.target.closest('a[href^="#"]');
  if (!isPhone.matches || !anchor || event.defaultPrevented) return;
  const index = byId.get(anchor.hash.slice(1));
  if (index === undefined) return;
  event.preventDefault();
  go(index, true);
});
window.addEventListener('hashchange', () => go(byId.get(location.hash.slice(1)) ?? 0, false));
window.addEventListener('resize', sizePaper);
window.bindPaperSwipe(() => isPhone.matches, step => go(current + step, true));
isPhone.addEventListener('change', sync);
document.addEventListener('keydown', event => {
  if (!isPhone.matches || document.querySelector('dialog[open]') || event.defaultPrevented ||
      event.altKey || event.ctrlKey || event.metaKey ||
      event.target.closest('button, a, input, select, textarea, video, [role="region"]')) return;
  if (event.key === 'PageUp') go(current - 1, true);
  if (event.key === 'PageDown') go(current + 1, true);
});
sync();

