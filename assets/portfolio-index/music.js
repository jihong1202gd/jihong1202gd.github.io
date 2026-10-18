(() => {
  'use strict';
  // Document-loading tabs reuse index.html but must not take over its music.
  if (document.documentElement.dataset.portfolioShell) return;
  const audio = document.getElementById('portfolio-bgm');
  const button = document.querySelector('.music-toggle');
  const label = button.querySelector('.music-label');
  const preferenceKey = 'jihong-portfolio-bgm-v1';
  const volumeKey = 'jihong-portfolio-bgm-volume-v1';
  const volumeInput = document.querySelector('.music-volume input');
  const volumeOutput = document.querySelector('.music-volume output');
  const volumeDown = document.querySelector('.volume-down');
  const volumeUp = document.querySelector('.volume-up');
  let lastLevel = 3, userStopped = false;
  let volumeContext, volumeGain;
  function setVolume(value, persist = false) {
    const parsed = Number(value);
    const level = Number.isInteger(parsed) && parsed >= 0 && parsed <= 5 ? parsed : 3;
    if (level > 0) lastLevel = level;
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
    volumeInput.setAttribute('aria-valuetext', level ? `5단계 중 ${level}단계` : 'BGM 꺼짐');
    volumeOutput.textContent = level ? `${level}/5` : '꺼짐';
    volumeDown.disabled = level === 0;
    volumeUp.disabled = level === 5;
    if (persist && level > 0) { try { localStorage.setItem(volumeKey, String(level)); } catch (_) {} }
  }
  let storedVolume;
  try { storedVolume = localStorage.getItem(volumeKey); } catch (_) {}
  setVolume(Number(storedVolume) >= 1 ? storedVolume : 3);
  function changeVolume(value) {
    if (Number(value) === 0) { remember('off'); stop(true); }
    else {
      setVolume(value, true);
      userStopped = false;
      if (audio.paused && !pending) { remember('on'); void start(true); }
    }
  }
  volumeInput.addEventListener('input', () => changeVolume(volumeInput.value));
  volumeDown.addEventListener('click', () => changeVolume(Math.max(0, Number(volumeInput.value) - 1)));
  volumeUp.addEventListener('click', () => changeVolume(Math.min(5, Number(volumeInput.value) + 1)));
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
    document.documentElement.dataset.bgmClickToPlay = String(blocked && !userStopped);
  }
  function stop(manual = false) {
    request++; desired = false; pending = false; blocked = false;
    if (manual) { userStopped = true; setVolume(0); }
    audio.pause(); update();
  }
  async function start(manual = false) {
    if (userStopped && !manual) return;
    if (manual) {
      userStopped = false;
      if (Number(volumeInput.value) === 0) setVolume(lastLevel);
    }
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
    if (desired || !audio.paused) { remember('off'); stop(true); }
    else { remember('on'); void start(true); }
  });
  // Use the first genuine click as a transparent play-only surface.
  // Capture observes the click without consuming links or controls underneath.
  document.addEventListener('click', event => {
    if (!event.isTrusted || event.button !== 0 || !blocked || userStopped || desired || !audio.paused) return;
    if (event.target?.closest?.('.music-toggle,.music-volume')) return;
    remember('on'); void start(true);
  }, true);
  audio.addEventListener('playing', () => {
    if (!desired) { audio.pause(); return; }
    pending = false; update();
    try { channel?.postMessage('playing'); } catch (_) {}
  });
  audio.addEventListener('pause', update);
  audio.addEventListener('error', () => { request++; desired = false; pending = false; failed = true; update(); });
  if (channel) channel.onmessage = event => { if (event.data === 'playing') stop(); };
  addEventListener('storage', event => {
    if (event.key === preferenceKey && event.newValue === 'off') stop(true);
    if (event.key === volumeKey && !userStopped) setVolume(Number(event.newValue) >= 1 ? event.newValue : 3);
  });
  addEventListener('pagehide', () => { stop(); });
  let enabled = true;
  try { enabled = localStorage.getItem(preferenceKey) !== 'off'; } catch (_) {}
  update();
  if (enabled) void start();
  else stop(true);
})();
