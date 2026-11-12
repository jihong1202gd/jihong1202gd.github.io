(() => {
 'use strict';
 const data = {"basic": {
    "title": "두 얼굴의 서비스",
    "category": "기본 공격",
    "icon": "i-weapon",
    "copy": [
      {
        "heading": "일반 공격",
        "lines": [
          "최대 5단 연속 공격을 가하여 응결 피해를 입힌다. 근거리 상태의 일반 공격은 원거리 상태보다 더 높은 피해 배율로 적용된다."
        ]
      },
      {
        "heading": "회피 반격",
        "lines": [
          "회피 성공 후 일반 공격을 입력하면 현재 모드의 회피 반격을 발동한다. 각 모드의 일반 공격 3단과 같은 동작을 사용한다."
        ]
      },
      {
        "heading": "강공격 · 경멸의 손하트",
        "lines": [
          "일반 공격을 길게 누르면 스태미나를 소모하여 근거리 또는 원거리 상태로 전환한다."
        ]
      }
    ],
    "rows": [],
    "detail": "강공격 「경멸의 손하트」는 스태미나를 20pt 소모하여 근거리와 원거리 상태를 전환한다. 강공격의 피해 배율은 별도 설정 전이다. 일반 공격은 각 단에서 근거리 상태의 피해 배율이 원거리 상태보다 약 10.53% 높게 적용된다. 다단 공격의 각 타격은 개별 피해 배율로 적용된다. 5단 종료 시 획득하는 「핏방울」은 타격 수만큼 추가 획득하지 않는다.",
    "frames": {
      "근거리": [
        [
          "1~5단 연계",
          "30 / 30 / 36 / 30 / 60f"
        ],
        [
          "5단 연속 사용",
          "186f · 3.10초"
        ],
        [
          "일반 1단 타격",
          "20f"
        ],
        [
          "일반 2단 타격",
          "21f"
        ],
        [
          "일반 3단 타격",
          "27f"
        ],
        [
          "일반 4단 타격",
          "21 / 26f"
        ],
        [
          "일반 5단 타격",
          "27 / 33 / 51f"
        ],
        [
          "회피 반격 적중",
          "27f"
        ],
        [
          "회피 반격 후속 연계",
          "36f"
        ]
      ],
      "원거리": [
        [
          "1~5단 연계",
          "30 / 30 / 48 / 48 / 72f"
        ],
        [
          "5단 연속 사용",
          "228f · 3.80초"
        ],
        [
          "일반 1단 타격",
          "20f"
        ],
        [
          "일반 2단 타격",
          "20f"
        ],
        [
          "일반 3단 타격",
          "39 / 43f"
        ],
        [
          "일반 4단 타격",
          "39 / 43f"
        ],
        [
          "일반 5단 타격",
          "66 / 70f"
        ],
        [
          "회피 반격 투사체 발사",
          "39f"
        ],
        [
          "회피 반격 후속 연계",
          "48f"
        ]
      ]
    },
    "rowsByMode": {
      "근거리": [
        [
          "일반 1단",
          "188.42%"
        ],
        [
          "일반 2단",
          "209.58%"
        ],
        [
          "일반 3단",
          "255.78%"
        ],
        [
          "일반 4단 · 채찍1",
          "146.88%"
        ],
        [
          "일반 4단 · 채찍2",
          "179.52%"
        ],
        [
          "일반 5단 피해",
          "111.61% × 2"
        ],
        [
          "일반 5단 · 마무리",
          "334.85%"
        ],
        [
          "일반 공격 총 배율",
          "1,538.25%"
        ],
        [
          "회피 반격 피해",
          "753.28%"
        ]
      ],
      "원거리": [
        [
          "일반 1단",
          "170.48%"
        ],
        [
          "일반 2단",
          "189.62%"
        ],
        [
          "일반 3단 · 직격",
          "69.43%"
        ],
        [
          "일반 3단 · 파열",
          "161.99%"
        ],
        [
          "일반 4단 · 직격",
          "88.60%"
        ],
        [
          "일반 4단 · 파열",
          "206.72%"
        ],
        [
          "일반 5단 · 직격",
          "126.23%"
        ],
        [
          "일반 5단 · 폭발",
          "378.68%"
        ],
        [
          "일반 공격 총 배율",
          "1,391.75%"
        ],
        [
          "회피 반격 · 직격",
          "170.94%"
        ],
        [
          "회피 반격 · 파열",
          "398.83%"
        ],
        [
          "회피 반격 합계",
          "569.77%"
        ]
      ]
    },
    "heavyRows": [
      [
        "강공격 피해 배율",
        "미정"
      ],
      [
        "소모 스태미나",
        "20"
      ],
      [
        "타격 시작",
        "30f"
      ],
      [
        "후속 공격 연계",
        "34f"
      ],
      [
        "액션 / 전체 연출",
        "38f / 48f"
      ]
    ]
  }, "skill": {"title": "사랑의 오므라이스 ♡", "category": "공명 스킬", "icon": "chain-icon-5", "copy": ["혈액을 응축하여 전방으로 관통하는 빔을 분사하고, 4회에 걸쳐 응결 피해를 입힌다.", "첫 타격 명중 시, 피해를 입히기 전에 「핏방울」 1개를 획득한다."], "rows": [["빔 1~3회 피해", "158.89% × 3"], ["빔 4회 피해", "158.90%"], ["스킬 총 배율", "635.57%"], ["재사용 대기시간", "8초"], ["「핏방울」 획득", "명중 시 1개"], ["판정 폭 / 길이", "1.5m / 14m"]], "detail": "첫 명중 시 획득한 「핏방울」의 크리티컬 피해 증가 효과는 첫 타격부터 적용된다. 한 번의 스킬로 「핏방울」을 여러 번 획득하지 않는다. 공명 스킬 피해로 적용되며, 33프레임부터 후속 공격으로 연계할 수 있다.", "frames": {"공통": [["개별 타격", "26 / 28 / 30 / 32f"], ["후속 공격 연계", "33f · 0.55초"], ["액션 / 전체 연출", "41f / 48f"]]}}, "circuit": {
    "title": "피의 안개",
    "category": "공명 회로",
    "icon": "chain-icon-2",
    "copy": [
      {
        "heading": "「핏방울」",
        "lines": [
          "최대 4개 보유할 수 있다. 「핏방울」 1개당 아코의 크리티컬 피해가 17.5% 증가된다."
        ]
      },
      {
        "heading": "「핏방울」 획득 규칙",
        "lines": [
          "변주 스킬 또는 공명 스킬의 첫 타격 명중 시, 피해를 입히기 전에 「핏방울」 1개를 획득한다.",
          "일반 공격 5단 종료 시, 「핏방울」 1개를 획득한다.",
          "강화 일반 공격 5단의 후속 연계가 가능해지는 시점에 「핏방울」 1개를 획득한다."
        ]
      },
      {
        "heading": "피의 안개",
        "lines": [
          "공명 해방 발동 시, 모든 「핏방울」을 소모하고 「피의 안개」 상태에 진입한다.",
          "소모한 「핏방울」 1개당 크리티컬 피해가 35% 증가되며, 6초간 지속된다. 해당 효과와 「핏방울」 보유 시의 크리티컬 피해 증가 효과는 동시에 적용되지 않는다."
        ]
      },
      {
        "heading": "강화 일반 공격",
        "lines": [
          "「피의 안개」 상태에서 일반 공격은 강화 일반 공격으로 대체된다. 최대 5단 연속 공격을 가하여 응결 피해를 입히며, 해당 피해는 일반 공격 피해로 적용된다.",
          "근거리와 원거리 상태에서 동일한 강화 일반 공격을 발동한다."
        ]
      },
      {
        "heading": "특수 회피 · 블러드 블링크",
        "lines": [
          "지상에서 방향 입력 없이 회피를 발동하면 「블러드 블링크」 상태에 진입한다. 해당 상태에서 공격을 받을 시, 피해를 무효화하고 공격자를 추적한 뒤 고유 타격을 1회 발동한다.",
          "블링크 성공 후 18프레임에 혈액구가 파열되어 적중한다. 24프레임부터 일반 공격을 입력하면 현재 모드의 회피 반격으로 이어진다.",
          "「블러드 블링크」 상태에서 방향을 입력하면 해당 상태가 종료된다.",
          "「블러드 블링크」는 고유 스킬 활성화 여부와 관계없이 사용할 수 있다."
        ]
      }
    ],
    "rows": [
      [
        "강화 1단 · 왼쪽 발톱",
        "239.64%"
      ],
      [
        "강화 1단 · 오른쪽 발톱",
        "239.63%"
      ],
      [
        "강화 2단 · 바위 직격",
        "222.29%"
      ],
      [
        "강화 2단 · 폭발",
        "333.44%"
      ],
      [
        "강화 3단 피해",
        "157.91% × 3"
      ],
      [
        "강화 3단 · 관통4",
        "157.89%"
      ],
      [
        "강화 4단 피해",
        "404.19% × 2"
      ],
      [
        "강화 5단",
        "1,530.00%"
      ],
      [
        "강화 일반 공격 총 배율",
        "4,005.00%"
      ],
      [
        "「핏방울」 최대 보유량",
        "4개"
      ],
      [
        "보유 1개당 크리티컬 피해 증가",
        "17.5%"
      ],
      [
        "소모 1개당 크리티컬 피해 증가",
        "35%"
      ],
      [
        "4개 소모 시 크리티컬 피해 증가",
        "140%"
      ],
      [
        "소모 효과 지속시간",
        "6초"
      ],
      [
        "블러드 블링크 고유 타격 피해",
        "151.62%"
      ],
      [
        "블러드 블링크 대기 지속시간",
        "72f · 1.20초"
      ],
      [
        "블러드 블링크 회피 스택 소모",
        "1회"
      ]
    ],
    "detail": "크리티컬 피해 증가량은 기존 크리티컬 피해에 합산된다. 소모 효과는 6초 동안 피해 종류에 관계없이 적용되며, 교대 후 남은 반주·분신 타격에도 잔여시간 동안 적용된다. 보유 효과와 중첩하지 않는다. 「핏방울」 4개 보유 시 증가량은 70%, 4개 소모 시 증가량은 140%다. 강화 일반 공격 5단은 33f 적중 뒤 후속 연계가 가능해지는 56f에 「핏방울」 1개를 획득한다. 같은 시점의 교대 전에 획득하며, 기본 재생·대기 복귀 66f와 구별한다. 「블러드 블링크」는 지상에서만 발동하며, 방향을 입력한 회피와 공중 회피는 기존 회피를 발동한다. 대기 중 일반 공격은 발동할 수 없다. 실제 공격자를 기준으로 안전한 반격 위치를 찾으며, 이동할 위치가 유효하지 않으면 제자리에서 반격한다. 고유 타격의 피해 배율은 두 모드에서 동일하다. 후속 회피 반격에는 기본 공격 항목의 모드별 회피 반격 배율을 적용한다. 후속 공격으로 연결하지 않으면 블링크 성공 후 39프레임에 고유 타격의 연출이 종료된다. 변주·공명 스킬로 획득한 「핏방울」의 효과는 해당 첫 타격부터 적용되며, 추가 타격마다 중복 획득하지 않는다.",
    "frames": {
      "공통": [
        [
          "1~4단 연계",
          "36 / 42 / 40 / 54f"
        ],
        [
          "5단 후속 연계 · 핏방울 획득",
          "56f"
        ],
        [
          "5단 기본 재생·대기 복귀",
          "66f"
        ],
        [
          "전체 강화 체인",
          "238f · 3.97초"
        ],
        [
          "계산용 강화 연계 합계",
          "228f · 3.80초"
        ],
        [
          "각 단 타격 시작",
          "28 / 32 / 30 / 33 / 33f"
        ],
        [
          "강화 1단 타격",
          "28 / 28f"
        ],
        [
          "강화 2단 타격",
          "32 / 38f"
        ],
        [
          "강화 3단 타격",
          "30 / 33 / 36 / 39f"
        ],
        [
          "강화 4단 타격",
          "33 / 43f"
        ],
        [
          "강화 5단 타격",
          "33f"
        ],
        [
          "블러드 블링크 고유 타격 적중",
          "성공 후 18f"
        ],
        [
          "블러드 블링크 후속 반격 연계",
          "성공 후 24f"
        ],
        [
          "블러드 블링크 고유 연출 종료",
          "성공 후 39f"
        ]
      ]
    }
  }, "liberation": {"title": "스페셜 하트 브레이크", "category": "공명 해방", "icon": "chain-icon-4", "copy": ["모든 「핏방울」을 소모하고 「피의 안개」 상태에 진입한다.", "「피의 안개」 상태에서 일반 공격은 강화 일반 공격으로 대체된다. 「핏방울」이 최대치가 아니어도 발동할 수 있다."], "rows": [["재사용 대기시간", "15초"], ["공명 에너지 소모", "100"], ["「핏방울」 소모", "현재 보유량 전부"], ["별도 직접 피해", "없음"]], "detail": "발동 시 별도의 직접 피해를 입히지 않는다. 연출 중에는 무적 상태가 적용되며 전투 시간이 정지된다.", "frames": {"공통": [["전용 컷씬", "150f · 2.50초"], ["컷씬 상태", "시간 정지 · 무적"]]}}, "intro": {"title": "어서오세요 ~ 주인님 ♡", "category": "변주 스킬", "icon": "chain-icon-1", "copy": ["목표의 위쪽에 나타나 내려찍는 공격을 가하고, 응결 피해를 입힌다.", "목표 명중 시, 피해를 입히기 전에 「핏방울」 1개를 획득한다."], "rows": [["변주 피해", "434.43%"], ["「핏방울」 획득", "명중 시 1개"], ["진입 대상 범위", "최대 12m"]], "detail": "명중 시 「핏방울」을 먼저 획득하고, 증가한 크리티컬 피해를 적용하여 변주 피해를 입힌다. 발동 후 31프레임부터 후속 공격으로 연계할 수 있다.", "frames": {"공통": [["타격 시작", "25f"], ["후속 공격 연계", "31f · 0.52초"], ["액션 / 전체 연출", "54f / 84f"]]}}, "outro": {"title": "다녀오세요 주인님 ~ ♡", "category": "반주 스킬", "icon": "chain-icon-3", "copy": ["가시 덩굴을 펼쳐 주변의 목표에게 3회에 걸쳐 응결 피해를 입힌다."], "rows": [["덩굴 1~2회 피해", "163.50% × 2"], ["덩굴 · 회전 마무리", "218.00%"], ["반주 총 배율", "545.00%"], ["타격 범위", "반경 2m · 높이 2m"]], "detail": "다른 캐릭터로 전환한 후에도 공격이 유지된다. 회전 덩굴의 세 타격은 각각 해당 시점에 적용되는 버프로 피해를 계산한다.", "frames": {"공통": [["교대 후 개별 타격", "45 / 51 / 57f"], ["퇴장 연출 종료", "100f · 1.67초"]]}}, "basic-stat-1": {"title": "크리티컬 확률 증가", "category": "능력치 보너스 · 1단계", "icon": "i-crit", "copy": ["크리티컬 확률이 1.2% 증가된다."], "rows": [["크리티컬 확률 증가", "+1.2%"], ["전체 크리티컬 확률 노드", "+8%"], ["전체 공격력 노드", "+12%"]], "detail": "능력치 보너스는 각각 합산된다. 모든 능력치 보너스를 활성화하면 크리티컬 확률이 총 8%, 공격력이 총 12% 증가된다.", "frames": null}, "basic-stat-2": {"title": "크리티컬 확률 증가", "category": "능력치 보너스 · 2단계", "icon": "i-crit", "copy": ["크리티컬 확률이 2.8% 증가된다."], "rows": [["크리티컬 확률 증가", "+2.8%"], ["전체 크리티컬 확률 노드", "+8%"], ["전체 공격력 노드", "+12%"]], "detail": "능력치 보너스는 각각 합산된다. 모든 능력치 보너스를 활성화하면 크리티컬 확률이 총 8%, 공격력이 총 12% 증가된다.", "frames": null}, "skill-stat-1": {"title": "공격력 증가", "category": "능력치 보너스 · 1단계", "icon": "i-weapon", "copy": ["공격력이 1.8% 증가된다."], "rows": [["공격력 증가", "+1.8%"], ["전체 크리티컬 확률 노드", "+8%"], ["전체 공격력 노드", "+12%"]], "detail": "능력치 보너스는 각각 합산된다. 모든 능력치 보너스를 활성화하면 크리티컬 확률이 총 8%, 공격력이 총 12% 증가된다.", "frames": null}, "skill-stat-2": {"title": "공격력 증가", "category": "능력치 보너스 · 2단계", "icon": "i-weapon", "copy": ["공격력이 4.2% 증가된다."], "rows": [["공격력 증가", "+4.2%"], ["전체 크리티컬 확률 노드", "+8%"], ["전체 공격력 노드", "+12%"]], "detail": "능력치 보너스는 각각 합산된다. 모든 능력치 보너스를 활성화하면 크리티컬 확률이 총 8%, 공격력이 총 12% 증가된다.", "frames": null}, "liberation-stat-1": {"title": "공격력 증가", "category": "능력치 보너스 · 1단계", "icon": "i-weapon", "copy": ["공격력이 1.8% 증가된다."], "rows": [["공격력 증가", "+1.8%"], ["전체 크리티컬 확률 노드", "+8%"], ["전체 공격력 노드", "+12%"]], "detail": "능력치 보너스는 각각 합산된다. 모든 능력치 보너스를 활성화하면 크리티컬 확률이 총 8%, 공격력이 총 12% 증가된다.", "frames": null}, "liberation-stat-2": {"title": "공격력 증가", "category": "능력치 보너스 · 2단계", "icon": "i-weapon", "copy": ["공격력이 4.2% 증가된다."], "rows": [["공격력 증가", "+4.2%"], ["전체 크리티컬 확률 노드", "+8%"], ["전체 공격력 노드", "+12%"]], "detail": "능력치 보너스는 각각 합산된다. 모든 능력치 보너스를 활성화하면 크리티컬 확률이 총 8%, 공격력이 총 12% 증가된다.", "frames": null}, "intro-stat-1": {"title": "크리티컬 확률 증가", "category": "능력치 보너스 · 1단계", "icon": "i-crit", "copy": ["크리티컬 확률이 1.2% 증가된다."], "rows": [["크리티컬 확률 증가", "+1.2%"], ["전체 크리티컬 확률 노드", "+8%"], ["전체 공격력 노드", "+12%"]], "detail": "능력치 보너스는 각각 합산된다. 모든 능력치 보너스를 활성화하면 크리티컬 확률이 총 8%, 공격력이 총 12% 증가된다.", "frames": null}, "intro-stat-2": {"title": "크리티컬 확률 증가", "category": "능력치 보너스 · 2단계", "icon": "i-crit", "copy": ["크리티컬 확률이 2.8% 증가된다."], "rows": [["크리티컬 확률 증가", "+2.8%"], ["전체 크리티컬 확률 노드", "+8%"], ["전체 공격력 노드", "+12%"]], "detail": "능력치 보너스는 각각 합산된다. 모든 능력치 보너스를 활성화하면 크리티컬 확률이 총 8%, 공격력이 총 12% 증가된다.", "frames": null}, "inherent-crimson": {"title": "붉은 위로", "category": "고유 스킬", "icon": "chain-icon-5", "copy": ["전투 상태에서 「핏방울」 획득 시, 자신의 HP 최대치의 2%에 해당하는 HP를 회복한다. 해당 효과는 1초마다 1회 발생할 수 있다."], "rows": [["회복량", "자신의 HP 최대치의 2%"], ["발동 간격", "1초"], ["발동 조건", "전투 중 「핏방울」 획득"], ["적용 대상", "아코 자신"]], "detail": "「핏방울」의 실제 보유량이 증가할 때 발동한다. 최대 보유량에 도달한 상태에서 추가 획득을 시도하거나 비전투 상태에서 초기 자원이 보충되는 경우에는 발동하지 않는다. 파티원의 HP와 협주·공명 에너지를 회복하지 않는다. 공명 체인 5단계의 공명 해방 회복 효과는 별도로 적용된다.", "frames": null}, "inherent-preparation": {"title": "다음 손님을 위해", "category": "고유 스킬", "icon": "chain-icon-2", "copy": ["비전투 상태에서 「핏방울」을 보유하지 않을 경우, 「핏방울」 1개를 획득한다."], "rows": [["발동 조건", "비전투 · 「핏방울」 0개"], ["「핏방울」 획득량", "1개"], ["「핏방울」 1개 이상 보유 시", "추가 획득 없음"]], "detail": "전투에 진입하기 전 최소 1개의 「핏방울」을 준비하는 효과다. 이미 보유한 「핏방울」을 제거하거나 4개까지 계속 채우지 않는다. 비전투 상태의 획득이므로 「붉은 위로」의 회복 효과는 발동하지 않는다.", "frames": null}};
 const tree=document.querySelector('.skill-tree'), panel=document.querySelector('.skill-info');
 const nodes=[...tree.querySelectorAll('.skill-node')],views=[...panel.querySelectorAll('.skill-view-choice')],modes=[...panel.querySelectorAll('.skill-mode-choice')];
 let active=false,selected=null,mode='근거리',view='effect';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let entranceMotions=[];
 function stopEntrance(){entranceMotions.forEach(m=>m.cancel());entranceMotions=[];tree.dataset.entranceState='ready';}
 function enter(){
  stopEntrance();if(reduced.matches)return;
  tree.dataset.entranceState='appearing';
  const ordered=[...nodes].sort((a,b)=>parseFloat(getComputedStyle(b).top)-parseFloat(getComputedStyle(a).top));
  ordered.forEach((node,i)=>entranceMotions.push(node.animate([{opacity:0,transform:'translate(-50%,calc(-50% + 9px)) scale(.9)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{duration:280,delay:i*22,easing:'cubic-bezier(.2,.65,.3,1)',fill:'both'})));
  entranceMotions.push(tree.querySelector('.skill-lines').animate([{opacity:0},{opacity:.55}],{duration:520,fill:'both'}));
  const current=entranceMotions[entranceMotions.length-2];
  current.finished.then(()=>{if(entranceMotions.includes(current))stopEntrance();}).catch(()=>{});
 }

 function rows(target,values){target.replaceChildren(...values.map(([label,value])=>{const row=document.createElement('div');row.className='skill-number-row';const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);return row;}));}
 function switchView(next){view=next;views.forEach(b=>{const current=b.dataset.view===view;b.setAttribute('aria-selected',String(current));b.tabIndex=current?0:-1;});document.querySelector('#skill-effect').hidden=view!=='effect';document.querySelector('#skill-values').hidden=view!=='values';panel.scrollTop=0;}
 function render(){tree.dataset.detailOpen=String(Boolean(active&&selected));const d=data[selected];if(!d){panel.hidden=true;nodes.forEach(b=>{b.setAttribute('aria-pressed','false');b.setAttribute('aria-expanded','false');});return;}document.querySelector('#skill-category').textContent=d.category;panel.querySelector('.skill-design-label').hidden=d.category.startsWith('고유')||d.category.startsWith('능력치');document.querySelector('#skill-title').textContent=d.title;document.querySelector('#skill-effect').replaceChildren(...d.copy.flatMap(part=>{if(typeof part==='string'){const p=document.createElement('p');p.textContent=part;return [p];}const heading=document.createElement('h3');heading.className='skill-effect-heading';heading.textContent=part.heading;return [heading,...part.lines.map(text=>{const p=document.createElement('p');p.textContent=text;return p;})];}));rows(document.querySelector('#skill-number-list'),(d.rowsByMode&&d.rowsByMode[mode])||d.rows);const f=d.frames&&(d.frames[mode]||d.frames['공통']);document.querySelector('#skill-heavy-block').hidden=!d.heavyRows;rows(document.querySelector('#skill-heavy-list'),d.heavyRows||[]);document.querySelector('#skill-frame-block').hidden=!f;rows(document.querySelector('#skill-frame-list'),f||[]);document.querySelector('#skill-detail-copy').textContent=d.detail;panel.querySelector('.skill-mode-selector').hidden=selected!=='basic';modes.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));nodes.forEach(b=>{const current=b.dataset.skill===selected;b.setAttribute('aria-pressed',String(current));b.setAttribute('aria-expanded',String(current&&active));});panel.querySelector('.skill-detail').open=false;panel.hidden=!active;panel.scrollTop=0;}
 function choose(key){stopEntrance();selected=key;switchView('effect');render();}
 nodes.forEach((b,i)=>{b.addEventListener('click',()=>choose(b.dataset.skill));b.addEventListener('keydown',e=>{let n=i;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%nodes.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i+nodes.length-1)%nodes.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=nodes.length-1;else return;e.preventDefault();nodes[n].focus();choose(nodes[n].dataset.skill);});});
 views.forEach((b,i)=>{b.addEventListener('click',()=>switchView(b.dataset.view));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=views[e.key==='Home'?0:e.key==='End'?1:1-i];switchView(next.dataset.view);next.focus();});});
 modes.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;render();}));
 panel.querySelector('.skill-info-close').addEventListener('click',()=>{const previous=selected;selected=null;render();nodes.find(b=>b.dataset.skill===previous)?.focus();});
 window.akoSkillsUI={select(value){active=Boolean(value);stopEntrance();tree.hidden=!active;if(!active)selected=null;render();if(active&&!selected)enter();}};
 reduced.addEventListener('change',()=>{if(reduced.matches)stopEntrance();});
})();
