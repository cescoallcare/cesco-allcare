/* ==========================================================================
   CESCO ALL CARE — 사이트 설정 & 콘텐츠 데이터
   ▸ 여기서 전화번호·카카오톡 링크·문구를 바꾸면 사이트 전체에 반영됩니다.
   ▸ 상품 데이터는 data/products.js (자동 생성: tools/build_data.py)
   ========================================================================== */
window.CONFIG = {
  planner: {
    title: '세스코 라이프케어 SOL 플래너',
    phone: '010 7434 0548',
    phoneTel: 'tel:01074340548',
    email: 'rrrr33@nate.com',
    slogan: '견적서보다 처방전을 먼저 씁니다.'
  },
  /* ▼▼ 카카오톡 상담 링크 (placeholder) — 오픈채팅/채널 URL 로 교체하세요. 예) https://open.kakao.com/o/xxxxxxx 또는 https://pf.kakao.com/_xxxxxx
     'REPLACE_ME' 가 포함돼 있으면 버튼 클릭 시 "준비 중" 안내가 나옵니다. */
  kakaoUrl: 'https://open.kakao.com/o/sUWS09Mi',
  /* ▼ 상담 신청 폼 전송 주소 = Google Apps Script 웹 앱 URL (https://script.google.com/macros/s/…/exec).
     채우면 메인·/water/·/air/ 의 모든 상담 폼이 구글 시트로 전송됩니다(js/core.js sendInquiry). 비워두면 이 브라우저 localStorage 에만 저장.
     설치: tools/apps-script/README.md */
  formEndpoint: '',
  siteName: 'CESCO ALL CARE',
  priceCheckedAt: '2026-09-30',
  priceTableAt: '2026-10-01', // 플래너 제공 가격표(렌탈 옵션·매트리스·에어컨 크리닝) 반영일
  mallUrl: 'https://www.cescomall.co.kr'
};

/* ▼ 신제품 출시 팝업 (메인·/water/·/air/ 공통, js/popup.js)
   - enabled: false 로 끄기 / id 를 바꾸면 '오늘 하루 보지 않기'를 누른 방문자에게도 다시 노출
   - start / end: 'YYYY-MM-DD'(한국 시간, 그날 포함). 비우면 제한 없음
   - productId: 상세 보기·상담 신청(관심 상품 자동 입력)·가격 표시에 사용. 관리자에서 그 상품을 숨기면 팝업도 나오지 않습니다(가격 수정도 자동 반영).
   - 첫 방문(브라우저 세션당 1회) 약 delayMs 뒤 노출 */
window.POPUP = {
  enabled: true,
  id: 'carcare-2026-10',
  badge: 'NEW',
  eyebrow: '신제품 출시',
  title: '세스코 마이랩 카케어 솔루션',
  text: '살균·탈취·안전성까지 생각한 차량 전용 케어. 카케어 솔루션 전용 제품 구성으로 차 안을 깔끔하게 관리해 보세요.',
  image: 'assets/img/carcare-products.webp',
  imageAlt: '세스코 마이랩 카케어 솔루션 전용 제품 구성',
  giftImage: 'assets/products/allcare-carcare-gift.webp',
  giftText: '선물용 차량 전용 패키지(4종·6종 세트) · 선물 세트 상담 시 안내',
  productId: 'allcare-carcare-solution',
  consultTopic: '생활·위생용품',
  start: '2026-10-07',
  end: '',
  delayMs: 1000,
  pages: ['main', 'water', 'air']
};

const PID = n => 'G' + (2000000000 + n);

/* 상단 메뉴 */
window.NAV = [
  { key: 'home', label: 'HOME', href: '#/' },
  { key: 'air', label: 'PURE AIR', href: '#/air' },
  { key: 'water', label: 'PURE WATER', href: '#/water' },
  { key: 'life', label: 'HEALING LIFE', href: '#/life' },
  { key: 'business', label: 'BUSINESS CARE', href: '#/business' },
  { key: 'homecare', label: 'HOME CARE', href: '#/home-care' },
  { key: 'rental', label: 'RENTAL', href: '#/rental' },
  { key: 'subscribe', label: '정기배송', href: '#/subscribe' },
  { key: 'best', label: 'BEST', href: '#/best' },
  { key: 'finder', label: 'CARE FINDER', href: '#/finder' },
  { key: 'guide', label: 'CARE GUIDE', href: '#/guide' }
];

