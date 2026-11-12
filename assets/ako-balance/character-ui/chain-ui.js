(() => {
  'use strict';
  const orbit = document.querySelector('.chain-orbit');
  const panel = document.querySelector('.chain-info');
  const hero = document.querySelector('[data-hero-kind="chain"]');
  function layout(open){orbit.dataset.detailOpen=String(open);hero.dataset.detailOpen=String(open);}
  const nodes = [...document.querySelectorAll('.chain-node')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const chains = [
    {
      title: '경직 면역 · 강화 일반공격', increase: 9.231894616715, dps: 147614,
      paragraphs: ['공명 해방 사용 후 강화 일반공격이 끝날 때까지 경직에 면역이 되며, 강화 일반공격 피해 보너스가 30%p 증가한다.', '최대 6초 동안 지속되며, 교대 시 종료된다.'],
      rules: ['피해 보너스는 동일한 피해 보너스 항목에 합산한다.', '강화 일반공격 전용 효과이며, 6돌 분신에는 적용되지 않는다.']
    },
    {
      title: '회로 치명타 피해 강화', increase: 30.762222828526, dps: 176710,
      paragraphs: ['「핏방울」 보유 시 개당 크리티컬 피해 증가량이 17.5%에서 30%로 증가한다.', '소모 시 개당 증가량이 35%에서 60%로 증가하여, 4개 소모 시 크리티컬 피해가 240% 증가한다. 지속시간은 명함과 동일한 6초다.'],
      rules: ['보유 효과와 소모 효과는 동시에 적용되지 않는다.', '치명타 피해 증가량은 기존 치명타 피해에 합산한다.']
    },
    {
      title: '강화 일반공격 계수 증가', increase: 60.208920296635, dps: 216503,
      paragraphs: ['강화 일반공격 1~5단의 공격 계수가 1.30배가 된다.'],
      rules: ['본체가 사용하는 강화 일반공격에 적용한다.', '6돌 분신의 공격 계수에는 이 효과가 적용되지 않는다.']
    },
    {
      title: '파티 공격력 증가', increase: 69.650568059570, dps: 229263,
      paragraphs: ['공명 해방 사용 시 파티 전체 캐릭터의 공격력이 20% 증가하며, 20초 동안 지속된다.'],
      rules: ['공격력 증가량은 기존 공격력 증가 효과에 합산한다.', '표시된 개인 DPS 상승률에는 아코 본인이 받는 공격력 증가만 반영한다.']
    },
    {
      title: '회복 · 받는 피해 감소', increase: 69.650568059570, dps: 229263,
      paragraphs: ['공명 해방 사용 시 자신의 최대 HP 20%에 해당하는 HP를 회복한다.', '강화 일반공격이 끝날 때까지 받는 피해가 20% 감소한다. 최대 6초 동안 지속되며, 교대 시 피해 감소 효과가 종료된다.'],
      rules: ['회복은 공명 해방 사용 시 발동한다.', '이상적인 공격 지속 조건에서는 직접적인 피해 증가가 없어, 개인 DPS 누적 상승률은 4돌과 같다.']
    },
    {
      title: '두 모드의 분신', increase: 181.554580532357, dps: 380488,
      paragraphs: ['일반공격 사용 시 반대 모드의 분신 1개가 나타나 해당 타수의 일반공격을 함께 사용한다.', '강화 일반공격 사용 시에는 근거리·원거리 분신이 각각 1개씩 나타나 해당 타수의 일반공격을 사용한다.', '모든 분신은 해당 단의 공통 일반공격 계수를 기준으로 125%의 동일한 공격 배율을 사용한다. 각 단 공격 사용 시 발동하며, 5단 완주가 필요하지 않다.'],
      rules: ['분신의 공격은 일반공격 피해로 판정한다.', '각 분신의 실제 타격 시점에 유효한 버프와 공명 회로 치명타 피해 증가 효과를 적용한다.', '근거리·원거리 분신의 계수는 동일하다. 본체 두 태세의 피해 차이 보정은 분신에 추가 적용하지 않는다.', '강화 5단에 동반되는 원거리 분신의 폭발은 공명 해방 발동 후 242프레임(약 4.03초)에 적중하므로, 6초간의 소비 치명타 피해 증가 효과를 적용한다.', '강화 일반공격 전용인 1돌 피해 보너스와 3돌 계수 증가는 분신에 적용하지 않는다.', '생성된 분신은 교대 후에도 자신의 공격을 마저 수행한다.', '분신은 추가 분신·협주 에너지·공명 에너지·공명 회로 자원을 생성하지 않는다.', '피해 계산은 분신이 본체와 병행하여 공격하고, 추가 출전 시간이 없으며, 모든 타격이 명중하는 조건이다.']
    }
  ];
  let visible = false, selected = 0, transition = null;
  function show(rank, focus = false) {
    const data = chains[rank - 1];
    if (!data || !visible) return;
    selected = rank;
    layout(true);
    nodes.forEach((node, index) => {
      node.setAttribute('aria-pressed', String(index + 1 === rank));
      node.setAttribute('aria-expanded', String(index + 1 === rank));
    });
    document.querySelector('#chain-level-caption').textContent = '공명 체인 · 제' + rank + '단계';
    document.querySelector('#chain-title').textContent = data.title;
    const copy = document.querySelector('#chain-effect-copy');
    copy.replaceChildren(...data.paragraphs.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
    document.querySelector('#chain-performance-value').textContent = '+' + data.increase.toFixed(2) + '%';
    document.querySelector('#chain-rule-list').replaceChildren(...data.rules.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    document.querySelector('#chain-calculation-note').textContent = '전투 시계 기준 개인 DPS ' + data.dps.toLocaleString('ko-KR') + ' / 명함 135,138. 순차 321321에서 아코 2회 출전의 시작→캔슬 합계 15.933333초로 나누며 시간정지 컷씬을 제외한다. 회로 치피 6초와 각 타격 시점의 버프를 적용했다. 파티 DPS 상승률이 아니다. 설계 프레임·전타 명중 조건의 기대값이다.';
    panel.querySelector('.chain-extra').open = false;
    panel.hidden = false;
    panel.scrollTop = 0;
    if (transition) transition.cancel();
    if (!reduced.matches) transition = copy.animate([{opacity: 0}, {opacity: 1}], {duration: 160, easing: 'ease-out'});
    if (focus) nodes[rank - 1].focus();
  }
  nodes.forEach((node, index) => {
    node.addEventListener('click', () => show(index + 1));
    node.addEventListener('keydown', event => {
      let rank = index + 1;
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') rank = Math.min(6, rank + 1);
      else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') rank = Math.max(1, rank - 1);
      else if (event.key === 'Home') rank = 1;
      else if (event.key === 'End') rank = 6;
      else return;
      event.preventDefault();
      show(rank, true);
    });
  });
  document.querySelector('.chain-info-close').addEventListener('click', () => {
    const previous = selected;
    selected = 0;
    layout(false);
    panel.hidden = true;
    nodes.forEach(node => { node.setAttribute('aria-pressed', 'false'); node.setAttribute('aria-expanded', 'false'); });
    if (previous) nodes[previous - 1].focus();
  });
  window.akoChainUI = {
    select(active) {
      visible = active;
      orbit.hidden = !active;
      if(!active)selected=0;
      layout(Boolean(active&&selected));
      panel.hidden = !active || !selected;
      if(!selected)nodes.forEach(node=>{node.setAttribute('aria-pressed','false');node.setAttribute('aria-expanded','false');});
      if (active && selected) show(selected);
    }
  };
})();
