/* chatbot.js — '바로 상담' 버튼식 상담 안내 봇 (무료·서버 없음·외부 라이브러리 없음)
   ▸ 모든 페이지 공용. 메인(SPA)은 오른쪽 아래 '상담' 메뉴의 첫 항목으로, 그 밖의 페이지는 오른쪽 아래 '바로 상담' 버튼으로 엽니다.
   ▸ 자유 입력 AI 답변 없음: 버튼으로 고르면 사이트에 있는 페이지·상품(data/products.js)만 안내합니다. 가격은 사이트 표기 그대로, 없으면 '상담 시 안내'.
   ▸ 접수는 상담 폼과 같은 경로(js/core.js U.sendInquiry — CONFIG.formEndpoint 가 있으면 Apps Script, 없으면 이 기기 localStorage)로 보내며
     source:'chatbot', 대화 내용은 message·memo 에 담습니다. core.js 가 없는 정적 페이지는 아래 sendFallback 이 같은 방식으로 보냅니다.
   ▸ 대화 창은 처음 열 때 만듭니다(lazy). 상품 데이터가 없는 페이지는 추천 단계에서만 data/products.js 를 불러옵니다. */
(function(){
'use strict';
if (window.CescoChatbot) return;
var doc = document;
var SELF = doc.currentScript && doc.currentScript.src;
var ROOT = (function(){ try { return new URL('..', SELF || location.href).href; } catch (e) { return '/'; } })();   // 사이트 루트(…/js/chatbot.js 기준)
var url = function(p){ return ROOT + p; };
/* 메인(SPA) 안에서는 해시 경로를 그대로 써서 페이지를 새로 불러오지 않게 함 */
var link = function(p){ return p.charAt(0) === '#' && doc.getElementById('flMenu') && doc.getElementById('app') ? p : url(p); };
var CF = function(){ return window.CONFIG || {}; };
var PL = function(){ var p = CF().planner || {}; return { title: p.title || '세스코 라이프케어 SOL 플래너', phone: p.phone || '010 7434 0548', tel: p.phoneTel || 'tel:01074340548' }; };
var KAKAO = function(){ var k = CF().kakaoUrl || 'https://open.kakao.com/o/sUWS09Mi'; return /REPLACE_ME/.test(k) ? '' : k; };
var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
var won = function(n){ return Number(n).toLocaleString('ko-KR') + '원'; };
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────── 아이콘 (aria-hidden, 의미는 항상 글자로 함께 표시) ───────── */
var I = {
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  redo: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  kakao: '<path d="M12 4C7 4 3 7.1 3 11c0 2.5 1.7 4.7 4.2 5.9L6.5 20l3.6-2.4c.6.1 1.2.1 1.9.1 5 0 9-3.1 9-7S17 4 12 4z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>'
};
var ico = function(n){ return '<svg class="cb-ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (I[n] || I.info) + '</svg>'; };

/* ───────── 상담 흐름 데이터 (사이트에 이미 있는 페이지·상품 ID 만 사용) ───────── */
var CATS = [
  { k: 'water', label: '물 · 정수기', topic: '물 케어 (정수기·샤워·비데)', page: ['water/', '워터케어 — 정수기·비데 안내'],
    concerns: [['drink', '마시는 물·정수기'], ['bidet', '비데 위생'], ['filter', '필터 교체·관리'], ['office', '여럿이 쓰는 정수기']],
    pick: { home: ['G2000001504', 'G2000001384'], biz: ['G2000001497', 'G2000001385'], bidet: ['G2000001366', 'G2000001349'] } },
  { k: 'air', label: '공기 · 공기청정기·센스미', topic: '공기 케어', page: ['air/', '에어케어 — 공기청정기 안내'],
    concerns: [['dust', '미세먼지'], ['germ', '세균·바이러스 살균'], ['smell', '실내 냄새'], ['wide', '넓은 공간']],
    pick: { home: ['G2000000429', 'G2000001213'], biz: ['G2000001210', 'G2000000424'], germ: ['G2000000429', 'G2000001211'], wide: ['G2000001212', 'G2000001210'] } },
  { k: 'scent', label: '향기 · 방향·탈취', topic: '향기·방향 케어', page: ['perfume/', '퍼퓸 — 에어제닉·에어퍼퓸 안내'],
    concerns: [['first', '공간 첫인상 향기'], ['toilet', '화장실·실내 냄새'], ['car', '차량 향기']],
    pick: { home: ['allcare-airperfume-100', 'G2000001175'], biz: ['G2000001033', 'G2000001719'], car: ['allcare-carcare-solution'], toilet: ['G2000001033', 'G2000000830'] } },
  { k: 'home', label: '집안 케어 · 해충·진드기', topic: '해충 관리', page: ['home-care/', '홈케어 — 아이·반려동물·부모님 댁'],
    concerns: [['bug', '바퀴·벌레'], ['mite', '진드기·침구'], ['pet', '반려동물 냄새'], ['aircon', '에어컨 청소']],
    pick: { home: ['G2000001274', 'G2000000887'], biz: ['G2000001274', 'G2000001694'], bug: ['G2000001274', 'G2000000884'], mite: ['G2000000887', 'allcare-mattress'], pet: ['G2000000837', 'G2000000429'], aircon: ['allcare-aircon-cleaning'] } },
  { k: 'biz', label: '사업장 방제 · 위생', topic: '사업장 맞춤 상담', page: ['business/', '사업장 케어 — 업종별 위생관리'], bizOnly: true,
    concerns: [['bug', '해충·방역'], ['smell', '냄새·탈취'], ['hand', '손 위생·화장실'], ['food', '식품 표시·위생']],
    pick: { biz: ['G2000001274', 'G2000001694'], bug: ['G2000001274', 'G2000001694'], smell: ['G2000001033', 'G2000001210'], hand: ['G2000000688', 'G2000000685'], food: ['G2000000753', 'G2000001332'] } },
  { k: 'supplies', label: '소모품 · 살균·세정제', topic: '생활·위생용품', page: ['supplies/', '소모품 — 살균제·세정제·탈취제'],
    concerns: [['steril', '살균·소독'], ['clean', '주방·배수구 세정'], ['bugoff', '모기·벌레 기피'], ['deodor', '탈취']],
    pick: { home: ['G2000001633', 'G2000000863'], biz: ['G2000001047', 'G2000001048'], steril: ['G2000001633', 'G2000000853'], clean: ['G2000000936', 'G2000000863'], bugoff: ['G2000001070', 'G2000001130'], deodor: ['G2000000830', 'G2000000837'] } },
  { k: 'unknown', label: '잘 모르겠어요', topic: '잘 모르겠어요 (먼저 진단받고 싶어요)', page: null, concerns: [], pick: {} }
];
var REGIONS = ['양산', '물금', '부산', '김해', '울산', '기타'];
var TIMES = ['언제든 괜찮습니다', '오전 (9~12시)', '오후 (12~18시)', '저녁 (18시 이후)'];
/* 상담 폼(js/core.js consultFormHtml)과 같은 개인정보 문구 */
var PRIVACY = '[필수] 개인정보 수집·이용 동의 — 수집 항목: 이름·연락처·가정/사업장·지역·희망 연락 시간·문의 내용 / 목적: 상담 연락 / 상담 목적 외에는 사용하지 않으며, 삭제를 원하시면 전화로 요청해 주세요.';
var catBy = function(k){ for (var i = 0; i < CATS.length; i++) if (CATS[i].k === k) return CATS[i]; return null; };

/* ───────── 상태 ───────── */
var S, built = false, open = false, lastFocus = null, ov, dlg, logEl, actEl;
function reset(){ S = { step: 'cat', cat: null, space: null, concerns: [], recs: [], form: { name: '', phone: '', region: '', regionEtc: '', time: TIMES[0], agree: false } }; }
reset();

/* ───────── 스타일 (페이지마다 CSS 링크를 늘리지 않도록 주입) ───────── */
var CSS = [
'.cb-ico{width:20px;height:20px;flex:none;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}',
'.cb-fab{position:fixed;right:20px;bottom:calc(20px + var(--cb-lift,0px));z-index:115;display:inline-flex;align-items:center;gap:8px;min-height:56px;padding:0 20px 0 16px;border-radius:999px;background:var(--grad-blue,#0057B8);color:#fff;font:800 15px/1 inherit;font-family:inherit;letter-spacing:-.02em;border:0;cursor:pointer;box-shadow:0 14px 32px rgba(0,87,184,.38),inset 0 1px 0 rgba(255,255,255,.25);transition:transform .2s,bottom .3s}',
'.cb-fab:hover{transform:translateY(-2px)}',
'.cb-fab:focus-visible,.cb-dlg button:focus-visible,.cb-dlg a:focus-visible,.cb-dlg input:focus-visible,.cb-dlg select:focus-visible{outline:3px solid #1A73E8;outline-offset:2px}',
'body.cb-pad{padding-bottom:88px}',
'.cb-ov{position:fixed;inset:0;z-index:330;background:rgba(10,31,68,.38);display:flex;align-items:flex-end;justify-content:flex-end;padding:20px}',
'.cb-ov[hidden]{display:none}',
'.cb-dlg{position:relative;width:min(400px,100%);height:min(680px,calc(100vh - 40px));height:min(680px,calc(100dvh - 40px));display:flex;flex-direction:column;background:#fff;border-radius:24px;box-shadow:0 30px 80px rgba(10,31,68,.35);overflow:hidden;color:#132238;font-family:inherit;font-size:15px;line-height:1.55;word-break:keep-all;overflow-wrap:anywhere}',
'.cb-ov.in .cb-dlg{animation:cbIn .28s cubic-bezier(.2,.8,.2,1)}',
'@keyframes cbIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}',
'.cb-hd{display:flex;align-items:center;gap:8px;padding:12px 10px 12px 18px;background:#0A1F44;color:#fff}',
'.cb-hd .t{flex:1;min-width:0}',
'.cb-hd h2{font-size:16.5px;font-weight:800;margin:0;line-height:1.3;color:#fff}',
'.cb-hd p{font-size:12px;opacity:.85;margin:2px 0 0;line-height:1.35}',
'.cb-ib{display:inline-flex;align-items:center;justify-content:center;gap:4px;min-width:44px;height:44px;padding:0 8px;border-radius:12px;background:rgba(255,255,255,.12);color:#fff;border:0;cursor:pointer;font:700 12.5px/1 inherit;font-family:inherit}',
'.cb-ib:hover{background:rgba(255,255,255,.22)}',
'.cb-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:16px 14px 8px;background:#F4F6FA}',
'.cb-log{display:flex;flex-direction:column;gap:10px}',
'.cb-m{max-width:88%;padding:11px 14px;border-radius:18px;font-size:15px;line-height:1.55}',
'.cb-m.bot{align-self:flex-start;background:#fff;border:1px solid #E3E8F0;border-top-left-radius:6px}',
'.cb-m.me{align-self:flex-end;background:#0057B8;color:#fff;border-top-right-radius:6px;font-weight:700}',
'.cb-m .who{display:block;font-size:11.5px;font-weight:800;color:#5F6E85;margin-bottom:2px}',
'.cb-m small{display:block;color:#5F6E85;font-size:12.5px;margin-top:6px}',
'.cb-act{padding:12px 0 6px}',
'.cb-q{font-weight:800;font-size:14px;color:#0A1F44;margin:2px 2px 8px}',
'.cb-opts{display:flex;flex-wrap:wrap;gap:8px}',
'.cb-opt{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:8px 14px;border-radius:14px;background:#fff;border:2px solid #C9D3E3;color:#0A1F44;font:700 14.5px/1.3 inherit;font-family:inherit;cursor:pointer;text-align:left}',
'.cb-opt:hover{border-color:#0057B8}',
'.cb-opt[aria-pressed="true"]{border-color:#0057B8;background:#EAF3FF;box-shadow:inset 0 0 0 1px #0057B8}',
'.cb-opt .mk{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:6px;border:2px solid #8A97AD;flex:none}',
'.cb-opt[aria-pressed="true"] .mk{background:#0057B8;border-color:#0057B8;color:#fff}',
'.cb-opt .mk .cb-ico{width:14px;height:14px;stroke-width:3}',
'.cb-row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}',
'.cb-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:48px;padding:0 16px;border-radius:14px;border:0;font:800 15px/1.2 inherit;font-family:inherit;cursor:pointer;text-decoration:none;flex:1 1 auto;text-align:center}',
'.cb-btn.pri{background:#0057B8;color:#fff}',
'.cb-btn.pri:hover{background:#004A9C}',
'.cb-btn.sec{background:#fff;color:#0A1F44;border:2px solid #C9D3E3}',
'.cb-btn.kk{background:#FEE500;color:#191919}',
'.cb-btn.navy{background:#0A1F44;color:#fff}',
'.cb-btn[disabled]{opacity:.6;cursor:wait}',
'.cb-cards{display:grid;gap:8px;margin-top:4px}',
'.cb-card{display:flex;align-items:center;gap:12px;min-height:64px;padding:10px 12px;background:#fff;border:1px solid #E3E8F0;border-radius:16px;color:#132238;text-decoration:none}',
'.cb-card:hover{border-color:#0057B8}',
'.cb-card img{width:52px;height:52px;object-fit:contain;border-radius:10px;background:#F4F6FA;flex:none}',
'.cb-card .tx{flex:1;min-width:0}',
'.cb-card .tg{display:inline-block;font-size:11.5px;font-weight:800;color:#0A1F44;background:#EAF3FF;border-radius:6px;padding:1px 6px;margin-bottom:2px}',
'.cb-card b{display:block;font-size:14.5px;line-height:1.35}',
'.cb-card .pr{display:block;font-size:13px;color:#0057B8;font-weight:800;margin-top:2px}',
'.cb-card .cb-ico{color:#5F6E85}',
'.cb-note{font-size:12.5px;color:#5F6E85;margin:8px 2px 0}',
'.cb-f{display:grid;gap:12px}',
'.cb-f label.l{display:block;font-weight:800;font-size:13.5px;color:#0A1F44;margin-bottom:5px}',
'.cb-f label.l i{color:#C62828;font-style:normal}',
'.cb-in{width:100%;min-height:48px;padding:10px 12px;border:2px solid #C9D3E3;border-radius:12px;background:#fff;font-size:16px;font-family:inherit;color:#132238}',
'.cb-in:focus{border-color:#0057B8;outline:none}',
'.cb-fld.bad .cb-in{border-color:#C62828;border-style:dashed}',
'.cb-err{display:none;margin-top:5px;font-size:13px;font-weight:700;color:#B71C1C}',
'.cb-fld.bad .cb-err{display:flex;gap:4px}',
'.cb-chk{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;line-height:1.5;color:#2b3445;background:#fff;border:2px solid #C9D3E3;border-radius:12px;padding:10px 12px;cursor:pointer}',
'.cb-chk input{width:22px;height:22px;flex:none;margin-top:1px;accent-color:#0057B8}',
'.cb-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}',
'.cb-rcpt{background:#fff;border:1px solid #E3E8F0;border-radius:14px;padding:12px 14px;font-size:14px;margin-top:8px}',
'.cb-ft{display:flex;align-items:center;gap:6px;padding:8px 10px calc(8px + env(safe-area-inset-bottom));border-top:1px solid #E3E8F0;background:#fff}',
'.cb-ft .lb{font-size:12px;font-weight:800;color:#5F6E85;white-space:nowrap;padding:0 2px}',
'.cb-ft a{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:44px;padding:0 10px;border-radius:12px;font:800 13.5px/1.2 inherit;font-family:inherit;text-decoration:none;flex:1}',
'.cb-ft .tel{background:#0A1F44;color:#fff}',
'.cb-ft .kk{background:#FEE500;color:#191919}',
'.fl-act.cb-entry{background:var(--grad-blue,#0057B8);color:#fff}',
'.fl-act.cb-entry .ico,.fl-act.cb-entry .cb-ico{color:#fff}',
'.fl-act.cb-entry small{font-size:11.5px;font-weight:700;opacity:.9}',
'@media (max-width:767px){',
' .cb-ov{padding:0;align-items:stretch;background:#fff}',
' .cb-dlg{width:100%;height:100%;max-height:none;border-radius:0;box-shadow:none}',
' .cb-fab{right:14px;min-height:52px;padding:0 16px 0 14px;font-size:14.5px}',
'}',
'@media (prefers-reduced-motion:reduce){.cb-ov.in .cb-dlg{animation:none}.cb-fab{transition:none}}'
].join('\n');
function injectCss(){ if (doc.getElementById('cbCss')) return; var s = doc.createElement('style'); s.id = 'cbCss'; s.textContent = CSS; doc.head.appendChild(s); }

/* ───────── 실행기: 메인(SPA)은 기존 '상담' 메뉴에 합치고, 나머지는 '바로 상담' 버튼 ───────── */
var fab = null;
function mountLauncher(){
  injectCss();
  var menu = doc.getElementById('flMenu');
  if (menu) {
    if (!menu.querySelector('[data-act="chatbot"]')) {
      var b = doc.createElement('button');
      b.type = 'button'; b.className = 'fl-act cb-entry'; b.setAttribute('role', 'menuitem'); b.setAttribute('data-act', 'chatbot'); b.setAttribute('data-fl-item', '');
      b.setAttribute('aria-haspopup', 'dialog');
      b.innerHTML = ico('chat') + '<span>바로 상담 <small>안내 봇</small></span>';
      menu.insertBefore(b, menu.firstChild);
    }
    return;
  }
  fab = doc.createElement('button');
  fab.type = 'button'; fab.className = 'cb-fab'; fab.id = 'cbFab';
  fab.setAttribute('aria-haspopup', 'dialog'); fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-label', '바로 상담 — 상담 안내 봇 열기');
  fab.setAttribute('data-act', 'chatbot');
  fab.innerHTML = ico('chat') + '<span>바로 상담</span>';
  doc.body.appendChild(fab);
  doc.body.classList.add('cb-pad');
  syncLift();
}
/* 하단 고정 바(랜딩 하단 바·메인 하단 메뉴)가 보이면 그 높이만큼 버튼을 올림 */
function syncLift(){
  if (!fab) return;
  var h = 0;
  ['.lp-bar', '#bottomNav'].forEach(function(sel){ var el = doc.querySelector(sel); if (!el) return; var cs = getComputedStyle(el); if (cs.display === 'none' || cs.position !== 'fixed') return; var r = el.getBoundingClientRect(); if (r.height && r.top < innerHeight) h = Math.max(h, innerHeight - r.top); });
  doc.documentElement.style.setProperty('--cb-lift', h + 'px');
}
doc.addEventListener('click', function(e){
  var t = e.target.closest && e.target.closest('[data-act="chatbot"]');
  if (!t) return;
  e.preventDefault(); openBot(t);
});

/* ───────── 대화 창 ───────── */
function build(){
  injectCss();
  ov = doc.createElement('div');
  ov.className = 'cb-ov'; ov.id = 'cbOv'; ov.hidden = true;
  ov.innerHTML =
    '<div class="cb-dlg" id="cbDlg" role="dialog" aria-modal="true" aria-labelledby="cbTitle" aria-describedby="cbDesc">' +
      '<div class="cb-hd"><div class="t"><h2 id="cbTitle">바로 상담 · 안내 봇</h2><p id="cbDesc">버튼으로 고르는 자동 안내예요 (상담원 아님)</p></div>' +
        '<button type="button" class="cb-ib" data-cb="restart" aria-label="처음부터 다시 시작">' + ico('redo') + '<span>처음</span></button>' +
        '<button type="button" class="cb-ib" data-cb="close" aria-label="상담 안내 봇 닫기">' + ico('x') + '</button></div>' +
      '<div class="cb-body" id="cbBody"><div class="cb-log" id="cbLog" role="log" aria-live="polite" aria-label="상담 안내 대화"></div><div class="cb-act" id="cbAct"></div></div>' +
      '<div class="cb-ft" role="group" aria-label="사람과 상담"><span class="lb">사람과 상담</span>' +
        '<a class="tel" href="' + esc(PL().tel) + '" data-cb-human="tel">' + ico('phone') + '<span>전화</span></a>' +
        (KAKAO() ? '<a class="kk" href="' + esc(KAKAO()) + '" target="_blank" rel="noopener" data-cb-human="kakao">' + ico('kakao') + '<span>카카오톡</span></a>' : '') +
      '</div></div>';
  doc.body.appendChild(ov);
  dlg = ov.querySelector('#cbDlg'); logEl = ov.querySelector('#cbLog'); actEl = ov.querySelector('#cbAct');
  ov.addEventListener('click', onClick);
  ov.addEventListener('mousedown', function(e){ if (e.target === ov) close(); });
  ov.addEventListener('keydown', onKey);
  ov.addEventListener('change', onChange);
  ov.addEventListener('input', onInput);
  ov.addEventListener('submit', onSubmit);
  built = true;
}
var cfgP = null;
function ensureConfig(){ if (window.CONFIG) return Promise.resolve(); if (!cfgP) cfgP = loadScript(url('data/site.js')); return cfgP; }   // 정적 페이지: 전화·카카오·formEndpoint 를 data/site.js 에서
function openBot(from){
  if (open) return;
  if (!window.CONFIG) { var f0 = from || doc.activeElement; ensureConfig().then(function(){ openBot(f0); }); return; }
  if (!built) build();
  lastFocus = from || doc.activeElement;
  ov.hidden = false; open = true;
  if (!reduce) { ov.classList.remove('in'); void ov.offsetWidth; ov.classList.add('in'); }
  if (fab) fab.setAttribute('aria-expanded', 'true');
  doc.documentElement.classList.add('cb-open');
  if (matchMedia('(max-width:767px)').matches) { S._ov = doc.body.style.overflow; doc.body.style.overflow = 'hidden'; }
  if (!logEl.children.length) start(); else focusFirst();
}
function close(){
  if (!open) return;
  ov.hidden = true; open = false;
  if (fab) fab.setAttribute('aria-expanded', 'false');
  doc.documentElement.classList.remove('cb-open');
  if (S._ov !== undefined) { doc.body.style.overflow = S._ov || ''; delete S._ov; }
  var inMenu = lastFocus && lastFocus.closest && lastFocus.closest('#flMenu');
  var back = !inMenu && lastFocus && doc.contains(lastFocus) && lastFocus.offsetParent !== null ? lastFocus : (fab || doc.getElementById('flFab'));
  if (back && back.focus) back.focus();
}
function focusables(){ return Array.prototype.filter.call(dlg.querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]):not([tabindex="-1"]),select,textarea,[tabindex]:not([tabindex="-1"])'), function(el){ return el.offsetParent !== null || el === doc.activeElement; }); }
function onKey(e){
  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
  if (e.key !== 'Tab') return;
  var f = focusables(); if (!f.length) return;
  var first = f[0], last = f[f.length - 1];
  if (e.shiftKey && (doc.activeElement === first || !dlg.contains(doc.activeElement))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && (doc.activeElement === last || !dlg.contains(doc.activeElement))) { e.preventDefault(); first.focus(); }
}
/* 대화창 밖으로 포커스가 나가면 다시 안으로 */
doc.addEventListener('focusin', function(e){ if (open && dlg && !dlg.contains(e.target)) { var f = focusables(); if (f.length) f[0].focus(); } });

/* ───────── 메시지·단계 ───────── */
function say(html, who){
  var d = doc.createElement('div');
  d.className = 'cb-m ' + (who === 'me' ? 'me' : 'bot');
  d.innerHTML = (who === 'me' ? '<span class="sr-only">내 선택: </span>' : '<span class="who">안내 봇</span>') + html;
  logEl.appendChild(d);
}
function scrollEnd(){ var b = ov.querySelector('#cbBody'); requestAnimationFrame(function(){ b.scrollTop = b.scrollHeight; }); }
function focusFirst(){ setTimeout(function(){ var el = actEl.querySelector('[data-autofocus]') || actEl.querySelector('button,input,select,a[href]'); if (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } scrollEnd(); }, 30); }
function opt(attrs, label, pressed){ return '<button type="button" class="cb-opt" ' + attrs + (pressed != null ? ' aria-pressed="' + (pressed ? 'true' : 'false') + '"' : '') + '>' + (pressed != null ? '<span class="mk">' + (pressed ? ico('check') : '') + '</span>' : '') + '<span>' + esc(label) + '</span></button>'; }
function render(){
  var h = '';
  if (S.step === 'cat') {
    h = '<p class="cb-q" id="cbQ">어떤 게 궁금하세요?</p><div class="cb-opts" role="group" aria-labelledby="cbQ">' + CATS.map(function(c){ return opt('data-cb="cat" data-v="' + c.k + '"', c.label); }).join('') + '</div>';
  } else if (S.step === 'space') {
    h = '<p class="cb-q" id="cbQ">어디에서 쓰실 건가요?</p><div class="cb-opts" role="group" aria-labelledby="cbQ">' + opt('data-cb="space" data-v="home"', '가정') + opt('data-cb="space" data-v="biz"', '매장 · 사업장') + '</div>' + backRow();
  } else if (S.step === 'concern') {
    var c = catBy(S.cat);
    h = '<p class="cb-q" id="cbQ">특히 신경 쓰이는 게 있으면 골라 주세요 (여러 개 가능, 선택 사항)</p><div class="cb-opts" role="group" aria-labelledby="cbQ">' + c.concerns.map(function(x){ return opt('data-cb="concern" data-v="' + x[0] + '"', x[1], S.concerns.indexOf(x[0]) >= 0); }).join('') + '</div>' +
      '<div class="cb-row"><button type="button" class="cb-btn pri" data-cb="concernDone">' + (S.concerns.length ? '선택 완료' : '건너뛰기') + ' ' + ico('arrow') + '</button></div>' + backRow();
  } else if (S.step === 'rec') {
    h = '<div class="cb-row" style="margin-top:0"><button type="button" class="cb-btn pri" data-cb="toForm" data-autofocus>' + ico('chat') + ' 상담 연락 남기기</button></div>' +
      '<div class="cb-row"><button type="button" class="cb-btn sec" data-cb="restart">' + ico('redo') + ' 다른 분야 보기</button></div>';
  } else if (S.step === 'form') {
    h = formHtml();
  } else if (S.step === 'done') {
    h = '<div class="cb-row" style="margin-top:0"><button type="button" class="cb-btn sec" data-cb="restart">' + ico('redo') + ' 처음부터</button><button type="button" class="cb-btn sec" data-cb="close">닫기</button></div>';
  }
  actEl.innerHTML = h;
  focusFirst();
}
function backRow(){ return '<div class="cb-row"><button type="button" class="cb-btn sec" data-cb="back">' + ico('back') + ' 이전으로</button></div>'; }
function start(){
  logEl.innerHTML = ''; reset();
  say('안녕하세요. <b>' + esc(PL().title) + '</b>가 운영하는 상담·안내 사이트의 <b>상담 안내 봇</b>이에요.<small>세스코 본사 공식 상담 창구가 아니에요. 버튼을 고르시면 맞는 제품·페이지를 안내하고, 상담 연락을 남기실 수 있어요. 사람과 바로 이야기하시려면 아래 전화·카카오톡을 눌러 주세요.</small>');
  S.step = 'cat'; render();
}
var lastMeTxt = function(){ var m = logEl.querySelectorAll('.cb-m.me'); return m.length ? m[m.length - 1] : null; };
function pickCat(k){
  var c = catBy(k); if (!c) return;
  S.cat = k; S.concerns = [];
  say(esc(c.label), 'me');
  if (c.bizOnly) { S.space = 'biz'; afterSpace(); return; }
  S.step = 'space'; render();
}
function afterSpace(){
  var c = catBy(S.cat);
  if (c.concerns.length) { say('알겠어요. 특히 신경 쓰이는 부분이 있나요?'); S.step = 'concern'; render(); }
  else showRecs();
}
function pickSpace(v){ S.space = v; say(v === 'biz' ? '매장 · 사업장' : '가정', 'me'); afterSpace(); }
function concernDone(){
  var c = catBy(S.cat);
  var labels = c.concerns.filter(function(x){ return S.concerns.indexOf(x[0]) >= 0; }).map(function(x){ return x[1]; });
  say(labels.length ? esc(labels.join(', ')) : '건너뛰기', 'me');
  showRecs();
}
function goBack(){
  /* 마지막 선택 말풍선과 그 뒤 봇 말풍선을 지우고 이전 단계로 */
  var kids = Array.prototype.slice.call(logEl.children), lastMe = -1;
  kids.forEach(function(k, i){ if (k.classList.contains('me')) lastMe = i; });
  if (lastMe >= 0) kids.slice(lastMe).forEach(function(k){ k.remove(); });
  if (S.step === 'concern' && !catBy(S.cat).bizOnly) { S.step = 'space'; S.concerns = []; }
  else { S.step = 'cat'; S.cat = null; S.space = null; S.concerns = []; }
  render();
}

/* ───────── 추천 (사이트 데이터 그대로) ───────── */
var dataP = null;
function loadScript(src){ return new Promise(function(res){ var s = doc.createElement('script'); s.src = src; s.async = false; s.onload = s.onerror = function(){ res(); }; doc.head.appendChild(s); }); }
function ensureProducts(){
  if (window.CESCO_PRODUCTS && window.CESCO_PRODUCTS.length) return Promise.resolve();
  if (dataP) return dataP;
  dataP = Promise.all([loadScript(url('data/products.js')), loadScript(url('js/overrides.js'))]).then(function(){
    if (!window.fetch || !window.CescoOverrides || !window.CESCO_PRODUCTS) return;
    return fetch(url('data/price-overrides.json'), { cache: 'no-store' }).then(function(r){ return r.ok ? r.json() : null; }).then(function(o){
      if (o && window.CescoOverrides.valid(o)) { var n = window.CescoOverrides.apply(window.CESCO_PRODUCTS, o); window.CESCO_PRODUCTS.splice.apply(window.CESCO_PRODUCTS, [0, window.CESCO_PRODUCTS.length].concat(n)); }
    }).catch(function(){});
  });
  return dataP;
}
function optLow(o){ var c = [o.monthPrice, o.onsiteSingle, o.onsiteBundle, o.promo].filter(function(x){ return x != null && x > 0; }); return c.length ? Math.min.apply(null, c) : null; }
function priceText(p){
  var U = window.U;
  if (U && U.fromInfo) {   /* js/floating.js priceText 와 같은 기준 */
    var f = U.fromInfo(p);
    if (f && f.kind === 'rent') return f.text;
    if (!U.isRent(p) && p.buyPrice != null) return won(p.buyPrice) + (p.pricePrefix ? ' ' + p.pricePrefix : '');
    if (f) return f.text;
    return '상담 시 안내';
  }
  var v = (p.rentalOptions || []).map(optLow).filter(function(x){ return x != null; });
  if (v.length) return '월 ' + won(Math.min.apply(null, v)) + '부터 시작';
  if (p.priceFrom && p.priceFrom.price != null) return won(p.priceFrom.price) + '부터';
  if (p.buyPrice != null) return won(p.buyPrice) + (p.pricePrefix ? ' ' + p.pricePrefix : '');
  return '상담 시 안내';
}
function findP(id){ var P = window.CESCO_PRODUCTS || []; for (var i = 0; i < P.length; i++) if (P[i].id === id) return P[i]; return null; }
function imgSrc(p){ var s = p.image || ''; if (!s) return url('assets/img/placeholder.svg'); return /^(https?:)?\/\//.test(s) ? s : url(s.replace(/^\.?\//, '')); }
function pickIds(){
  var c = catBy(S.cat), ids = [];
  S.concerns.forEach(function(k){ (c.pick[k] || []).forEach(function(id){ ids.push(id); }); });
  (c.pick[S.space] || c.pick.home || c.pick.biz || []).forEach(function(id){ ids.push(id); });
  var seen = {}, out = [];
  ids.forEach(function(id){ if (seen[id] || out.length >= 2) return; seen[id] = 1; var p = findP(id); if (p && !p.hidden && !p.soldOut) out.push(p); });
  return out;
}
function showRecs(){
  S.step = 'rec'; actEl.innerHTML = '<p class="cb-note" role="status">안내할 내용을 찾는 중…</p>';
  var c = catBy(S.cat);
  var go = function(){
    var cards = [], prods = c.k === 'unknown' ? [] : pickIds();
    S.recs = prods.map(function(p){ return p.name; });
    prods.forEach(function(p){
      cards.push('<a class="cb-card" href="' + esc(link('#/product/' + encodeURIComponent(p.id))) + '" data-cb="link"><img src="' + esc(imgSrc(p)) + '" alt="" loading="lazy" width="52" height="52"><span class="tx"><span class="tg">상품</span><b>' + esc(p.name) + '</b><span class="pr">' + esc(priceText(p)) + '</span></span>' + ico('arrow') + '</a>');
    });
    if (c.page) cards.push(pageCard(c.page[0], c.page[1]));
    if (c.k === 'unknown') {
      if (S.space === 'biz') cards.push(pageCard('business/', '사업장 케어 — 업종별 위생관리'));
      else { cards.push(pageCard('#/finder', '케어 찾기 — 몇 가지 질문으로 맞는 케어 찾기')); cards.push(pageCard('home-care/', '홈케어 — 아이·반려동물·부모님 댁')); }
    }
    if (S.space === 'biz') cards.push(pageCard('check/', '사업장 위생 리스크 자가진단 (14개 업종 · 3분)', '자가진단'));
    var lead = c.k === 'unknown' ? (S.space === 'biz' ? '괜찮아요. 사업장이라면 3분 자가진단으로 먼저 확인해 보시고, 플래너 상담으로 맞춤 안내를 받아 보세요.' : '괜찮아요. 몇 가지 질문으로 맞는 케어를 찾아보거나, 바로 플래너 상담으로 안내받으실 수 있어요.') : '이런 걸 먼저 보시면 좋아요.';
    say(esc(lead) + '<div class="cb-cards">' + cards.join('') + '</div>' + (prods.length ? '<small>가격은 사이트에 표시된 기준이며 약정기간·방문주기·제휴카드·프로모션에 따라 달라질 수 있어요. 정확한 조건은 상담 시 안내해 드려요.</small>' : '') +
      '<small>연락처를 남기시면 플래너가 직접 연락드려요.</small>');
    render();
  };
  if (c.k === 'unknown') go(); else ensureProducts().then(go, go);
}
function pageCard(path, label, tag){ return '<a class="cb-card" href="' + esc(link(path)) + '" data-cb="link"><span class="tx"><span class="tg">' + esc(tag || '안내 페이지') + '</span><b>' + esc(label) + '</b></span>' + ico('arrow') + '</a>'; }

/* ───────── 연락처 ───────── */
function formHtml(){
  var F = S.form;
  return '<form class="cb-f" id="cbForm" novalidate aria-labelledby="cbFq"><p class="cb-q" id="cbFq" style="margin-bottom:0">연락받으실 정보를 남겨 주세요</p>' +
    '<div class="cb-hp" aria-hidden="true"><label>웹사이트<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
    '<div class="cb-fld" id="cbFName"><label class="l" for="cbName">이름 <i aria-hidden="true">*</i><span class="sr-only">(필수)</span></label><input class="cb-in" id="cbName" name="name" autocomplete="name" placeholder="홍길동" maxlength="40" value="' + esc(F.name) + '" aria-describedby="cbNameErr" data-autofocus><span class="cb-err" id="cbNameErr">! 이름을 2글자 이상 입력해 주세요.</span></div>' +
    '<div class="cb-fld" id="cbFPhone"><label class="l" for="cbPhone">연락처 <i aria-hidden="true">*</i><span class="sr-only">(필수)</span></label><input class="cb-in" id="cbPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" maxlength="20" value="' + esc(F.phone) + '" aria-describedby="cbPhoneErr"><span class="cb-err" id="cbPhoneErr">! 연락 가능한 전화번호를 숫자로 입력해 주세요. (예: 010-1234-5678)</span></div>' +
    '<div class="cb-fld"><span class="l" style="display:block;font-weight:800;font-size:13.5px;color:#0A1F44;margin-bottom:5px" id="cbRq">지역</span><div class="cb-opts" role="group" aria-labelledby="cbRq">' + REGIONS.map(function(r){ return opt('data-cb="region" data-v="' + esc(r) + '"', r, F.region === r); }).join('') + '</div>' +
      (F.region === '기타' ? '<label class="l" for="cbRegionEtc" style="margin-top:8px">기타 지역 (선택)</label><input class="cb-in" id="cbRegionEtc" name="regionEtc" maxlength="40" placeholder="예: 창원, 밀양" value="' + esc(F.regionEtc) + '">' : '') + '</div>' +
    '<div class="cb-fld"><label class="l" for="cbTime">희망 연락 시간</label><select class="cb-in" id="cbTime" name="time">' + TIMES.map(function(t){ return '<option' + (F.time === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
    '<div class="cb-fld" id="cbFAgree"><label class="cb-chk"><input type="checkbox" id="cbAgree" name="agree"' + (F.agree ? ' checked' : '') + ' aria-describedby="cbAgreeErr"><span>' + esc(PRIVACY) + ' <i style="color:#C62828;font-style:normal" aria-hidden="true">*</i></span></label><span class="cb-err" id="cbAgreeErr">! 상담 연락을 위해 개인정보 수집·이용에 동의해 주세요.</span></div>' +
    '<p class="cb-note" style="margin-top:0">입력하신 내용은 사이트 화면에 공개되지 않습니다.</p>' +
    '<button type="submit" class="cb-btn pri" id="cbSubmit">상담 신청 보내기</button>' +
    '<button type="button" class="cb-btn sec" data-cb="backRec">' + ico('back') + ' 이전으로</button></form>';
}
function onInput(e){ var t = e.target, F = S.form; if (t.id === 'cbName') F.name = t.value; else if (t.id === 'cbPhone') F.phone = t.value; else if (t.id === 'cbRegionEtc') F.regionEtc = t.value; }
function onChange(e){ var t = e.target; if (t.id === 'cbTime') S.form.time = t.value; else if (t.id === 'cbAgree') { S.form.agree = t.checked; if (t.checked) t.closest('.cb-fld').classList.remove('bad'); } }
function setBad(id, bad, inputId){ var f = doc.getElementById(id); if (!f) return; f.classList.toggle('bad', bad); var i = doc.getElementById(inputId); if (i) i.setAttribute('aria-invalid', bad ? 'true' : 'false'); }
function readForm(f){
  var F = S.form, name = F.name.trim(), phone = F.phone.trim(), digits = phone.replace(/\D/g, '');
  /* js/core.js readConsultForm 과 같은 검사 */
  var okName = name.length >= 2, okPhone = /^[0-9+\-\s()]{9,20}$/.test(phone) && /^(0\d{8,10}|82\d{8,11})$/.test(digits);
  setBad('cbFName', !okName, 'cbName'); setBad('cbFPhone', !okPhone, 'cbPhone'); setBad('cbFAgree', !F.agree, 'cbAgree');
  if (!okName) { doc.getElementById('cbName').focus(); return null; }
  if (!okPhone) { doc.getElementById('cbPhone').focus(); return null; }
  if (!F.agree) { doc.getElementById('cbAgree').focus(); return null; }
  var c = catBy(S.cat) || {}, concernLabels = (c.concerns || []).filter(function(x){ return S.concerns.indexOf(x[0]) >= 0; }).map(function(x){ return x[1]; });
  var spaceTxt = S.space === 'biz' ? '매장·사업장' : '가정';
  var region = F.region === '기타' ? ('기타' + (F.regionEtc.trim() ? ' (' + F.regionEtc.trim() + ')' : '')) : F.region;
  var summary = '[챗봇 상담] 관심: ' + (c.label || '-') + ' / 공간: ' + spaceTxt + ' / 고민: ' + (concernLabels.join(', ') || '선택 안 함');
  var memo = summary + ' / 안내한 상품: ' + (S.recs.join(', ') || '없음') + ' / 지역: ' + (region || '-') + ' / 희망 연락 시간: ' + F.time;
  var d = new Date(), z = function(n){ return String(n).padStart(2, '0'); };
  var first = S.recs.length ? findByName(S.recs[0]) : null;
  var rec = {
    id: 'CA-' + String(d.getFullYear()).slice(2) + z(d.getMonth() + 1) + z(d.getDate()) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
    createdAt: d.toISOString(), name: name, phone: phone, kind: S.space === 'biz' ? '사업장' : '가정', topic: c.topic || '', category: c.topic || '',
    region: region, time: F.time, message: summary, memo: memo, agree: true, website: (f.website && f.website.value) || '',
    product: first ? first.name : '', productId: first ? first.id : '', source: 'chatbot'
  };
  return Object.assign(rec, source());
}
function findByName(n){ var P = window.CESCO_PRODUCTS || []; for (var i = 0; i < P.length; i++) if (P[i].name === n) return P[i]; return null; }
/* js/core.js inquirySource 와 같은 값 (core.js 가 없는 페이지용 대체) */
var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
function source(){
  if (window.U && window.U.inquirySource) { var o = window.U.inquirySource(); if (!window.LANDING_KEY && pageKey() !== 'main') o.page = pageKey(); return o; }
  var s = {}; try { s = JSON.parse(sessionStorage.getItem('cescoSource') || '{}') || {}; } catch (e) {}
  var out = { page: pageKey(), pageUrl: (location.pathname + location.search + location.hash).slice(0, 400), referrer: s.referrer || (doc.referrer && doc.referrer.indexOf(location.origin) !== 0 ? doc.referrer.slice(0, 300) : '') };
  var qs = null; try { qs = new URLSearchParams(location.search); } catch (e) {}
  UTM.forEach(function(k){ out[k] = (s.utm || {})[k] || (qs && qs.get(k) ? qs.get(k).slice(0, 200) : ''); });
  return out;
}
function pageKey(){ if (window.LANDING_KEY) return window.LANDING_KEY; var m = location.pathname.match(/\/([a-z-]+)\/(?:index\.html)?$/); return m ? m[1] : 'main'; }
var formOn = function(){ var ep = CF().formEndpoint; return !!(ep && (/^https:\/\//.test(ep) || /^http:\/\/(localhost|127\.0\.0\.1)/.test(ep))); };
/* js/core.js sendInquiry 와 같은 저장·전송 (core.js 가 없는 정적 페이지용) */
function sendFallback(rec){
  try { var list = JSON.parse(localStorage.getItem('cescoInquiries') || '[]'); list.push(Object.assign({}, rec, { product: rec.productId ? { id: rec.productId, name: rec.product } : null, page: rec.pageUrl })); localStorage.setItem('cescoInquiries', JSON.stringify(list.slice(-50))); } catch (e) {}
  if (!formOn() || !window.fetch) return Promise.resolve({ mode: 'local' });
  var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function(){ if (ctl) ctl.abort(); }, 12000);
  return fetch(CF().formEndpoint, { method: 'POST', mode: 'no-cors', cache: 'no-store', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(rec), signal: ctl ? ctl.signal : undefined })
    .then(function(){ return { mode: 'remote' }; }, function(){ return { mode: 'fail' }; })
    .then(function(r){ clearTimeout(tm); return r; });
}
function send(rec){ return window.U && window.U.sendInquiry ? window.U.sendInquiry(rec) : sendFallback(rec); }
var busy = false;
function onSubmit(e){
  if (e.target.id !== 'cbForm') return;
  e.preventDefault(); if (busy) return;
  var rec = readForm(e.target); if (!rec) return;
  busy = true;
  var b = doc.getElementById('cbSubmit'); if (b) { b.disabled = true; b.textContent = '보내는 중…'; }
  say(esc(rec.name) + ' · ' + esc(maskPhone(rec.phone)) + ' · ' + esc(rec.region || '지역 미선택'), 'me');
  Promise.resolve(send(rec)).then(function(r){ done(rec, r || { mode: 'local' }); }, function(){ done(rec, { mode: 'fail' }); }).then(function(){ busy = false; });
}
function maskPhone(p){ var d = String(p).replace(/\D/g, ''); return d.length >= 8 ? d.slice(0, 3) + '-****-' + d.slice(-4) : '연락처 입력함'; }
function done(rec, res){
  var pl = PL(), k = KAKAO();
  var btns = '<div class="cb-row"><a class="cb-btn navy" href="' + esc(pl.tel) + '">' + ico('phone') + ' ' + esc(pl.phone) + ' 전화하기</a>' + (k ? '<a class="cb-btn kk" href="' + esc(k) + '" target="_blank" rel="noopener">' + ico('kakao') + ' 카카오톡 상담</a>' : '') + '</div>';
  var box = '<div class="cb-rcpt">접수번호 <b>' + esc(rec.id) + '</b><br>관심 분야 ' + esc(rec.category || '-') + '</div>';
  var h;
  if (res.mode === 'remote') h = '<b>접수되었어요. 곧 연락드릴게요.</b><br>' + esc(rec.name) + '님, 남겨 주신 연락처로 ' + esc(pl.title) + '가 연락드려요.' + box + '<small>급하시면 바로 전화나 카카오톡으로 문의해 주세요.</small>' + btns;
  else if (res.mode === 'fail') h = '<b>전송이 원활하지 않았어요.</b><br>' + esc(rec.name) + '님, 번거로우시겠지만 전화나 카카오톡으로 연락 주시면 바로 안내해 드릴게요.' + box + btns;
  else h = '<b>상담 신청서가 작성되었어요.</b><br>' + esc(rec.name) + '님, 지금 온라인 신청은 이 기기에만 기록되어 플래너에게 자동으로 전달되지 않을 수 있어요.<br><b>가장 빠른 답변을 원하시면 아래 접수번호를 알려 주시며 전화나 카카오톡으로 연락 주세요.</b>' + box + '<small>입력하신 내용은 이 기기의 브라우저에만 저장되며 사이트에 공개되지 않습니다.</small>' + btns;
  say(h);
  S.step = 'done'; S.lastId = rec.id; S.lastMode = res.mode; render();
}

/* ───────── 클릭 ───────── */
function onClick(e){
  var t = e.target.closest('[data-cb]'); if (!t) return;
  var a = t.getAttribute('data-cb'), v = t.getAttribute('data-v');
  if (a === 'close') { close(); return; }
  if (a === 'restart') { start(); return; }
  if (a === 'link') { setTimeout(close, 0); return; }   // 링크 이동(같은 페이지 해시 이동이면 창만 닫힘)
  if (a === 'cat') pickCat(v);
  else if (a === 'space') pickSpace(v);
  else if (a === 'concern') { var i = S.concerns.indexOf(v); if (i >= 0) S.concerns.splice(i, 1); else S.concerns.push(v); render(); var nb = actEl.querySelector('[data-cb="concern"][data-v="' + v + '"]'); if (nb) nb.focus(); }
  else if (a === 'concernDone') concernDone();
  else if (a === 'back') goBack();
  else if (a === 'toForm') { say('상담 연락 남기기', 'me'); say('좋아요. 이름과 연락처를 남겨 주시면 플래너가 확인 후 연락드려요.'); S.step = 'form'; render(); }
  else if (a === 'backRec') { var kids = logEl.querySelectorAll('.cb-m'); for (var j = 0; j < 2 && kids.length - 1 - j >= 0; j++) kids[kids.length - 1 - j].remove(); S.step = 'rec'; render(); }
  else if (a === 'region') { S.form.region = S.form.region === v ? '' : v; render(); var rb = actEl.querySelector('[data-cb="region"][data-v="' + v + '"]'); if (rb) rb.focus(); }
}

/* ───────── 시작 ───────── */
function init(){ mountLauncher(); }
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
window.addEventListener('resize', syncLift); window.addEventListener('load', syncLift);
window.CescoChatbot = { open: function(){ openBot(); }, close: close, restart: function(){ if (!built) build(); start(); } };
})();
