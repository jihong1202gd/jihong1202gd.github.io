(() => {
  'use strict';
  const viewport = document.querySelector('#character-viewport');
  const frame = document.querySelector('#character-scene');
  const design = {width:1920,height:1080};
  let pending = 0;
  function fit() {
    const scale = Math.min(innerWidth/design.width, innerHeight/design.height);
    viewport.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    viewport.dataset.scale = scale.toFixed(6);
    viewport.dataset.ready = 'true';
    pending = 0;
  }
  function schedule() {
    if (!pending) pending = requestAnimationFrame(fit);
  }
  function closePage(){
    if(parent!==window)parent.postMessage({type:'ako:close-page'},location.protocol==='file:'?'*':location.origin);
    else window.close();
  }
  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!event.defaultPrevented&&parent!==window){event.preventDefault();frame.contentWindow?.postMessage({type:'ako:request-escape'},location.protocol==='file:'?'*':location.origin);}
  });
  document.addEventListener('dragstart',event=>event.preventDefault(),true);
  window.addEventListener('resize',schedule);
  window.addEventListener('message',event=>{
    if (event.source === frame.contentWindow && event.origin === location.origin &&
        event.data?.type === 'ako:close-page') {
      closePage();
    }
  });
  const source = new URL('character-scene.html',location.href);
  source.search = location.search;
  if (frame.src !== source.href) frame.src = source.href;
  fit();
})();
