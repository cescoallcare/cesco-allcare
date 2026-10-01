/* ==========================================================================
   data/curation.js — 플로팅 칩(베스트 인기 / 베스트 핫딜 / 이맘때 추천) 설정
   ▸ 상품 목록은 data/products.js(+관리자 오버라이드) 에서 자동 계산됩니다. 숨김·삭제된 상품은 자동 제외.
   ▸ 여기서는 "몇 개 보여줄지 / 문구 / 월별 규칙" 만 관리합니다. (계산 로직: js/floating.js)
   ========================================================================== */
window.CURATION = {
  /* 베스트 인기 — 기존 BEST 페이지와 같은 기준(세스코몰 리뷰 수 순위, 제휴(PARTNER) 상품 제외) */
  best: {
    limit: 4,
    note: '순위는 판매량이 아닌 리뷰 수 기준의 참고 자료입니다.'
  },

  /* 베스트 핫딜 — 렌탈 가격표(rentalOptions)의 값으로 계산
     정상가(listPrice) 대비, '이달의 판매가(monthPrice)'와 '현장 할인가(단품, onsiteSingle)' 중 낮은 값의 할인율.
     상품마다 할인율이 가장 큰 옵션(의무사용기간×방문주기) 1개를 보여 주고, 할인율 순으로 상위 limit 개. */
  hotdeal: {
    limit: 4,
    note: '정상가 대비 ‘이달의 판매가’와 ‘현장 할인가(단품)’ 중 낮은 값의 할인율 기준입니다. 상품별로 할인율이 가장 큰 옵션 1개만 표시하며, 현장 할인가는 방문 상담 시 적용되는 가격입니다. 의무사용기간·방문주기·옵션에 따라 달라질 수 있습니다.'
  },

  /* 이맘때 추천 — 현재 월(브라우저 날짜) → 규칙 기반 큐레이션 */
  seasonal: {
    limit: 4,
    note: '월별 규칙으로 고른 목록이며 판매 순위·효능을 뜻하지 않습니다.',

    /* 규칙 묶음(group): 상품 조건. 하나라도 맞으면 해당 묶음 상품.
         ids      : 상품 ID 직접 지정
         category : 상품 category (air / water / life / service / biz …)
         sections : 상품 sections 중 하나라도 포함
         keywords : 상품명·keywords 에 포함된 단어 (하나라도)
         exclude  : 이 ID 는 제외
       한 묶음 안에서는 세스코몰 리뷰 수가 많은 순 → 데이터 순서로 정렬합니다. */
    groups: {
      aircon:   { label: '에어컨 크리닝', ids: ['allcare-aircon-cleaning'] },
      air:      { label: '공기 케어',     category: 'air', sections: ['air.clean', 'air.sterilize'] },
      deodor:   { label: '탈취·냄새',     keywords: ['탈취', '섬유탈취제', '탈취제습제'] },
      bug:      { label: '해충·방충',     sections: ['healing.bug'], exclude: ['G2000001274', 'G2000000981'] },
      water:    { label: '정수기',        category: 'water', sections: ['water.drink'] },
      hygiene:  { label: '생활 위생',     sections: ['healing.sterilize', 'healing.hygiene'], category: 'life' },
      drain:    { label: '배수구·욕실',   keywords: ['배수구', '욕실세정'] }
    },

    /* 월별 규칙 테이블: picks 는 위 groups 의 키(앞에 있을수록 우선). 같은 묶음에서 1개씩 번갈아 채웁니다.
       reason 은 과장 없이 "이 시기에 많이 찾는 케어" 수준으로, groupNote 는 가격표/데이터에 실제 있는 사실만 적습니다. */
    months: {
      1:  { season: '겨울', picks: ['aircon', 'air', 'hygiene', 'water'] },
      2:  { season: '겨울', picks: ['aircon', 'air', 'hygiene', 'water'] },
      3:  { season: '봄',   picks: ['aircon', 'air', 'water', 'hygiene'] },
      4:  { season: '봄',   picks: ['air', 'water', 'hygiene', 'deodor'] },
      5:  { season: '봄',   picks: ['air', 'bug', 'water', 'deodor'] },
      6:  { season: '여름', picks: ['aircon', 'bug', 'deodor', 'drain'] },
      7:  { season: '여름', picks: ['aircon', 'bug', 'deodor', 'drain'] },
      8:  { season: '여름', picks: ['aircon', 'bug', 'deodor', 'drain'] },
      9:  { season: '가을', picks: ['aircon', 'water', 'air', 'hygiene'] },
      10: { season: '가을', picks: ['aircon', 'water', 'air', 'hygiene'] },
      11: { season: '가을', picks: ['aircon', 'air', 'hygiene', 'water'] },
      12: { season: '겨울', picks: ['aircon', 'air', 'hygiene', 'water'] }
    },

    /* 묶음별 사실 안내(가격표에 근거). 해당 묶음 상품 옆에 작게 표시됩니다. 월 제한(months)이 있으면 그 달에만. */
    groupNotes: {
      aircon: { text: '가격표상 9월~3월은 비수기 판매가 적용', months: [9, 10, 11, 12, 1, 2, 3] }
    }
  }
};
