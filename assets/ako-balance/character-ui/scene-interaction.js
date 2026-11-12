(() => {
  'use strict';
  document.addEventListener('dragstart',event=>event.preventDefault(),true);
  document.addEventListener('selectstart',event=>{
    if (!event.target.closest('input,textarea,[contenteditable="true"]')) event.preventDefault();
  },true);
  document.querySelectorAll('img,a').forEach(element=>element.draggable=false);
  document.documentElement.dataset.dragPolicy = 'blocked';
})();
