# 세스코 올케어 (CESCO ALL CARE)
세스코 라이프케어 SOL 플래너 최영척 · 세스코 양산지국 · 개인 상담/상품 안내 사이트 (정적 SPA, 빌드 불필요)

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
- 분위기 이미지(`assets/img`): Unsplash 무료 라이선스.
- 로고/명함: 사용자 제공 파일.

## 관리자 페이지 (/admin/)
- 주소: `https://cescoallcare.github.io/cesco-allcare/admin/` (`admin/index.html`, noindex). 로그인은 정적 사이트의 **화면 잠금**일 뿐 진짜 보안이 아닙니다(비밀번호는 솔트+PBKDF2-SHA256 해시만 `admin/auth.js` 에 있음. 변경은 `python3 tools/make_admin_hash.py`).
- 데이터 구조: 기본 데이터 `data/products.js` + 오버라이드 `data/price-overrides.json`(기본 대비 바뀐 필드만). 사이트는 `js/loader.js` 가 로드 시 `price-overrides.json?v=타임스탬프` 를 받아 `js/overrides.js` 로 병합한 뒤 core/pages/app 을 로드합니다. 파일이 없거나 실패하면 기본 데이터로 동작합니다.
- 게시: GitHub fine-grained 토큰(이 저장소 Contents: Read and write)을 입력하면 Contents API(`PUT /repos/cescoallcare/cesco-allcare/contents/data/price-overrides.json`)로 커밋 → Pages 자동 재배포(1~2분). 토큰이 없으면 "JSON 다운로드" 후 저장소 `data/` 에 수동 업로드.
- 배포 복사본에는 `screenshots/`, `tmp/`, `tools/` 를 제외하고 `.nojekyll` 을 유지합니다.
