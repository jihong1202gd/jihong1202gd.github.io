(() => {
  const phone = window.paperDevice;
  if (!phone.matches) return;
  const style = document.createElement('style');
  style.textContent = '#paper-opening{position:fixed;inset:0;z-index:2147483640;display:grid;place-content:center;gap:12px;text-align:center;padding:24px;box-sizing:border-box;background:#171b21;color:#fff;font:500 16px/1.55 system-ui,sans-serif;word-break:keep-all}#paper-opening strong{font-size:clamp(20px,4vmin,28px);color:white}#paper-opening p{font:inherit;color:#e5e9ef;margin:0}#paper-opening button{justify-self:center;min-height:44px;padding:0 18px;border:1px solid #78828f;border-radius:8px;background:transparent;color:white;font:inherit}#paper-opening button[hidden]{display:none}@media print{#paper-opening{display:none!important}}';
  document.head.append(style);
  const panel = document.createElement('aside');
  panel.id = 'paper-opening';
  panel.setAttribute('aria-label','문서 읽는 방법');
  panel.innerHTML = '<strong>휴대폰을 90° 돌려 가로로 읽어 주세요</strong><p>아래에서 위로 쓸어 올리면 다음 장,<br>위에서 아래로 쓸어 내리면 이전 장이에요.</p><p>지면을 한 번 탭하면 확대·축소 버튼이 나타나요.</p><button type="button" hidden>바로 읽기</button>';
  document.documentElement.append(panel);
  const shown = performance.now();
  function ready() {
    const button = panel.querySelector('button');
    button.hidden = false;
    button.addEventListener('click', () => panel.remove(), {once:true});
    const finish = () => setTimeout(() => panel.remove(), Math.max(0, 3500 - (performance.now() - shown)));
    const sheet = document.querySelector('.pr-current, .paper-current, .mobile-paper-current, [data-current-sheet], .ap-paper-current');
    const images = Array.from(sheet?.querySelectorAll('img') ?? []).filter(image => !image.complete && image.loading !== 'lazy');
    // Media on later pages may keep window.load pending after the first sheet is readable.
    const pending = images.map(image => image.decode().catch(() => {}));
    Promise.race([Promise.all(pending), new Promise(resolve => setTimeout(resolve, 4000))]).then(finish);
  }
  // The reader can be used as soon as the initial sheet and its controller have mounted.
  document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(() => requestAnimationFrame(ready)), {once:true});
})();
