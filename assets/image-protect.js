/* Discourages casual saving of images and videos: no context menu, no drag-out,
   no download button. Text selection, links and zoom viewers are unaffected.
   This is a deterrent only; it cannot stop screenshots or direct file URLs. */
(function () {
  'use strict';
  var MEDIA = /^(IMG|VIDEO|CANVAS)$/;

  function isMedia(el) {
    return !!el && el.nodeType === 1 && MEDIA.test(el.tagName);
  }

  document.addEventListener('contextmenu', function (e) {
    if (isMedia(e.target)) e.preventDefault();
  }, true);

  document.addEventListener('dragstart', function (e) {
    if (isMedia(e.target)) e.preventDefault();
  }, true);

  function hardenElement(el) {
    if (el.tagName === 'IMG') {
      el.draggable = false;
      el.style.webkitTouchCallout = 'none';
      el.style.webkitUserSelect = 'none';
      el.style.userSelect = 'none';
    } else if (el.tagName === 'VIDEO') {
      el.setAttribute('controlsList', 'nodownload noremoteplayback');
      el.disablePictureInPicture = true;
    }
  }

  function harden(root) {
    if (isMedia(root)) hardenElement(root);
    if (root.querySelectorAll) {
      var list = root.querySelectorAll('img, video');
      for (var i = 0; i < list.length; i++) hardenElement(list[i]);
    }
  }

  function start() {
    harden(document);
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1) harden(added[j]);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
