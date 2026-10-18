(() => {
  'use strict';
  const feedback = document.querySelector('.copy-feedback');
  let feedbackTimer;
  for (const button of document.querySelectorAll('.contact-copy')) {
    button.addEventListener('click', async event => {
      const buttonBox = button.getBoundingClientRect();
      const anchor = event.detail > 0
        ? { x: event.clientX, y: event.clientY }
        : { x: buttonBox.left + buttonBox.width / 2, y: buttonBox.top };
      let message;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.copy);
        message = button.dataset.copyLabel === '이메일' ? '이메일을 복사했어요' : '전화번호를 복사했어요';
      } catch (_) {
        message = '복사하지 못했어요. 연락처를 선택해 직접 복사해 주세요.';
      }
      clearTimeout(feedbackTimer);
      feedback.textContent = message;
      feedback.style.left = '0px';
      feedback.style.top = '0px';
      feedback.hidden = false;
      const popup = feedback.getBoundingClientRect();
      const viewWidth = document.documentElement.clientWidth;
      const viewHeight = window.innerHeight;
      feedback.style.left = `${Math.max(8, Math.min(viewWidth - popup.width - 8, anchor.x - popup.width / 2))}px`;
      feedback.style.top = `${Math.max(8, Math.min(viewHeight - popup.height - 8, anchor.y - popup.height - 12))}px`;
      feedbackTimer = setTimeout(() => { feedback.hidden = true; }, 1500);
    });
  }
})();
