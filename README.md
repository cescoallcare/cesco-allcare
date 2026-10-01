# 세스코 올케어 (CESCO ALL CARE)
세스코 라이프케어 SOL 플래너 최영척 · 개인 상담/상품 안내 사이트 (정적 SPA, 빌드 불필요)

## 실행
    cd cesco-allcare && python3 -m http.server 8123   # → http://localhost:8123/
`index.html` 을 그대로 정적 호스팅(GitHub Pages, Netlify, 일반 웹호스팅)에 올리면 됩니다. 해시 라우팅(#/...)이라 서버 설정이 필요 없습니다.

## 수정 위치
| 무엇을 | 어디를 |
|---|---|
| 전화·이메일·**카카오톡 링크**·**폼 전송 주소(formEndpoint)** | `data/site.js` 맨 위 `CONFIG` (`kakaoUrl`에 `REPLACE_ME`가 있으면 클릭 시 "준비 중" 안내) |
| 상담 신청 → 서버 전송 | `js/app.js` 의 `submitInquiry()` 주석 참고 (현재는 브라우저 localStorage `cescoInquiries` 저장) |
| 업종/홈케어/고민/가이드/파인더 문구 | `data/site.js` |
| 상품(이름·가격·이미지·렌탈료 등) | `data/products.js` (`data/products.json` 동일 내용). 이미지는 `image` 필드 경로만 바꾸면 됨 |
| **상품 가격·정보 수정(관리자 페이지)** | `/admin/` → 수정 후 "GitHub에 게시" → `data/price-overrides.json` 커밋 (아래 참고) |
| 디자인 | `css/style.css` (변수는 `:root`) |

## 상품 데이터 원칙
- 66개: 세스코몰(cescomall.co.kr) 상품 페이지에서 2026-09-30 확인한 값. 6개: 아롬비(aromvi.com) 제휴·판매 상품(PARTNER PRODUCT 뱃지).
- 가격·월 렌탈료는 확인된 값만 표시, 미확인은 "상담 시 안내". 프로모션/제휴카드/약정에 따라 달라질 수 있음.
- 버튼(구매하기/렌탈 문의)은 해당 데이터가 없으면 자동 숨김.
- `tools/` 는 데이터 생성용 스크립트(크롤 원본 HTML 제외됨). `tools/smoke.py`, `interact.py`, `shots.py` 는 playwright 점검 스크립트.

## 이미지 출처
- 상품 이미지: 세스코몰/아롬비 게시 이미지 (사용자가 사용 허락).
- 분위기 이미지(`assets/img`, WebP 최적화본): Unsplash 무료 라이선스. 원본 JPG는 `tools/orig-img/`(배포 제외)에 보관.
- 로고/명함: 사용자 제공 파일.

## 관리자 페이지 (/admin/)
- 주소: `https://cescoallcare.github.io/cesco-allcare/admin/` (`admin/index.html`, noindex). 로그인은 정적 사이트의 **화면 잠금**일 뿐 진짜 보안이 아닙니다(비밀번호는 솔트+PBKDF2-SHA256 해시만 `admin/auth.js` 에 있음. 변경은 `python3 tools/make_admin_hash.py`).
- 데이터 구조: 기본 데이터 `data/products.js` + 오버라이드 `data/price-overrides.json`(기본 대비 바뀐 필드만). 사이트는 `js/loader.js` 가 로드 시 `price-overrides.json?v=타임스탬프` 를 받아 `js/overrides.js` 로 병합한 뒤 core/pages/app 을 로드합니다. 파일이 없거나 실패하면 기본 데이터로 동작합니다.
- 게시: GitHub fine-grained 토큰(이 저장소 Contents: Read and write)을 입력하면 Contents API(`PUT /repos/cescoallcare/cesco-allcare/contents/data/price-overrides.json`)로 커밋 → Pages 자동 재배포(1~2분). 토큰이 없으면 "JSON 다운로드" 후 저장소 `data/` 에 수동 업로드.
- 배포 복사본에는 `screenshots/`, `tmp/`, `tools/` 를 제외하고 `.nojekyll` 을 유지합니다.

## 가격표 반영 (2026-10-01, 플래너 제공 가격표 5종)
- 원문: `tools/price-tables.md` → `python3 tools/apply_price_tables.py` 가 `tools/products.base.json`(세스코몰 기준 기본 데이터)에 표를 덧입혀 `data/products.js`/`products.json` 을 다시 생성합니다(멱등). `python3 tools/verify_data.py` 로 원문↔데이터 행·숫자 대조.
- 새 데이터 필드: `rentalOptions[]`(타입·의무사용기간·방문주기·정상가·이달의 판매가·현장 할인가(단품/결합)·프로모션·재렌탈가·재렌탈 프로모션·비고·표 행번호), `priceMatrix`(매트리스 규격×등급), `servicePrices`(에어컨 크리닝), `priceFrom`(목록 “○○원부터” 기준), `catLabel`.
- `rentalOptions` 가 있으면 `rentalMonthly`(최저 이달의 판매가) 등은 옵션에서 파생된 값입니다. 목록/카드의 “월 ○○원부터”는 **이달의 판매가(온라인 노출가) 옵션 중 최저가** 기준입니다.
- 관리자(/admin): 상품 “상세·옵션표”에서 옵션 행/매트리스/서비스 가격표를 인라인 편집(JSON 직접 편집 포함), “렌탈 옵션표 CSV”로 행 단위 라운드트립. `price-overrides.json` 형식(version 1)은 그대로이며 `patches` 에 `rentalOptions` 등이 필드로 들어갑니다.

## 디자인/문구 개선 (2026-10-01)
- `css/style.css` 하단 "Premium refinement layer"에서 히어로(풀블리드+글래스 플래너 카드)·숫자 밴드·카드/버튼/폼·딥블루 상담영역·푸터를 정교화. 스크롤 리빌/헤더 전환/카운트업은 `js/app.js` 하단(prefers-reduced-motion 존중).
- 이미지는 WebP(최대 1920px)로 변환(7.7MB→4.6MB). 명함 이미지는 `assets/logo/namecard.webp`.
- 문구 교정은 `tools/copy_edit.py`, `tools/copy_edit_products.py`로 재현 가능. 점검: `tools/regress.py`(콘솔/깨진이미지/가로스크롤/기능), `tools/shoot.py`(전·후 스크린샷).

## 플로팅 UI (2026-10-01)
- `js/floating.js` : 모든 라우트에서 유지되는 fixed UI. ① 오른쪽 아래 빠른 상담 FAB(맞춤 상담 신청·전화·카카오톡·맨 위로, 접기/펼치기) ② 헤더 아래 왼쪽 칩 3종(베스트 인기 / 베스트 핫딜 / 이맘때 추천) + 상품 패널.
- `data/curation.js` : 표시 개수·안내 문구·**월별 추천 규칙 테이블**(`seasonal.months` / `groups`)을 분리해 둔 설정 파일. 여기만 고치면 이맘때 추천이 바뀝니다.
- 계산 기준: 베스트 인기 = BEST 페이지와 같은 세스코몰 리뷰 수 순위(제휴 상품 제외) / 베스트 핫딜 = 렌탈 가격표의 정상가 대비 ‘이달의 판매가’·‘현장 할인가(단품)’ 중 낮은 값의 할인율(상품별 최대 옵션 1개) / 이맘때 추천 = 브라우저 날짜의 월 규칙.
- 상품은 `window.CESCO_PRODUCTS`(관리자 오버라이드 반영본)에서 패널을 열 때마다 계산하므로 숨김·삭제·품절 상품은 자동으로 빠집니다.
- 상담 영역 외 상단(헤더·히어로)에는 플래너 이름을 표시하지 않습니다(`data/site.js`의 `planner.name` 은 상담/플래너 소개/푸터에서만 사용).
- 명함 이미지(`assets/logo/namecard.webp`)는 지점명 줄을 지운 버전입니다. 원본은 `tools/orig-img/`(배포 제외)에 보관.
