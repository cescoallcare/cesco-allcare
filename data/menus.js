/* menus.js — 상단 메뉴 6개(퓨어에어·퓨어워터·퓨어퍼퓸·홈케어·사업장·소모품) 구성. 화면은 js/menus.js 가 그립니다.
   ▸ 각 소분류(groups)는 상품 데이터(이름·keywords·sections·category·concerns·places·audience)를 보고 자동으로 채웁니다.
     규칙: { grp:[GROUPING id], names:[이름 포함], keywords:[], ids:[], cat:[], section0:[], concerns:[], places:[] }  → 하나라도 맞으면 포함(OR)
           and: { audienceNot:['biz'], places:[...], cat:[...] } → 반드시 만족(AND),  not: {...} → 제외
     한 메뉴 안에서는 위에서부터 처음 맞는 소분류 하나에만 들어갑니다.
   ▸ 제품이 없는 소분류: empty:'consult' 면 '상담 시 안내' 카드, 아니면 자동으로 숨김.
   ▸ PICK(스페셜 추천): ids 순서대로 사이트에 있는(숨김·품절 아님) 제품만 최대 4개 노출. 실제 데이터에 있는 제품 id 만 사용합니다. */
(function(){
const PID = n => 'G' + (2000000000 + n);
window.MENUS = [
  { key: 'air', label: '퓨어에어', en: 'PURE AIR', href: '#/air', topic: '공기 케어', landing: { href: 'air/', label: '에어케어 자세히 보기' },
    title: '매일 마시는 공기,<br>눈에 보이지 않아 더 세심하게.', lead: '공기청정기·공기살균기, 그리고 샤워 후·손 건조를 위한 드라이어까지. 공간 크기와 생활 패턴에 맞춰 골라 드립니다.',
    img: 'assets/img/living-soft.webp',
    groups: [
      { id: 'purifier', label: '공기청정기', desc: '공기 속 미세먼지와 냄새를 걸러내는 공기청정기', match: { grp: ['air-purifier'] } },
      { id: 'sterilizer', label: '공기살균기', desc: 'UV 등으로 공기 중 세균·바이러스를 케어하는 공기살균기', match: { grp: ['air-sterilizer'] } },
      { id: 'dryer', label: '바디·핸드드라이어', desc: '샤워 후 몸 전체를 말리는 바디 드라이어, 화장실 손 위생을 위한 핸드 드라이어', match: { grp: ['air-bodydryer', 'air-handdryer'] } }
    ] },
  { key: 'water', label: '퓨어워터', en: 'PURE WATER', href: '#/water', topic: '물 케어 (정수기·샤워·비데)', landing: { href: 'water/', label: '워터케어 자세히 보기' },
    title: '마시는 물부터<br>씻는 물까지, 매일 닿는 물.', lead: '주력 더슬림 정수기를 중심으로 비데, 아롬비 샤워기까지 물 관리 제품을 모았습니다.',
    img: 'assets/img/water-pour.webp',
    groups: [
      { id: 'purifier', label: '정수기', desc: '냉·온·정수 정수기 — 주력 더슬림(슬림) 계열이 먼저', match: { grp: ['water-purifier'] }, first: { names: ['슬림'] } },
      { id: 'bidet', label: '비데', desc: '살균·방수 비데', match: { grp: ['water-bidet'] } },
      { id: 'shower', label: '샤워부스', desc: '샤워 물 관리를 위한 아롬비 샤워기(제휴·판매 상품). 샤워부스 제품은 현재 사이트에 등록된 것이 없어 상담 시 안내해 드립니다.',
        match: { grp: ['water-shower'], names: ['부스'] }, partner: true, empty: 'consult', note: '샤워부스 제품은 상담 시 안내해 드립니다.' }
    ] },
  { key: 'perfume', label: '퓨어퍼퓸', en: 'PURE PERFUME', href: '#/perfume', topic: '공기 케어',
    title: '공간의 첫인상을<br>향기로 바꿉니다.', lead: '방향·탈취를 함께 해 주는 에어제닉, 공간에 어울리는 향을 연출하는 에어퍼퓸.',
    img: 'assets/img/living-plants.webp',
    groups: [
      { id: 'airgenic', label: '에어제닉', hint: '탈취', desc: '방향·탈취를 함께 해 주는 에어제닉', match: { names: ['에어제닉'] } },
      { id: 'airperfume', label: '에어퍼퓸', hint: '고급향', desc: '디퓨저·퍼퓸 등 공간 향기 연출', match: { names: ['에어퍼퓸', '퍼퓸'] } }
    ] },
  { key: 'homecare', label: '홈케어', en: 'HOME CARE', href: '#/home-care', topic: '잘 모르겠어요 (먼저 진단받고 싶어요)',
    title: '함께 사는 사람에 따라<br>필요한 케어가 달라집니다', lead: '우리 집 상황과 가까운 PICK을 고르거나, 공기·물·위생·편의 제품별로 살펴보세요.',
    img: 'assets/img/home-family.webp',
    picksTitle: '홈케어 스페셜 PICK',
    picks: [
      { id: 'baby', label: '아기가 있는 집', img: 'assets/img/home-baby.webp', worry: '아기 방 공기, 젖병·빨래 세제, 모기까지 하나하나 조심스러울 때',
        ids: [PID(530), PID(1211), PID(869), PID(849), PID(1070), PID(1477)], legacy: 'baby' },
      { id: 'pet', label: '반려동물과 함께하는 집', img: 'assets/img/home-pet.webp', worry: '털·냄새·공기, 그리고 반려동물에게도 순한 생활용품이 필요할 때',
        ids: [PID(1213), PID(1246), PID(837), PID(1130), PID(830)], legacy: 'pet' },
      { id: 'parents', label: '부모님을 위한 집', img: 'assets/img/home-senior.webp', worry: '필터 교체·점검이 부담스러운 부모님 댁, 방문 관리로 편하게',
        ids: [PID(1211), PID(1384), PID(1366), PID(521), PID(859)], legacy: 'senior' },
      { id: 'health', label: '가족 건강을 생각하는 집', img: 'assets/img/home-family.webp', worry: '온 가족이 마시는 물과 거실 공기, 욕실 위생까지 꼼꼼하게',
        ids: [PID(1210), PID(1053), PID(556), PID(974), PID(429), PID(1633)], legacy: 'family' },
      { id: 'easy', label: '편리한 생활을 위한 집', img: 'assets/img/home-single.webp', worry: '샤워 후 건조, 설거지·세탁조 관리처럼 손 가는 일을 줄이고 싶을 때',
        ids: ['allcare-solura-bodydryer', PID(1504), PID(1543), PID(866), 'allcare-aircon-cleaning'], legacy: 'single' }
    ],
    groupsTitle: '제품별 추천',
    groups: [
      { id: 'air', label: '공기 관리', desc: '공기청정기·공기살균기·바디 드라이어·에어컨 크리닝', match: { grp: ['air-purifier', 'air-sterilizer', 'air-bodydryer'], ids: ['allcare-aircon-cleaning'] }, and: { audienceNot: ['biz'] } },
      { id: 'water', label: '물 관리', desc: '가정용 정수기·비데·샤워기', match: { grp: ['water-purifier', 'water-bidet', 'water-shower'] }, not: { names: ['더맥스', '얼음'] }, partner: true },
      { id: 'hygiene', label: '생활 위생', desc: '살균·손 위생·탈취·해충 케어 제품과 서비스', match: { section0: ['healing.sterilize', 'healing.hygiene', 'healing.fresh', 'healing.bug'] },
        and: { audienceNot: ['biz'], places: ['living', 'bath', 'kitchen'] }, not: { names: ['핸드 드라이어', '블루제닉', '라벨', '에어커튼', '에어컨', '카케어'] } },
      { id: 'easy', label: '생활 편의', desc: '주방·욕실·세탁 세정과 생활용품', match: { section0: ['healing.clean', 'healing.everyday'] }, and: { audienceNot: ['biz'] } }
    ] },
  { key: 'business', label: '사업장', en: 'BUSINESS CARE', href: '#/business', topic: '사업장 맞춤 상담',
    title: '업종마다 챙겨야 할<br>위생 포인트가 다릅니다', lead: '업종별 스페셜 PICK으로 먼저 살펴보고, 공기·위생·향기·맞춤 제품별로 비교해 보세요.',
    img: 'assets/img/biz-restaurant.webp',
    picksTitle: '사업장 스페셜 PICK',
    picks: [
      { id: 'food', label: '식당·카페', img: 'assets/img/biz-cafe.webp', worry: '주방 기름때·배수구, 초파리, 음료용 물과 홀 냄새까지',
        ids: [PID(1050), PID(1049), PID(767), PID(292), PID(1098), PID(1033)], legacy: ['restaurant', 'cafe'] },
      { id: 'pcroom', label: 'PC방', img: 'assets/img/biz-pcroom.webp', worry: '장시간 머무는 밀폐 공간의 공기와 담배·음식 냄새',
        ids: [PID(1247), PID(424), PID(1033), PID(728), PID(560)], legacy: 'pcroom' },
      { id: 'callcenter', label: '고객센터·TM 사무실', img: 'assets/img/biz-office.webp', worry: '많은 인원이 오래 일하는 사무 공간의 공기·음용수·공용 위생',
        ids: [PID(1247), PID(1497), PID(859), PID(560), 'allcare-aircon-cleaning'], legacy: 'office' },
      { id: 'clinic', label: '병원·의원', img: 'assets/img/biz-clinic.webp', worry: '대기실 공기와 환자·직원 손 위생, 화장실 위생',
        ids: [PID(424), PID(521), PID(688), PID(728), PID(767)], legacy: 'clinic' },
      { id: 'edu', label: '어린이집·교육시설', img: 'assets/img/biz-academy.webp', worry: '환기가 어려운 교실 공기와 아이들이 함께 마시는 물',
        ids: [PID(1210), PID(1247), PID(1497), PID(859), PID(763)], legacy: 'academy' },
      { id: 'beauty', label: '미용실·숙박업', img: 'assets/img/biz-hotel.webp', worry: '손님이 먼저 느끼는 공간 향기·냄새, 침구·욕실 위생',
        ids: [PID(1719), PID(1033), PID(887), PID(981), PID(1366)], legacy: ['hotel', 'etc', 'store'] },
      { id: 'factory', label: '공장·산업시설', img: 'assets/img/biz-factory.webp', worry: '넓은 작업 공간 공기, 출입구 해충 유입, 다인원 음용수',
        ids: [PID(1247), PID(1498), PID(1694), PID(1511), PID(1047)], legacy: 'factory' }
    ],
    groupsTitle: '업종별 제품 및 솔루션',
    groups: [
      { id: 'air', label: '공기 관리', desc: '사업장 공간용 공기청정기·공기살균기, 에어컨 크리닝', match: { grp: ['air-purifier', 'air-sterilizer'], ids: ['allcare-aircon-cleaning'] }, and: { places: ['biz'] } },
      { id: 'scent', label: '탈취·향기 관리', desc: '에어제닉·에어퍼퓸 등 사업장 방향·탈취', match: { names: ['에어제닉', '에어퍼퓸', '퍼퓸'] } },
      { id: 'hygiene', label: '살균·위생 관리', desc: '손 위생·화장실 위생·살균 소독', match: { section0: ['healing.hygiene', 'healing.sterilize'] }, and: { places: ['biz'] },
        not: { names: ['라벨', '컨설팅', '매트리스', '에어컨'] } },
      { id: 'custom', label: '사업장 맞춤 제품', desc: '업소용 대용량 세정제, 정수기, 방충·해충 서비스, 식품안전 라벨·표시 컨설팅', match: { cat: ['biz', 'pest', 'service'], ids: [PID(767), PID(1497), PID(1498), PID(1098)] },
        and: { places: ['biz'] }, not: { names: ['매트리스 케어', '에어컨'] } }
    ] },
  { key: 'supplies', label: '소모품', en: 'SUPPLIES', href: '#/supplies', topic: '생활·위생용품',
    title: '자주 쓰는 소모품,<br>떨어지기 전에 챙기세요.', lead: '카케어·물티슈·세정제·살균제·기피제·세제까지, 세스코 마이랩 소모품을 모았습니다. 정기배송도 상담해 드립니다.',
    img: 'assets/img/kitchen.webp',
    groups: [
      { id: 'car', label: '카케어', desc: '차량 실내 살균·탈취 케어', match: { grp: ['life-car'] } },
      { id: 'wipes', label: '물티슈', desc: '위생 물티슈·살균 클리닝 티슈', match: { names: ['물티슈', '티슈'] } },
      { id: 'sterilizer', label: '살균제', desc: '살균소독제·락스', match: { names: ['살균소독제', '락스'] } },
      { id: 'repellent', label: '기피제·해충 소모품', desc: '모기·진드기 기피제, 끈끈이·트랩', match: { names: ['기피제', '끈끈이', '트랩'] }, not: { types: ['service'] } },
      { id: 'detergent', label: '세제', desc: '주방·세탁·식기세척기 세제와 섬유유연제, 세탁조 클리너', match: { names: ['세제', '섬유유연제', '세탁조클리너'] } },
      { id: 'cleaning', label: '세정 및 위생 소모품', desc: '주방·욕실·배수구 세정제, 핸드워시·손소독제·풋샴푸, 식품안전 라벨', match: { names: ['세정제', '클리너', '핸드워시', '손소독제', '풋샴푸', '라벨'] } },
      { id: 'deodorant', label: '탈취제', desc: '섬유·반려동물 탈취제, 탈취제습제', match: { names: ['탈취제'] } },
      { id: 'gift', label: '선물 세트', desc: '세스코 마이랩 선물 세트', match: { names: ['선물세트'] } }
    ] }
];
/* 옛 주소 → 새 메뉴 (깨지는 해시만) */
window.MENU_REDIRECTS = { life: '#/supplies' };
})();