/* 지금 가장 신경 쓰이는 것은? — 8개 */
window.CONCERNS = [
  { id: 'sterilize', name: '살균·위생', sub: '손, 주방, 욕실까지 매일 닿는 곳', icon: 'shield', img: 'assets/img/kitchen.webp',
    lead: '매일 손이 닿는 곳부터 정리하면 위생 관리가 훨씬 쉬워집니다.',
    checks: ['주방 도마·행주·수세미를 주기적으로 소독하고 싶다', '아이나 어르신이 있어 손 위생이 신경 쓰인다', '공용 화장실·출입구 위생을 관리하고 싶다'],
    approach: '살균·소독제와 손 위생용품을 “쓰는 장소”별로 나누고, 공기 중 위생이 걱정되면 공기살균 케어를 함께 살펴봅니다.',
    /* 목록 정렬: top 상품을 맨 위에 → 기기·서비스(기존 순서) → 이름에 bottomKeywords 가 있는 소모품은 맨 아래 */
    order: { top: ['G2000000429'], bottomKeywords: ['마이랩', '통합라벨'] } },
  { id: 'air', name: '공기', sub: '미세먼지·바이러스·환기 걱정', icon: 'wind', img: 'assets/img/hero-living.webp',
    lead: '공기는 눈에 보이지 않아 공간 크기와 생활 패턴에 맞게 고르는 것이 중요합니다.',
    checks: ['거실·방 크기(평수)에 맞는 제품을 찾고 있다', '공기청정과 살균을 함께 하고 싶다', '필터 교체·관리가 번거로워 방문 관리형이 궁금하다'],
    approach: '공간 크기 → 생활 환경(반려동물·아기·요리) → 관리 방식(렌탈/구매) 순서로 좁혀 드립니다.' },
  { id: 'water', name: '물', sub: '마시는 물부터 샤워·욕실 물까지', icon: 'droplet', img: 'assets/img/water-pour.webp',
    lead: '하루에도 여러 번 만나는 물입니다. 마시는 물과 씻는 물을 나누어 생각해 보세요.',
    checks: ['가족 수·사용량에 맞는 정수기를 찾고 있다', '샤워기 필터·비데 등 욕실 물 관리가 궁금하다', '필터 교체·위생 관리를 대신 받고 싶다'],
    approach: '마시는 물(정수기) · 샤워 물(샤워필터) · 욕실(비데)로 나누어 필요한 것만 골라 드립니다.',
    /* 고민 목록 추가 포함 규칙(상품의 concerns 값과 별개): 이름에 keywords 가 들어간 상품 전부 + ids 상품(품절 표시여도 노출). 숨김 상품은 제외 */
    include: { keywords: ['비데'], ids: ['aromvi-14', 'aromvi-17'] } },
  { id: 'pest', name: '해충', sub: '바퀴벌레·초파리·날벌레 초기 대응', icon: 'bug', img: 'assets/img/bedroom.webp',
    lead: '해충은 “보이기 시작했을 때” 원인을 확인하는 것이 가장 빠릅니다.',
    checks: ['바퀴벌레·개미 등이 자꾸 나온다', '주방 초파리·나방이 신경 쓰인다', '출입구·창문으로 벌레가 들어온다'],
    approach: '셀프 트랩과 생활용품부터, 원인 파악이 필요하면 진단 서비스와 시설 보완(방충망·배수구트랩)까지 단계별로 안내합니다.' },
  { id: 'odor', name: '냄새', sub: '음식·화장실·반려동물·옷 냄새', icon: 'flower', img: 'assets/img/living-warm.webp',
    lead: '냄새는 “덮는 것”보다 원인 공간을 찾아 줄이는 것이 먼저입니다.',
    checks: ['음식·조리 냄새가 집에 남는다', '배수구·화장실 냄새가 올라온다', '반려동물·옷·침구 냄새가 신경 쓰인다'],
    approach: '냄새가 생기는 장소(주방·배수구·화장실·섬유)별로 탈취·세정·환기 케어를 나눠 제안합니다.' },
  { id: 'clean', name: '청소·생활', sub: '기름때·배수구·세탁조 생활 청소', icon: 'sparkle', img: 'assets/img/couple-kitchen.webp',
    lead: '자주 쓰는 생활용품은 “정기배송”으로 떨어지지 않게 관리하는 분들이 많습니다.',
    checks: ['주방 기름때·배수구 청소 제품이 필요하다', '세탁세제·주방세제를 자주 다시 주문한다', '식기세척기·세탁조 관리가 궁금하다'],
    approach: '생활용품은 사용 주기에 맞춰 정기배송으로 묶고, 필요한 제품만 남겨 드립니다.' },
  { id: 'pet', name: '반려동물', sub: '털·냄새·공기까지 함께 사는 집', icon: 'paw', img: 'assets/img/home-pet.webp',
    lead: '반려동물과 함께 사는 집은 털·냄새·공기·해충을 함께 봐야 합니다.',
    checks: ['털과 미세한 먼지가 공기 중에 많다', '배변 패드·잠자리 주변 냄새가 신경 쓰인다', '산책 시 모기·진드기가 걱정된다'],
    approach: '공기청정(펫 필터 옵션 확인)과 무향 탈취·기피제를 함께 구성해 드립니다.' },
  { id: 'biz', name: '사업장 위생', sub: '매장·사무실·시설 위생 관리', icon: 'store', img: 'assets/img/biz-store.webp',
    lead: '사업장은 업종마다 위생 포인트가 달라 업종별 진단이 먼저입니다.',
    checks: ['업종에 맞는 위생용품·시설이 궁금하다', '방문 관리형(렌탈/서비스)을 알아보고 있다', '해충·냄새·공기를 한꺼번에 점검하고 싶다'],
    approach: '업종 → 공간 크기 → 이용객 수를 확인해 “필요한 것만” 처방합니다.' }
];

