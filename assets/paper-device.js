// Use the device screen in CSS pixels. Browser chrome, zoom, split windows and
// the desktop reader's iframe must not independently switch the document mode.
(() => {
  const pointer = matchMedia('(pointer: coarse)');
  const device = new EventTarget();
  function isPhone() {
    const shortEdge = Math.min(screen.width, screen.height);
    return pointer.matches && shortEdge > 0 && shortEdge <= 600;
  }
  let previous = isPhone();
  Object.defineProperty(device, 'matches', {get: isPhone});
  function sync() {
    const next = isPhone();
    if (next === previous) return;
    previous = next;
    device.dispatchEvent(new Event('change'));
  }
  pointer.addEventListener('change', sync);
  window.addEventListener('resize', sync);
  window.addEventListener('pageshow', sync);
  window.paperDevice = device;
})();
