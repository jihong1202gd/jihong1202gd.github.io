(() => {
  'use strict';
  const panel=document.querySelector('.echo-info');
  const loadout=document.querySelector('.echo-loadout');
  const detail=document.querySelector('.echo-equipped-detail');
  const buttons=[...loadout.querySelectorAll('.echo-equipped-slot')];
  const stats=['크리티컬 피해 +44%','응결 피해 보너스 +30%','공격력 +30%','공격력 +18%','공격력 +18%'];
  let activeButton=null;

  function close(){
    detail.hidden=true;
    activeButton=null;
    buttons.forEach(button=>button.setAttribute('aria-pressed','false'));
  }
  function position(){
    if(detail.hidden||!activeButton)return;
    const host=detail.offsetParent;
    const hostBounds=host.getBoundingClientRect();
    const slotBounds=activeButton.getBoundingClientRect();
    const scaleX=hostBounds.width/host.clientWidth;
    const scaleY=hostBounds.height/host.clientHeight;
    const gap=16,margin=12;
    let left=(slotBounds.left-hostBounds.left)/scaleX-detail.offsetWidth-gap;
    let top=(slotBounds.top-hostBounds.top+slotBounds.height/2)/scaleY-detail.offsetHeight/2;
    left=Math.max(margin,Math.min(left,host.clientWidth-detail.offsetWidth-margin));
    top=Math.max(margin,Math.min(top,host.clientHeight-detail.offsetHeight-margin));
    detail.style.setProperty('--echo-detail-left',left+'px');
    detail.style.setProperty('--echo-detail-top',top+'px');
  }
  buttons.forEach((button,i)=>button.addEventListener('click',()=>{
    const selected=button.getAttribute('aria-pressed')==='true';
    close();
    if(selected)return;
    activeButton=button;
    button.setAttribute('aria-pressed','true');
    detail.querySelector('h3').textContent=i===0?'메인 에코 · COST 4':'장착 에코 · COST '+button.dataset.cost;
    detail.querySelector('.echo-slot-primary').textContent='주옵션 · '+stats[i];
    detail.querySelector('.echo-slot-passive').textContent=i===0?'메인 장착: 아코의 일반공격 피해 보너스 +25%':'아코 전용 신규 세트 · 5세트 장착';
    detail.dataset.slot=String(i+1);
    detail.hidden=false;
    position();
  }));
  document.addEventListener('click',event=>{
    if(detail.hidden||detail.contains(event.target)||buttons.some(button=>button.contains(event.target)))return;
    close();
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
  window.addEventListener('resize',position);
  window.akoEchoUI={select(visible){panel.hidden=!visible;loadout.hidden=!visible;close();if(visible)panel.scrollTop=0;}};
})();