/* BUSINESS CARE — 업종 10개 */
window.INDUSTRIES = [
  { id: 'restaurant', name: '요식업', en: 'RESTAURANT', img: 'assets/img/biz-restaurant.webp', summary: '기름때·배수구·위생해충·조리 냄새',
    worries: ['주방 후드·바닥 기름때와 배수구 냄새', '파리·바퀴 등 위생해충 유입', '조리 냄새·연기로 인한 홀 공기질', '직원·손님 손 위생', '식기·도구 살균과 식수 관리'],
    care: ['주방 청소·세정', '위생해충 관리', '공기청정·탈취', '손 위생', '정수 케어'],
    picks: [PID(1050), PID(936), PID(1624), PID(1049), PID(853), PID(292), PID(767), PID(1033), PID(1274)],
    buy: '세정제·소독제 등 소모품은 정기배송으로 묶고, 정수기·공기청정기·방향탈취기는 방문 관리가 되는 렌탈이 편한지 함께 비교해 드립니다.',
    cta: '요식업 맞춤 상담하기' },
  { id: 'cafe', name: '카페', en: 'CAFE', img: 'assets/img/biz-cafe.webp', summary: '음료용 물·원두/음식 냄새·초파리',
    worries: ['음료·얼음에 쓰는 물 관리', '원두·디저트 냄새와 홀 공기', '초파리·날벌레', '화장실·손님 접촉면 위생', '피크 시간 다수 이용'],
    care: ['정수·얼음 케어', '공기청정', '해충 트랩', '위생용품', '화장실 관리'],
    picks: [PID(1098), PID(767), PID(1210), PID(292), PID(859), PID(763), PID(939), PID(1719), PID(1694)],
    buy: '카페는 정수기 사용량이 많아 렌탈(방문 관리)과 구매 후 셀프 관리를 비교해 보는 분이 많습니다. 사용량과 관리 여력을 기준으로 안내합니다.',
    cta: '카페 맞춤 상담하기' },
  { id: 'pcroom', name: 'PC방', en: 'PC ROOM', img: 'assets/img/biz-pcroom.webp', summary: '공기질·담배/음식 냄새·화장실 위생',
    worries: ['공기질 (밀폐된 실내, 장시간 체류)', '담배·음식 냄새', '해충 (음식 취식 공간)', '화장실 위생', '장시간 이용객이 만지는 좌석·기기 위생'],
    care: ['공기청정', '공기살균', '탈취·향기', '해충관리', '위생용품', '화장실 관리'],
    picks: [PID(1247), PID(1210), PID(424), PID(1033), PID(728), PID(685), PID(859), PID(560), PID(292), PID(1274)],
    buy: '넓은 홀은 대용량 공기청정기(30평형 이상)와 공기살균, 탈취·방향 케어를 조합하고, 화장실은 손세정기·변기세정기 등 월 서비스형을 함께 검토합니다.',
    cta: 'PC방 맞춤 상담하기' },
  { id: 'hotel', name: '숙박업', en: 'LODGING', img: 'assets/img/biz-hotel.webp', summary: '객실 냄새·침구 위생·빈대 걱정',
    worries: ['객실 냄새와 공기', '침구·매트리스 위생과 빈대 걱정', '욕실·화장실 위생', '로비·복도 향기와 탈취', '해충 유입 예방'],
    care: ['공기·탈취', '매트리스 케어', '빈대 진단', '향기 연출', '화장실 위생'],
    picks: [PID(981), PID(887), PID(1719), PID(1033), PID(424), PID(1366), PID(1274), PID(1511)],
    buy: '진단·매트리스 케어는 서비스 상품으로 신청하고, 공기/향기 케어는 월 서비스형과 구매형을 객실 수 기준으로 비교합니다.',
    cta: '숙박업 맞춤 상담하기' },
  { id: 'clinic', name: '병원·의료', en: 'CLINIC', img: 'assets/img/biz-clinic.webp', summary: '대기실 공기·손 위생·화장실',
    worries: ['대기실·진료실 공기', '손 위생 (환자·직원)', '화장실·세면대 위생', '음용수 관리', '냄새 관리'],
    care: ['공기청정·살균', '손 위생', '화장실 위생', '정수 케어'],
    picks: [PID(424), PID(521), PID(688), PID(859), PID(939), PID(728), PID(767), PID(1247)],
    buy: '의료기관은 기관 자체 감염관리 기준이 우선입니다. 생활 위생 보조 수단으로 어떤 제품이 맞는지 기준을 여쭤보고 안내합니다.',
    cta: '병원·의료 맞춤 상담하기' },
  { id: 'academy', name: '학원·교육', en: 'ACADEMY', img: 'assets/img/biz-academy.webp', summary: '밀폐 교실 공기·다인원 음용수',
    worries: ['환기가 어려운 교실 공기', '다수가 마시는 정수기 관리', '화장실·공용 공간 위생', '아이들 손 위생', '겨울철 밀폐 공간'],
    care: ['공기청정', '공기살균', '정수 케어', '손 위생'],
    picks: [PID(1247), PID(1210), PID(1497), PID(1498), PID(688), PID(859), PID(763), PID(939)],
    buy: '교실 수·인원에 따라 정수기와 공기청정기 대수가 달라집니다. 렌탈 시 방문 관리 주기까지 함께 설계해 드립니다.',
    cta: '학원·교육 맞춤 상담하기' },
  { id: 'office', name: '사무실', en: 'OFFICE', img: 'assets/img/biz-office.webp', summary: '공기·정수기·공용 주방/화장실',
    worries: ['장시간 근무 공간의 공기', '직원 수에 맞는 정수기', '공용 주방·화장실 냄새와 위생', '해충 (탕비실, 배수구)', '방문객 응대 공간'],
    care: ['공기청정', '정수 케어', '화장실 위생', '해충 관리'],
    picks: [PID(1247), PID(1212), PID(1497), PID(1498), PID(806), PID(559 + 1), PID(292), PID(1274)],
    buy: '직원 수·면적을 기준으로 렌탈(관리 대행)과 구매를 비교합니다. 사업자 조건이 필요한 서비스는 상담 시 확인해 드립니다.',
    cta: '사무실 맞춤 상담하기' },
  { id: 'factory', name: '공장', en: 'FACTORY', img: 'assets/img/biz-factory.webp', summary: '넓은 작업공간·구내 식당·다인원 음용수',
    worries: ['넓은 공간 공기 관리', '구내식당·휴게실 위생', '출입구·창문 해충 유입', '다인원 음용수', '화장실·탈의실 냄새'],
    care: ['대용량 공기 케어', '정수 케어', '방충·해충 관리', '위생용품'],
    picks: [PID(1247), PID(1498), PID(1694), PID(1511), PID(1514), PID(1274), PID(1047), PID(1049)],
    buy: '공장은 공정·환경이 다양해 현장 확인이 필요한 경우가 많습니다. 우선 통화나 방문 일정으로 공간을 확인한 뒤 제안드립니다.',
    cta: '공장 맞춤 상담하기' },
  { id: 'store', name: '매장', en: 'RETAIL STORE', img: 'assets/img/biz-store.webp', summary: '매장 향기·고객 접촉·출입구 해충',
    worries: ['매장 냄새·공기', '고객이 만지는 물건·출입구 위생', '화장실 위생', '출입구 벌레', '브랜드에 어울리는 향기'],
    care: ['공기청정', '향기 연출', '손 위생', '방충 케어'],
    picks: [PID(1719), PID(1033), PID(1210), PID(1212), PID(685), PID(859), PID(1694), PID(1511)],
    buy: '매장 향기는 월 서비스형(사업자 대상)이 많아 업종 확인 후 안내합니다. 공기청정기는 렌탈·구매를 함께 비교합니다.',
    cta: '매장 맞춤 상담하기' },
  { id: 'etc', name: '기타', en: 'OTHERS', img: 'assets/img/biz-etc.webp', summary: '미용실·헬스장·어린이집 등 그 밖의 공간',
    worries: ['업종에 맞는 위생 포인트가 궁금', '공기·냄새·해충 중 무엇부터인지 모름', '이용객 수에 맞는 규모 산정', '방문 관리 가능 여부', '예산 안에서 우선순위'],
    care: ['공간 진단', '공기 케어', '위생용품', '해충 진단'],
    picks: [PID(1247), PID(424), PID(859), PID(939), PID(1274), PID(1497)],
    buy: '업종·면적·이용객 수를 알려주시면 처방부터 드립니다. 어떤 업종이든 먼저 문의해 주세요.',
    cta: '맞춤 상담하기' }
];
INDUSTRIES.find(i => i.id === 'office').picks[5] = PID(560);
/* 에어컨 크리닝(가격표 반영, 신규 서비스 상품) — 사업장/홈 추천에 노출 */
const ACID = 'allcare-aircon-cleaning', MATID = 'allcare-mattress';
['restaurant','cafe','pcroom','hotel','office','academy','clinic','store'].forEach(id => { const x = INDUSTRIES.find(i => i.id === id); if (x) x.picks.push(ACID); });
INDUSTRIES.find(i => i.id === 'hotel').picks.push(MATID);

