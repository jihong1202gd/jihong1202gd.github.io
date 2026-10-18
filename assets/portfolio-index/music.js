(() => {
  'use strict';
  const audio = document.getElementById('portfolio-bgm');
  const button = document.querySelector('.music-toggle');
  const label = button.querySelector('.music-label');
  const preferenceKey = 'jihong-portfolio-bgm-v1';
  const volumeKey = 'jihong-portfolio-bgm-volume-v1';
  const volumeInput = document.querySelector('.music-volume input');
  const volumeOutput = document.querySelector('.music-volume output');
  let volumeContext, volumeGain;
  function setVolume(value, persist = false) {
    const parsed = Number(value);
    const level = Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : 3;
    const amount = level / 5;
    if (!volumeGain) {
      const probe = amount === 1 ? 0.6 : amount;
      try { audio.volume = probe; } catch (_) {}
      // Some mobile browsers keep media.volume at 1. Use a gain node there.
      if (Math.abs(audio.volume - probe) > 0.01) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (Context) {
          try {
            volumeContext = new Context();
            const gain = volumeContext.createGain();
            const source = volumeContext.createMediaElementSource(audio);
            source.connect(gain); gain.connect(volumeContext.destination);
            volumeGain = gain; audio.volume = 1;
          } catch (_) {}
        }
      } else audio.volume = amount;
    }
    if (volumeGain) volumeGain.gain.value = amount;
    volumeInput.value = String(level);
    volumeInput.setAttribute('aria-valuetext', `5단계 중 ${level}단계`);
    volumeOutput.textContent = `${level}/5`;
    if (persist) { try { localStorage.setItem(volumeKey, String(level)); } catch (_) {} }
  }
  let storedVolume;
  try { storedVolume = localStorage.getItem(volumeKey); } catch (_) {}
  setVolume(storedVolume);
  volumeInput.addEventListener('input', () => setVolume(volumeInput.value, true));
  let desired = false, pending = false, blocked = false, request = 0, failed = false;
  let channel;
  try { channel = new BroadcastChannel('jihong-portfolio-bgm'); } catch (_) {}
  function remember(value) { try { localStorage.setItem(preferenceKey, value); } catch (_) {} }
  function update() {
    const playing = !audio.paused && !audio.ended;
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-busy', String(pending));
    button.dataset.state = pending ? 'loading' : playing ? 'playing' : blocked ? 'blocked' : failed ? 'error' : 'paused';
    label.textContent = pending ? 'BGM 준비' : playing ? 'BGM 끄기' : 'BGM 켜기';
    button.title = failed ? '음악을 불러오지 못했습니다. 다시 눌러주세요.' : pending ? '음악을 불러오는 중입니다. 다시 누르면 취소합니다.' : playing ? 'A Spring Morning Surprise 일시정지' : 'A Spring Morning Surprise 재생';
    button.setAttribute('aria-label', playing ? '배경음악 일시정지' : '배경음악 재생');
  }
  function stop() {
    request++; desired = false; pending = false; audio.pause(); update();
  }
  async function start(manual = false) {
    const current = ++request;
    desired = true; pending = true; blocked = false; failed = false; update();
    try {
      if (volumeContext && volumeContext.state !== 'running' && !manual) {
        const error = new Error('Audio requires user interaction');
        error.name = 'NotAllowedError'; throw error;
      }
      const resumed = volumeContext?.resume();
      await Promise.all([audio.play(), resumed]);
      if (current !== request) return;
      if (!desired) { audio.pause(); return; }
    } catch (error) {
      if (current === request && desired) {
        desired = false;
        audio.pause();
        blocked = error.name === 'NotAllowedError';
        failed = !blocked && error.name !== 'AbortError';
      }
    } finally { if (current === request) { pending = false; update(); } }
  }
  button.addEventListener('click', () => {
    if (desired || !audio.paused) { remember('off'); stop(); }
    else { remember('on'); void start(true); }
  });
  audio.addEventListener('playing', () => {
    if (!desired) { audio.pause(); return; }
    pending = false; update();
    try { channel?.postMessage('playing'); } catch (_) {}
  });
  audio.addEventListener('pause', update);
  audio.addEventListener('error', () => { request++; desired = false; pending = false; failed = true; update(); });
  if (channel) channel.onmessage = event => { if (event.data === 'playing') stop(); };
  addEventListener('storage', event => {
    if (event.key === preferenceKey && event.newValue === 'off') stop();
    if (event.key === volumeKey) setVolume(event.newValue);
  });
  addEventListener('pagehide', () => { stop(); });
  let enabled = true;
  try { enabled = localStorage.getItem(preferenceKey) !== 'off'; } catch (_) {}
  update();
  if (enabled) void start();
})();