/* HOME CARE — 5 */
window.HOMECARES = [
  { id: 'baby', name: 'BABY', ko: '아기가 있는 집', img: 'assets/img/home-baby.webp', summary: '공기·젖병·빨래·모기까지 조심스러운 케어',
    worries: ['공기 중 먼지와 실내 공기', '젖병·장난감 세척과 위생', '아기 옷 세탁', '모기 등 벌레', '욕실 물·비데 위생'],
    care: ['공기청정', '생활 위생', '세탁·주방', '벌레 예방'],
    picks: [PID(530), PID(1213), PID(1211), PID(869), PID(849), PID(851), PID(763), PID(1070), PID(1477)],
    buy: '아기방에는 소형 공기청정기를, 거실에는 20평형 이상을 따로 두는 분도 많습니다. 소모품은 정기배송으로 편하게 관리해 보세요.',
    cta: '아기 맞춤 케어 상담하기' },
  { id: 'pet', name: 'PET', ko: '반려동물과 함께 사는 집', img: 'assets/img/home-pet.webp', summary: '털, 냄새, 공기, 생활위생, 해충',
    worries: ['털', '냄새', '공기', '생활위생', '해충'],
    care: ['공기청정', '공기살균', '탈취', '생활위생', '해충관리'],
    picks: [PID(1213), PID(1211), PID(1246), PID(784), PID(837), PID(1130), PID(863), PID(830), PID(1070)],
    buy: '펫 필터가 선택되는 모델(3UP, 판테온 기능성 필터)을 우선 확인하고, 무향 탈취제와 반려견용 기피제를 함께 구성합니다.',
    cta: '반려동물 맞춤 케어 상담하기' },
  { id: 'senior', name: 'SENIOR', ko: '부모님·어르신 댁', img: 'assets/img/home-senior.webp', summary: '관리 부담 없이, 깨끗하고 안전한 생활',
    worries: ['공기·냄새 관리', '욕실 위생', '정수기 필터 관리 부담', '방문 점검 필요', '간단한 조작'],
    care: ['방문 관리형 렌탈', '공기 케어', '욕실 케어', '정수 케어'],
    picks: [PID(1211), PID(556), PID(1384), PID(1366), PID(1349), PID(521), PID(859)],
    buy: '필터 교체·점검을 직접 하기 어려운 댁은 방문 관리형 렌탈이 편합니다. 자녀분이 대신 문의하셔도 괜찮습니다.',
    cta: '어르신 맞춤 케어 상담하기' },
  { id: 'family', name: 'FAMILY', ko: '온 가족이 함께 사는 집', img: 'assets/img/home-family.webp', summary: '넓은 공간, 여러 사람, 자주 쓰는 생활용품',
    worries: ['넓은 거실·주방 공기', '다인원 음용수', '주방·욕실 청소', '자주 떨어지는 생활용품', '욕실 위생'],
    care: ['공기청정·살균', '정수 케어', '욕실 케어', '정기배송'],
    picks: [PID(1210), PID(1212), PID(1247), PID(1053), PID(556), PID(1366), PID(869), PID(849), PID(1543)],
    buy: '가족 수와 공간 크기를 기준으로 렌탈/구매를 비교하고, 생활용품은 정기배송 주기를 함께 정해 드립니다.',
    cta: '가족 맞춤 케어 상담하기' },
  { id: 'single', name: 'SINGLE & COUPLE', ko: '1~2인 가구', img: 'assets/img/home-single.webp', summary: '작은 공간에 꼭 필요한 것만',
    worries: ['작은 공간에 맞는 크기', '싱크대 옆 설치 공간', '배수구·주방 냄새', '원룸 해충', '월 부담 줄이기'],
    care: ['소형 공기 케어', '미니 정수', '탈취·청소', '원룸 해충 케어'],
    picks: [PID(530), PID(429), PID(1504), PID(863), PID(830), PID(1372), PID(884)],
    buy: '작은 공간은 “꼭 필요한 한두 가지”만 고르는 것이 좋습니다. 렌탈이 부담되면 구매와 소모품 정기배송 조합도 살펴봅니다.',
    cta: '1~2인 가구 맞춤 케어 상담하기' }
];

/* ──────────────────────────────────────────────────────────────────────────
   제품 소제목 그룹(GROUPING) — 전체 제품 / 카테고리(공기·물·생활) / 고민 / 홈케어 목록의 소제목·필터 칩이 이 규칙을 씁니다.
   ▸ 상품 데이터(이름·keywords·sections·category·type)만 보고 자동 분류하므로, 관리자에서 새 상품을 추가해도 규칙에 맞으면 알아서 들어갑니다.
   ▸ groups 배열 순서 = 화면 표시 순서. 첫 번째로 맞는 그룹에 들어갑니다(family 를 지정해 부르면 그 family 그룹만 검사).
       family : 'air' | 'water' | 'life'    label : 소제목    etc : true 면 해당 family 의 '나머지' 그룹(family 지정 호출 시 무조건 포함)
       match / not : { cat:[category], names:[이름에 포함], keywords:[keywords 에 포함], section0:[sections 첫 값], sections:[sections 중 하나], types:[type], ids:[id] }
         - cat 은 AND 조건, 나머지(names/keywords/…)는 OR. 조건이 cat 뿐이면 그 카테고리 전부.  anySection: 1차(section0)에서 못 찾았을 때만 쓰는 보조 sections
       first : 이 그룹에서 맨 위에 둘 상품 조건(예: 정수기 그룹의 '슬림' 계열)
   ▸ 그룹 안 정렬: first → 렌탈 기기 → 구매형 기기 → 서비스 → 소모품(consumableNames). 같은 단계에서는 원래 순서 유지.
   ────────────────────────────────────────────────────────────────────────── */
window.GROUPING = {
  consumableNames: ['마이랩', '통합라벨'],
  serviceTypes: ['service'],
  serviceNames: ['매트리스', '에어컨 크리닝'],
  groups: [
    /* 에어케어 */
    { id: 'air-purifier',  family: 'air', label: '공기청정기',  match: { cat: ['air'], names: ['공기청정기'] }, not: { names: ['공기살균기'] },
      desc: '공기 속 미세먼지와 냄새를 걸러내는 공기청정기' },
    { id: 'air-sterilizer', family: 'air', label: '공기살균기', match: { cat: ['air'], names: ['공기살균기'], sections: ['air.sterilize'] },
      desc: 'UV 등으로 공기 중 세균·바이러스를 케어하는 공기살균' },
    { id: 'air-scent',     family: 'air', label: '향기 제품',   match: { cat: ['air'], names: ['에어제닉', '에어퍼퓸', '퍼퓸', '디퓨저', '방향', '탈취'], sections: ['air.space'] },
      desc: '에어제닉·에어퍼퓸 등 향기·탈취 제품' },
    { id: 'air-handdryer', family: 'air', label: '핸드드라이어', match: { names: ['핸드 드라이어', '핸드드라이어'], keywords: ['핸드드라이어'] } },
    { id: 'air-bodydryer', family: 'air', label: '바디드라이어', match: { names: ['바디 드라이어', '바디드라이어'], keywords: ['바디드라이어'] } },
    { id: 'air-etc',       family: 'air', label: '기타 공기 케어', etc: true, match: { cat: ['air'] } },
    /* 워터케어 */
    { id: 'water-purifier', family: 'water', label: '정수기', match: { cat: ['water'], names: ['정수기'], sections: ['water.drink'] }, first: { names: ['슬림'] },
      desc: '냉·온·정수 정수기 — 가정과 사업장 (주력 슬림 계열이 먼저)' },
    { id: 'water-shower',   family: 'water', label: '샤워기', match: { cat: ['water'], names: ['샤워'], sections: ['water.shower'] },
      desc: '샤워 물 관리를 위한 샤워기 (제휴·판매 상품)' },
    { id: 'water-bidet',    family: 'water', label: '비데', match: { names: ['비데'] }, desc: '비데 등 욕실 위생 케어' },
    { id: 'water-etc',      family: 'water', label: '기타 물 관련', etc: true, match: { cat: ['water'] } },
    /* 생활·위생 (살균·위생, 해충 등) */
    { id: 'life-bug',       family: 'life', label: '해충·방충', match: { section0: ['healing.bug'], sections: ['healing.bug'] }, desc: '해충 케어 제품과 서비스' },
    { id: 'life-hygiene',   family: 'life', label: '손·화장실 위생', match: { section0: ['healing.hygiene'] }, not: { names: ['매트리스', '라벨', '컨설팅', '에어컨'] }, desc: '손·화장실·사업장 위생' },
    { id: 'life-sterilize', family: 'life', label: '살균·소독', match: { section0: ['healing.sterilize'] }, anySection: ['healing.sterilize'], desc: '살균·소독' },
    { id: 'life-clean',     family: 'life', label: '청소·세정', match: { section0: ['healing.clean'] }, anySection: ['healing.clean'], desc: '주방·욕실·세탁 청소' },
    { id: 'life-car',       family: 'life', label: '차량 케어', match: { names: ['카케어', '차량 전용', '차량용'], keywords: ['카케어'] }, desc: '차량 실내 살균·탈취 케어' },
    { id: 'life-fresh',     family: 'life', label: '탈취·향기', match: { section0: ['healing.fresh'] }, anySection: ['healing.fresh'], desc: '탈취·향기' },
    { id: 'life-everyday',  family: 'life', label: '세탁·생활용품', match: { section0: ['healing.everyday'] }, anySection: ['healing.everyday'], desc: '세탁·생활용품' },
    { id: 'life-etc',       family: 'life', label: '위생 서비스·기타', etc: true, match: {} }
  ]
};

/* 제품 섹션(서브탭) 메타 */
window.SECTIONS = {
  air: {
    title: 'PURE AIR', headline: '매일 마시는 공기, 눈에 보이지 않아 더 세심하게.', img: 'assets/img/living-soft.webp',
    sub: [['all', '전체'], ['air.clean', 'AIR CLEAN'], ['air.sterilize', 'AIR STERILIZATION'], ['air.space', 'SPACE CARE']],
    subDesc: { 'air.clean': '공기 속 미세먼지와 냄새를 걸러내는 공기청정기', 'air.sterilize': 'UV 등으로 공기 중 세균·바이러스를 케어하는 공기살균', 'air.space': '탈취·향기·공간 연출로 마무리하는 스페이스 케어' },
    space: [['all', '전체'], ['lt10', '10평 이하'], ['10-20', '10~20평'], ['20-30', '20~30평'], ['30+', '30평 이상'], ['biz', '사업장']]
  },
  water: {
    title: 'PURE WATER', headline: '매일 마시고 사용하는 물, 더 깨끗하게 관리해 보세요.', img: 'assets/img/water-pour.webp',
    sub: [['all', '전체'], ['water.drink', 'DRINK 정수기'], ['water.shower', 'SHOWER 샤워필터'], ['water.bath', 'BATH 욕실']],
    subDesc: { 'water.drink': '냉·온·정수 정수기 — 가정과 사업장', 'water.shower': '샤워 물 관리를 위한 샤워필터·관련 부품 (제휴·판매 상품)', 'water.bath': '비데 등 욕실 위생 케어' }
  },
  life: {
    title: 'HEALING LIFE', headline: '매일 쓰는 것들부터, 조금 더 건강하게 바꿔 보세요.', img: 'assets/img/couple-kitchen.webp',
    sub: [['all', '전체'], ['healing.sterilize', 'STERILIZE'], ['healing.clean', 'CLEAN'], ['healing.hygiene', 'HYGIENE'], ['healing.fresh', 'FRESH'], ['healing.bug', 'BUG CARE'], ['healing.everyday', 'EVERYDAY']],
    subDesc: { 'healing.sterilize': '살균·소독', 'healing.clean': '주방·욕실·세탁 청소', 'healing.hygiene': '손·화장실·사업장 위생', 'healing.fresh': '탈취·향기', 'healing.bug': '해충 케어 제품과 서비스', 'healing.everyday': '세탁·생활용품' }
  }
};

/* CARE GUIDE — 9 */
window.GUIDES = [
  { id: 'air-choose', title: '공기청정기, 평수만 보고 고르면 아쉬운 이유', tag: 'AIR', img: 'assets/img/living-soft.webp', read: '4분',
    excerpt: '적용 면적, 생활 패턴, 필터 관리 — 세 가지를 순서대로 확인해 보세요.',
    related: ['air', 'pet', 'baby'], products: [PID(530), PID(1213), PID(1247)], keywords: ['공기청정기', '평수', '필터', '미세먼지'],
    body: [
      ['먼저 “어느 공간에 둘 것인가”', '공기청정기는 제품마다 권장 사용 면적이 있습니다. 세스코 기준으로 스마트핏 10은 33~66㎡(10~20평), 판테온 20평형·25평형, 스마트핏 30은 99~132㎡(30~40평) 공간에 맞춘 제품입니다. 거실이 주방과 이어진 구조라면 실제 사용 공간이 더 넓을 수 있어, 도면상 평수보다 “한 번에 청정하고 싶은 공간”을 기준으로 잡는 것이 좋습니다.'],
      ['생활 패턴이 필터 선택을 바꿉니다', '요리가 잦은 집은 탈취·유해가스 필터, 반려동물이 있는 집은 펫 필터 옵션이 있는 모델, 알레르기가 걱정되는 집은 알레르겐 필터 옵션을 확인해 보세요. 3UP처럼 필터를 선택할 수 있는 모델도 있습니다.'],
      ['관리가 쉬워야 오래 씁니다', '필터는 종류마다 교체 주기가 다릅니다. 세스코 안내에 따르면 판테온의 프리필터·하이엔드 헤파필터는 서비스 방문 시 12개월 주기로 교체되고, 기능성(유해가스) 필터는 4개월 주기 자가교체입니다. 교체를 챙기기 어렵다면 방문 관리가 포함된 렌탈이 편할 수 있습니다.'],
      ['체크리스트', '① 설치할 공간의 크기  ② 냄새·털·알레르기 등 우선 고민  ③ 필터 교체를 내가 할 수 있는가  ④ 렌탈/구매 예산  ⑤ 소음·크기(가구 배치)']
    ] },
  { id: 'rental-vs-buy', title: '렌탈과 구매, 나에게 맞는 선택은?', tag: 'RENTAL', img: 'assets/img/modern-house.webp', read: '4분',
    excerpt: '월 부담, 관리 여력, 사용 기간, 세 가지로 비교해 보세요.',
    related: ['rental'], products: [PID(1213), PID(556), PID(1366)], keywords: ['렌탈', '구매', '비교', '약정', '방문관리', '케어십'],
    body: [
      ['렌탈이 잘 맞는 경우', '초기 비용을 줄이고 싶거나, 필터 교체·점검을 직접 챙기기 어려운 경우입니다. 세스코 렌탈은 선택한 방문 주기에 맞춰 세스코 사이언스 케어 서비스로 제품을 관리합니다. 대부분 의무사용 36개월 기준으로 안내되며, 약정 기간과 방문 주기에 따라 월 렌탈료가 달라집니다.'],
      ['구매를 고려할 만한 경우', '오래 쓸 계획이고 관리를 직접 할 수 있다면 구매하는 편이 유리할 수 있습니다. 구매 시에는 “케어십 포함/미포함”을 고를 수 있어, 케어십 미포함은 셀프 관리, 포함은 방문 관리 서비스가 제공됩니다.'],
      ['이렇게 비교해 보세요', '월 렌탈료 × 의무사용 개월 수(총 렌탈금액)와 구매 비용을 나란히 놓고 보되, 방문 관리·필터 교체·A/S가 포함되는 범위를 같은 기준으로 비교해야 합니다. 사이트의 각 제품 상세에서 월 렌탈료·총 렌탈금액을 함께 볼 수 있습니다.'],
      ['주의할 점', '렌탈료는 프로모션·제휴카드·약정·방문주기에 따라 수시로 달라질 수 있고, 중도 해지 조건도 계약마다 다릅니다. 계약 전 조건은 반드시 공식 계약서 기준으로 확인하세요. 상담 시 함께 짚어 드립니다.']
    ] },
  { id: 'water-type', title: '정수기 UF와 RO, 방식부터 이해하기', tag: 'WATER', img: 'assets/img/water-pour.webp', read: '4분',
    excerpt: '이름은 비슷하지만 방식이 다릅니다. 우리 집 상황에 맞는 기준을 정리했습니다.',
    related: ['water'], products: [PID(1497), PID(1498), PID(1053)], keywords: ['정수기', 'UF', 'RO', '직수', '냉온정', '필터'],
    body: [
      ['UF(중공사막)와 RO(역삼투압)', 'UF는 중공사막 필터로 물을 거르는 방식, RO는 아주 미세한 막(역삼투압)을 이용하는 방식으로 알려져 있습니다. 같은 라인에 UF/RO 모델이 함께 있는 경우(예: 더맥스 스탠드 정수기 UF·RO)가 있습니다.'],
      ['어떤 기준으로 고를까', '① 설치 공간(폭·높이)  ② 사용 인원과 사용량  ③ 얼음 필요 여부  ④ 필터 교체 부담  ⑤ 예산(렌탈/구매). 인원이 많은 사업장은 용량이 큰 더블/더맥스 라인을, 1인 가구는 슬림한 미니 정수기를 살펴보세요.'],
      ['직수형과 탱크형', '직수형은 저수조 없이 바로 정수하는 구조이고, 탱크형은 정수한 물을 탱크에 저장합니다. 더슬림 정수기처럼 스테인리스 저수조를 사용하는 제품도 있습니다. 제품마다 구조가 달라 상세 설명을 확인하는 것이 좋습니다.'],
      ['관리는 어떻게', '필터는 정해진 주기로 교체해야 합니다. 렌탈은 방문 관리로 필터 교체·점검이 함께 진행되고, 구매는 케어십 포함/미포함에 따라 관리 방식이 달라집니다.']
    ] },
  { id: 'pet-home', title: '반려동물과 사는 집, 냄새와 털 관리 순서', tag: 'PET', img: 'assets/img/home-pet.webp', read: '3분',
    excerpt: '공기 → 냄새 원인 → 생활 위생 → 외출 케어 순으로 정리해 보세요.',
    related: ['pet', 'air', 'odor'], products: [PID(1213), PID(837), PID(1130)], keywords: ['반려동물', '펫', '강아지', '고양이', '털', '냄새', '탈취'],
    body: [
      ['1. 공기부터', '털과 비듬, 배변 냄새는 공기 중으로 퍼집니다. 펫 필터 옵션이 있는 공기청정기를 확인하고, 반려동물이 주로 머무는 공간 크기에 맞는 모델을 고르세요.'],
      ['2. 냄새의 “원인”을 줄이기', '세스코 마이랩 반려동물 탈취제는 향에 의한 자극을 줄인 무향 타입으로, 배변 패드·의류·용품 냄새의 원인을 케어하는 제품으로 소개됩니다. 향으로 덮기보다 원인 부위를 자주 케어하는 것이 좋습니다.'],
      ['3. 생활 위생', '바닥·잠자리 주변은 자주 닦고, 배수구·욕실은 정기적으로 세정하세요. 청소용 티슈나 세정제는 정기배송으로 두면 떨어지지 않아 편합니다.'],
      ['4. 산책과 외출', '산책이 잦다면 반려견 전용 모기·진드기 기피제(동물용 의약외품으로 소개됨)를 사용 전 설명서를 확인하고 활용하세요. 반려동물 종류나 건강 상태에 따라 다를 수 있어 수의사와 상의하는 것이 안전합니다.']
    ] },
  { id: 'baby-home', title: '아기가 있는 집 공기·위생 체크리스트', tag: 'BABY', img: 'assets/img/home-baby.webp', read: '3분',
    excerpt: '아이 방, 주방, 욕실을 나누어 점검하는 방법입니다.',
    related: ['baby', 'air', 'sterilize'], products: [PID(530), PID(869), PID(849)], keywords: ['아기', '아이', '영유아', '젖병', '세탁', '공기', '위생'],
    body: [
      ['아이 방', '침구와 바닥의 먼지가 쌓이기 쉬운 공간입니다. 방 크기에 맞는 소형 공기청정기를 두고 환기와 침구 세탁을 병행하세요.'],
      ['주방과 젖병', '세스코 마이랩 주방세제 프리미엄은 “아기 젖병부터 과일까지” 세척한다고 소개된 제품입니다. 사용 방법과 헹굼 기준은 제품 라벨을 꼭 확인하세요.'],
      ['빨래와 피부 닿는 섬유', '피부에 직접 닿는 옷은 저자극 세탁세제와 섬유유연제를 고민하는 분이 많습니다. 제품 설명(피부 저자극 테스트 등)을 확인하고, 아이 피부 상태에 따라 선택하세요.'],
      ['외출 시', '모기 기피제는 연령 제한 등 사용 조건이 제품마다 다릅니다. 라벨의 사용 연령과 주의사항을 반드시 확인하세요.']
    ] },
  { id: 'shower-water', title: '샤워·욕실 물 관리, 어디부터 시작할까', tag: 'BATH', img: 'assets/img/bathroom.webp', read: '3분',
    excerpt: '샤워필터, 잔수 밸브, 비데까지 욕실 물 관리 포인트.',
    related: ['water'], products: ['aromvi-17', 'aromvi-14', PID(1366)], keywords: ['샤워필터', '샤워기', '욕실', '비데', '아롬비', '잔수'],
    body: [
      ['샤워기 필터', '샤워기 필터는 필터 교체 주기를 지키는 것이 핵심입니다. 이 사이트에서 소개하는 아롬비 샤워필터는 세스코 자체 제품이 아닌 제휴·판매 상품이며, 사양과 구매 조건은 판매처(아롬비) 기준입니다.'],
      ['잔수(고인 물) 관리', '샤워기 호스와 헤드 안에 남는 물이 신경 쓰인다면 잔수 밸브 같은 부품을 검토할 수 있습니다.'],
      ['비데와 욕실 위생', '비데는 노즐·필터 관리가 중요합니다. 세스코 비데 렌탈은 바스존 케어 서비스가 함께 안내되어 있어, 관리를 직접 하기 어려운 분들이 살펴봅니다.'],
      ['정리', '욕실 물 관리는 “샤워기 → 잔수 → 비데 → 배수구” 순으로 한 가지씩 늘려 가면 부담이 적습니다.']
    ] },
  { id: 'biz-hygiene', title: '가게 위생 점검, 오픈 전 10분 체크리스트', tag: 'BUSINESS', img: 'assets/img/biz-restaurant.webp', read: '4분',
    excerpt: '주방, 홀, 화장실, 출입구를 나누어 매일 점검해 보세요.',
    related: ['biz'], products: [PID(853), PID(1049), PID(292)], keywords: ['사업장', '가게', '요식업', '카페', '점검', '체크리스트', 'HACCP', '위생'],
    body: [
      ['주방', '기름때가 쌓이기 쉬운 후드·바닥·배수구를 정해진 주기로 청소합니다. 도마·행주·수세미는 소독 주기를 정하세요. 식품용 소독제는 제품별 사용 방법을 확인해야 합니다.'],
      ['홀·출입구', '손님이 만지는 테이블·문손잡이·메뉴판을 소독하고, 출입구 틈과 문 아래로 벌레가 들어오지 않는지 점검합니다. 에어커튼이나 방충망 보완이 필요할 수 있습니다.'],
      ['화장실', '변기·세면대·바닥 청소와 함께 냄새 관리, 손 씻기 용품(핸드워시, 핸드 드라이어 등)을 갖추세요.'],
      ['해충·냄새 신호', '초파리·바퀴·나방이 보이거나 배수구 냄새가 반복되면 원인을 찾아야 합니다. 원인 파악이 어려우면 긴급진단 서비스 같은 전문 진단도 방법입니다.']
    ] },
  { id: 'filter-cycle', title: '필터, 언제 갈아야 할까?', tag: 'FILTER', img: 'assets/img/living-plants.webp', read: '3분',
    excerpt: '공기청정기·정수기 필터 관리의 기본 원칙.',
    related: ['air', 'water', 'rental'], products: [PID(1211), PID(556), PID(784)], keywords: ['필터', '교체', '헤파', '프리필터', '방문관리', '교체주기'],
    body: [
      ['제품마다 주기가 다릅니다', '필터 교체 주기는 제품·모델·사용 환경에 따라 다릅니다. 예를 들어 세스코 안내 기준 판테온은 프리필터·하이엔드 헤파필터가 서비스 방문 시 12개월 주기로 교체되고, 기능성(유해가스) 필터는 4개월 주기 자가교체입니다.'],
      ['사용 환경', '요리·흡연·반려동물, 공사 먼지 등이 있다면 필터가 더 빨리 오염될 수 있습니다. 성능 저하나 냄새가 느껴지면 교체 시기를 앞당기는 것이 좋습니다.'],
      ['방문 관리형 vs 셀프', '렌탈은 방문 시 교체·점검이 함께 이뤄지고, 구매(케어십 미포함)는 직접 교체해야 합니다. 스스로 챙기기 부담스럽다면 방문 관리를 고려하세요.'],
      ['필터 종류 확인', '같은 공기청정기라도 알레르겐/유해가스/오일미스트/펫 필터처럼 선택형이 있습니다. 상담 시 우리 집에 맞는 필터를 함께 정해 드립니다.']
    ] },
  { id: 'pest-first', title: '집에 벌레가 보이기 시작했다면', tag: 'BUG', img: 'assets/img/bedroom.webp', read: '3분',
    excerpt: '초기 대응 순서와 전문 진단이 필요한 경우.',
    related: ['pest'], products: [PID(292), PID(501), PID(1274)], keywords: ['해충', '벌레', '바퀴벌레', '초파리', '개미', '나방', '빈대', '진단'],
    body: [
      ['1. 무엇이 보이는지 기록', '사진을 찍어 어떤 해충인지, 언제·어디서 나오는지 기록하세요. 원인 파악에 큰 도움이 됩니다.'],
      ['2. 셀프 트랩과 청결', '초파리는 끈끈이 트랩(플라이 스틱 등)과 음식물·배수구 관리가 우선이고, 곡물을 보관하는 곳의 나방은 페로몬 트랩이 쓰입니다. 배수구 클리너로 유기물을 줄이는 것도 한 방법입니다.'],
      ['3. 반복된다면 원인 진단', '세스코의 긴급진단 서비스는 전문 컨설턴트가 방문해 발생 원인과 유입 경로를 분석하는 서비스로 안내되어 있습니다(세스코 안내 기준, 24시간 내 방문·계약 시 3만원 페이백).'],
      ['4. 시설 보완', '창문 방충망, 방충필름, 실내 배수구트랩 같은 시설 보완으로 유입을 줄일 수 있습니다. 필요 여부는 현장 상황에 따라 다르니 상담해 주세요.']
    ] }
];

/* 상담 폼 주제 */
window.TOPICS = ['공기 케어', '물 케어 (정수기·샤워·비데)', '생활·위생용품', '해충 관리', '정기배송', '렌탈 문의', '에어컨 크리닝 문의', '매트리스 문의', '사업장 맞춤 상담', '잘 모르겠어요 (먼저 진단받고 싶어요)'];

/* CARE FINDER 설정 */
window.FINDER = {
  places: [
    { id: 'one', label: '원룸·오피스텔', sub: '10평 내외', size: 'small', type: 'home', icon: 'home' },
    { id: 'apt20', label: '아파트·주택', sub: '20평 내외', size: 'mid', type: 'home', icon: 'home' },
    { id: 'apt30', label: '아파트·주택', sub: '30평 이상', size: 'large', type: 'home', icon: 'home' },
    { id: 'shop', label: '가게·매장', sub: '식당·카페·PC방·상가', size: 'biz', type: 'biz', icon: 'store' },
    { id: 'office', label: '사무실·학원·병원 등', sub: '시설·공용 공간', size: 'biz', type: 'biz', icon: 'building' }
  ],
  envs: [
    { id: 'baby', label: '아기가 있어요' }, { id: 'pet', label: '반려동물이 있어요' }, { id: 'senior', label: '어르신이 계세요' },
    { id: 'smoke', label: '흡연·조리 냄새가 있어요' }, { id: 'large', label: '공간이 넓어요' }, { id: 'small', label: '공간이 작아요' },
    { id: 'crowd', label: '이용하는 사람이 많아요' }
  ],
  concerns: [
    { id: 'air', label: '공기·미세먼지' }, { id: 'water', label: '마시는 물·욕실 물' }, { id: 'odor', label: '냄새' },
    { id: 'pest', label: '해충' }, { id: 'sterilize', label: '살균·위생' }, { id: 'clean', label: '청소·생활용품' }
  ],
  modes: [
    { id: 'rental', label: '렌탈로 관리받고 싶어요', sub: '방문 관리 포함, 월 부담 ↓' },
    { id: 'buy', label: '구매해서 쓰고 싶어요', sub: '한 번에 구매, 셀프 관리' },
    { id: 'sub', label: '소모품 정기배송이면 좋아요', sub: '생활용품 위주' },
    { id: 'any', label: '상담 후 결정할게요', sub: '조건을 비교해 보고 싶어요' }
  ]
};

/* 가격표 신규 서비스 상품(에어컨 크리닝·매트리스)을 홈케어 추천에도 노출 */
(window.HOMECARES || []).forEach(h => { if (['family','baby','senior','pet','single'].includes(h.id)) h.picks.push(ACID); });
(window.HOMECARES || []).forEach(h => { if (h.id === 'baby' || h.id === 'family') h.picks.push(MATID); });
