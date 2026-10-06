/* admin.js — 상품 가격/정보 관리 (로그인 → 표 편집 → CSV·xlsx 일괄 업로드 → GitHub Contents API 게시)
   데이터 흐름: 기본 데이터(../data/products.js)  +  오버라이드(../data/price-overrides.json)  =  사이트가 보는 상품 목록
   이 페이지는 "기본 데이터 대비 달라진 부분"만 price-overrides.json 으로 저장/게시합니다. (js/overrides.js 참고) */
(function(){
'use strict';
var CO = window.CescoOverrides;
var CFG = { owner: 'cescoallcare', repo: 'cesco-allcare', branch: 'main', path: 'data/price-overrides.json', api: 'https://api.github.com' };
var LS_TOKEN = 'cescoAdminGhToken', LS_DRAFT = 'cescoAdminDraft';
var SHEETJS = { url: 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js', integrity: 'sha384-EnyY0/GSHQGSxSgMwaIPzSESbqoOLSexfnSMN2AP+39Ckmn92stwABZynq1JyzdT' };

var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); };
var clone = CO.clone, same = CO.same;
var nf = function(n){ return Number(n).toLocaleString('ko-KR'); };

var CATS = [['air', '공기'], ['water', '물'], ['life', '생활'], ['pest', '해충'], ['biz', '사업장'], ['service', '서비스']];
var CAT_KO = {}, KO_CAT = {};
CATS.forEach(function(c){ CAT_KO[c[0]] = c[1]; KO_CAT[c[1]] = c[0]; KO_CAT[c[0]] = c[0]; });
var DEFAULT_SECTION = { air: 'air.clean', water: 'water.drink', life: 'healing.clean', pest: 'healing.bug', biz: 'healing.clean', service: 'healing.hygiene' };
var secGroup = function(s){ return String(s || '').split('.')[0] === 'air' ? 'air' : String(s || '').split('.')[0] === 'water' ? 'water' : 'healing'; };
var catGroup = function(c){ return c === 'air' ? 'air' : c === 'water' ? 'water' : 'healing'; };

/* ───────────── 상태 ───────────── */
var BASE = clone(window.CESCO_PRODUCTS || []);
var BASE_IDS = {}; BASE.forEach(function(b){ BASE_IDS[b.id] = 1; });
var pubOv = CO.emptyOv();   // 현재 게시된(저장소) 오버라이드
var pubWork = [];            // pubOv 를 적용한 작업 목록(비교 기준)
var work = [];               // 편집 중인 목록. 임시 필드: hidden(bool), _del(bool)
var pubSha = null;
var usedDraft = false;

function normOv(ov){
  var o = CO.valid(ov) ? ov : CO.emptyOv();
  return { version: 1, updatedAt: o.updatedAt || null, patches: clone(o.patches || {}), added: clone(o.added || []), deleted: (o.deleted || []).slice(), hidden: (o.hidden || []).slice() };
}
function build(ov){
  ov = normOv(ov);
  var del = {}; ov.deleted.forEach(function(id){ del[id] = 1; });
  var hid = {}; ov.hidden.forEach(function(id){ hid[id] = 1; });
  var list = CO.apply(BASE, { version: 1, patches: ov.patches, added: ov.added, deleted: [], hidden: ov.hidden }, { keepHidden: true });
  var lm = {}; list.forEach(function(p){ lm[p.id] = p; });
  var out = [];
  BASE.forEach(function(b){
    if (del[b.id]) { var c = clone(b); c.hidden = !!hid[b.id]; c._del = true; out.push(c); }
    else if (lm[b.id]) { lm[b.id]._del = false; out.push(lm[b.id]); }
  });
  list.forEach(function(p){ if (!BASE_IDS[p.id]) { p._del = false; out.push(p); } });
  return out;
}
function strip(p){ var c = clone(p); delete c._del; return c; }
function toOv(list){ return CO.diff(BASE, list.filter(function(p){ return !p._del; }).map(strip)); }
function canon(ov){ var o = normOv(ov); o.updatedAt = null; o.deleted.sort(); o.hidden.sort(); o.added.sort(function(a, b){ return a.id < b.id ? -1 : 1; }); return o; }
function isDirty(){ return !same(canon(toOv(work)), canon(pubOv)); }
function rowKey(p){ var c = clone(p); c._del = !!c._del; c.hidden = !!c.hidden; return c; }

/* ───────────── 값 파서 (표/모달/CSV 공용) ───────────── */
function parsePrice(raw){
  if (typeof raw === 'number') { if (!isFinite(raw) || raw < 0 || Math.floor(raw) !== raw) return { err: '0 이상의 정수만 입력할 수 있어요' }; return { v: raw }; }
  var s = String(raw == null ? '' : raw).trim();
  if (s === '' || /^(상담|상담시안내|상담 시 안내|미정|-|—|없음|n\/a|null)$/i.test(s)) return { v: null };
  s = s.replace(/[,\s원₩]/g, '');
  if (!/^\d+(\.0+)?$/.test(s)) return { err: '숫자만 입력하세요 (예: 721000)' };
  return { v: parseInt(s, 10) };
}
function parseMonths(raw){
  var r = parsePrice(raw); if (r.err) return r;
  if (r.v != null && (r.v < 1 || r.v > 120)) return { err: '1~120 사이 개월 수' };
  return r;
}
function parseList(raw){ return { v: String(raw == null ? '' : raw).split(/\||\n/).map(function(x){ return x.trim(); }).filter(Boolean) }; }
function parseBool(raw){
  if (typeof raw === 'boolean') return { v: raw };
  var s = String(raw == null ? '' : raw).trim().toLowerCase();
  if (/^(y|yes|true|1|o|ㅇ|예|네|가능|있음|필요|숨김)$/.test(s)) return { v: true };
  if (/^(n|no|false|0|x|아니오|아니요|불가|불가능|없음|불필요)$/.test(s)) return { v: false };
  return { err: 'Y 또는 N 으로 입력하세요' };
}
function parseCat(raw){ var s = String(raw == null ? '' : raw).trim().toLowerCase(); var k = KO_CAT[s] || KO_CAT[String(raw).trim()]; return k ? { v: k } : { err: '알 수 없는 카테고리(공기·물·생활·해충·사업장·서비스)' }; }
function parseText(raw){ return { v: String(raw == null ? '' : raw).trim() }; }
var SUB_MONTH = { '2주': 0.46, '3주': 0.69, '4주': 0.92 };
/* ───────────── 렌탈 옵션 / 가격표(매트리스·서비스) 도우미 ───────────── */
var hasOpt = function(p){ return Array.isArray(p.rentalOptions) && p.rentalOptions.length > 0; };
var OPT_COLS = [ // key, 라벨, 종류(t: text|num|months), CSV 컬럼명
  ['variant', '타입', 't', '타입'], ['period', '의무사용기간(개월)', 'months', '의무사용기간(개월)'], ['visit', '방문주기', 't', '방문주기'],
  ['listPrice', '정상가', 'num', '정상가'], ['monthPrice', '이달의 판매가', 'num', '이달의 판매가'], ['onsiteSingle', '현장 할인가(단품)', 'num', '현장할인가(단품)'],
  ['onsiteBundle', '현장 할인가(결합)', 'num', '현장할인가(결합)'], ['promo', '프로모션', 'num', '프로모션'], ['rerental', '재렌탈가', 'num', '재렌탈가'],
  ['rerentalPromo', '재렌탈 프로모션', 'num', '재렌탈프로모션'], ['note', '비고', 't', '비고'], ['src', '표 행번호(참고)', 't', '표행번호(참고)']
];
function normOpt(o){
  var r = {};
  r.period = o.period == null || o.period === '' ? null : o.period;
  r.periodLabel = r.period == null ? '-' : r.period + '개월';
  r.visit = String(o.visit == null ? '' : o.visit).trim();
  r.variant = o.variant ? String(o.variant).trim() : null;
  ['listPrice', 'monthPrice', 'onsiteSingle', 'onsiteBundle', 'promo', 'rerental', 'rerentalPromo'].forEach(function(k){ r[k] = o[k] == null || o[k] === '' ? null : o[k]; });
  r.note = o.note == null ? '' : String(o.note).trim();
  r.src = o.src == null ? '' : String(o.src).trim();
  return r;
}
/* 옵션 배열 → 목록/렌탈 페이지가 쓰는 파생 필드(최저 이달의 판매가·방문주기·계약기간) 갱신. 사이트(js/core.js)와 같은 기준 */
function deriveRental(p){
  var o = p.rentalOptions || [], ps = o.filter(function(x){ return x.monthPrice != null; });
  var best = null; ps.forEach(function(x){ if (!best || x.monthPrice < best.monthPrice) best = x; });
  p.rentalMonthly = best ? best.monthPrice : null; p.rentalBase = best ? best.listPrice : null; p.rentalContractMonths = best ? best.period : null;
  var vs = [], yrs = [];
  o.forEach(function(x){ if (x.visit && vs.indexOf(x.visit) < 0) vs.push(x.visit); if (x.period && x.period % 12 === 0 && yrs.indexOf(String(x.period / 12)) < 0) yrs.push(String(x.period / 12)); });
  p.visitCycles = vs; p.rentalYears = yrs; p.rentalTotal = null;
  if (vs.length) p.careMethod = '세스코 방문 관리(렌탈) · 방문주기 ' + vs.join(' / ');
}
function deriveFrom(p){
  if (p.priceMatrix) { var all = []; p.priceMatrix.rows.forEach(function(r){ r.values.forEach(function(v){ if (v != null) all.push(v); }); }); p.priceFrom = Object.assign({}, p.priceFrom || {}, { price: all.length ? Math.min.apply(null, all) : null }); }
  if (p.servicePrices) {
    var b = p.servicePrices.rows.filter(function(r){ return r.kind === 'base' && r.offPeak != null; }), w = b.filter(function(r){ return r.g2 === '벽걸이'; })[0];
    var price = w ? w.offPeak : (b.length ? Math.min.apply(null, b.map(function(r){ return r.offPeak; })) : null);
    p.priceFrom = Object.assign({}, p.priceFrom || {}, { price: price });
  }
}
var hasTable = function(p){ return hasOpt(p) || !!p.priceMatrix || !!p.servicePrices; };
function cycleToMonths(c){ if (SUB_MONTH[c] != null) return SUB_MONTH[c]; var m = /^(\d+)개월$/.exec(c); return m ? +m[1] : null; }

/* 필드 정의: key, 표시 이름, 파서, CSV 컬럼, 비워도 되는지(비움=null 처리) */
var F = {
  buyPrice:             { label: '구매가격', parse: parsePrice, csv: '구매가격', emptyClears: true },
  rentalMonthly:        { label: '월 렌탈료', parse: parsePrice, csv: '월렌탈료', emptyClears: true },
  rentalContractMonths: { label: '계약기간(개월)', parse: parseMonths, csv: '계약기간(개월)', emptyClears: true },
  visitCycles:          { label: '관리주기', parse: parseList, csv: '관리주기' },
  filterInfo:           { label: '필터교체', parse: parseText, csv: '필터교체' },
  subscribable:         { label: '정기배송', parse: parseBool, csv: '정기배송' },
  consultRequired:      { label: '상담필요', parse: parseBool, csv: '상담필요' },
  hidden:               { label: '숨김', parse: parseBool, csv: '숨김' },
  image:                { label: '이미지URL', parse: parseText, csv: '이미지URL' },
  category:             { label: '카테고리', parse: parseCat, csv: '카테고리' }
};
var CSV_KEYS = ['category', 'buyPrice', 'rentalMonthly', 'rentalContractMonths', 'visitCycles', 'filterInfo', 'subscribable', 'consultRequired', 'hidden', 'image'];
function fmt(key, v){
  if (key === 'rentalOptions') return (v || []).length ? (v.length + '행 (최저 이달의 판매가 ' + (function(){ var m = v.filter(function(x){ return x.monthPrice != null; }).map(function(x){ return x.monthPrice; }); return m.length ? nf(Math.min.apply(null, m)) + '원' : '-'; })() + ')') : '(없음)';
  if (key === 'buyPrice' || key === 'rentalMonthly') return v == null ? '상담 시 안내' : nf(v) + '원';
  if (key === 'rentalContractMonths') return v == null ? '(미지정)' : v + '개월';
  if (key === 'visitCycles') return (v || []).length ? v.join(' | ') : '(없음)';
  if (key === 'subscribable') return v ? '가능' : '불가';
  if (key === 'consultRequired') return v ? '필요' : '불필요';
  if (key === 'hidden') return v ? '숨김' : '표시';
  if (key === 'category') return CAT_KO[v] || v;
  return v === '' || v == null ? '(비어 있음)' : String(v);
}

/* 값을 바꾸면서 연관 필드(총 렌탈금액·섹션·정기배송 기본값)를 함께 정리 */
function setField(p, key, v){
  p[key] = v;
  if (key === 'rentalMonthly' || key === 'rentalContractMonths') {
    p.rentalTotal = p.rentalMonthly != null ? p.rentalMonthly * (p.rentalContractMonths || 36) : null; // 사이트의 총 렌탈금액(참고) 표시용
  }
  if (key === 'category') {
    var first = (p.sections || [])[0];
    if (!first || secGroup(first) !== catGroup(v)) p.sections = [DEFAULT_SECTION[v] || 'healing.clean'];
  }
  if (key === 'subscribable' && v && !(p.subMonths || []).length) {
    p.subCycles = ['1개월']; p.subMonths = [1]; p.subRecommend = 1; // 사이트 정기배송 페이지가 동작하도록 최소 기본값(상세 편집에서 수정)
  }
}

/* ───────────── 토스트/배너 ───────────── */
var tt;
function toast(msg){ var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function(){ t.classList.remove('show'); }, 3200); }
function banner(msg, warn){ var b = $('#banner'); if (!msg) { b.hidden = true; return; } b.hidden = false; b.className = 'banner' + (warn ? ' warn' : ''); b.innerHTML = msg; }

/* ───────────── 로그인 ───────────── */
var fails = 0, lockUntil = 0;
function showView(){
  var inn = window.AdminAuth.isIn();
  $('#loginView').hidden = inn; $('#appView').hidden = !inn;
  if (inn) startApp(); else setTimeout(function(){ $('#loginId').focus(); }, 0);
}
$('#loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  var err = $('#loginErr'), btn = $('#loginBtn');
  if (Date.now() < lockUntil) { err.textContent = '잠시 후 다시 시도하세요.'; return; }
  btn.disabled = true; err.textContent = '';
  window.AdminAuth.verify($('#loginId').value, $('#loginPw').value).then(function(ok){
    if (ok) { window.AdminAuth.login(); $('#loginPw').value = ''; fails = 0; showView(); }
    else { fails++; err.textContent = 'ID 또는 비밀번호가 올바르지 않습니다.'; if (fails >= 5) { lockUntil = Date.now() + 15000; err.textContent += ' (15초 후 재시도)'; fails = 0; } }
  }).catch(function(ex){
    err.textContent = ex && ex.message === 'NOCRYPTO' ? '이 환경에서는 로그인할 수 없습니다. HTTPS 주소로 접속하세요.' : '로그인 처리 중 오류가 발생했습니다.';
  }).then(function(){ btn.disabled = false; });
});
$('#btnLogout').addEventListener('click', function(){ window.AdminAuth.logout(); location.reload(); });

/* ───────────── 시작: 게시본 + 임시저장 불러오기 ───────────── */
var started = false;
async function loadPublished(){
  try {
    var r = await fetch('../data/price-overrides.json?v=' + Date.now(), { cache: 'no-store' });
    if (r.ok) { var j = await r.json(); if (CO.valid(j)) return normOv(j); }
  } catch (e) {}
  return normOv(null);
}
async function startApp(){
  if (started) return; started = true;
  pubOv = await loadPublished();
  pubWork = build(pubOv);
  var draft = null;
  try { draft = JSON.parse(localStorage.getItem(LS_DRAFT) || 'null'); } catch (e) {}
  if (draft && CO.valid(draft.ov)) { work = build(draft.ov); usedDraft = true; banner('이 브라우저에 <b>임시저장된 수정본</b>을 불러왔습니다. 게시하기 전까지 사이트에는 반영되지 않습니다. <button class="btn ghost sm" id="btnDiscard" type="button">임시저장 폐기(게시본으로 되돌리기)</button>'); }
  else work = build(pubOv);
  initUi();
  renderAll();
  if (window.AdminInquiries) window.AdminInquiries.start();
}
document.addEventListener('click', function(e){
  if (e.target && e.target.id === 'btnDiscard') {
    if (!confirm('임시저장된 수정 내용을 모두 버리고 현재 게시본으로 되돌릴까요?')) return;
    localStorage.removeItem(LS_DRAFT); work = build(pubOv); usedDraft = false; banner(''); renderAll(); toast('게시본으로 되돌렸습니다.');
  }
});
function saveDraft(){
  try {
    if (!isDirty()) localStorage.removeItem(LS_DRAFT);
    else localStorage.setItem(LS_DRAFT, JSON.stringify({ savedAt: new Date().toISOString(), ov: toOv(work) }));
  } catch (e) { toast('임시저장 실패(저장 공간 부족?) — JSON 다운로드로 백업하세요.'); }
}

/* ───────────── 목록 렌더링 ───────────── */
var pubMap = function(){ var m = {}; pubWork.forEach(function(p){ m[p.id] = p; }); return m; };
function rowStatus(p, pm){
  var b = pm[p.id];
  if (!b) return 'new';
  if (!same(rowKey(p), rowKey(b))) return 'chg';
  return '';
}
function diffKeys(p, b){
  var out = [];
  Object.keys(p).forEach(function(k){ if (k === '_del') return; if (!same(p[k], b[k])) out.push(k); });
  return out;
}
var NUMCLS = { buyPrice: 1, rentalMonthly: 1 };
function inputHtml(p, key, cls, attrs){
  if (hasOpt(p) && (key === 'rentalMonthly' || key === 'rentalContractMonths' || key === 'visitCycles')) attrs = (attrs || '') + ' readonly title="렌탈 옵션표에서 자동 계산됩니다(최저 이달의 판매가 기준). 상세 → 옵션표에서 수정하세요."';
  var v = p[key], txt;
  if (key === 'visitCycles') txt = (v || []).join(' | ');
  else if (key === 'buyPrice' || key === 'rentalMonthly') txt = v == null ? '' : nf(v);
  else txt = v == null ? '' : v;
  var ph = key === 'buyPrice' || key === 'rentalMonthly' ? ' placeholder="상담 시 안내"' : key === 'rentalContractMonths' ? ' placeholder="-"' : key === 'image' ? ' placeholder="assets/products/…jpg 또는 https://…"' : '';
  var num = NUMCLS[key] || key === 'rentalContractMonths';
  return '<input type="text" data-f="' + key + '" value="' + esc(txt) + '"' + ph + (num ? ' inputmode="numeric" class="num ask"' : ' class="' + (cls || '') + '"') + (attrs || '') + (p._del ? ' disabled' : '') + ' aria-label="' + esc(F[key] ? F[key].label : key) + '">';
}
function rowHtml(p, pm){
  var st = rowStatus(p, pm), dis = p._del ? ' disabled' : '';
  var tags = (hasOpt(p) ? '<span class="tag">옵션 ' + p.rentalOptions.length + '행</span>' : p.priceMatrix ? '<span class="tag">가격 매트릭스</span>' : p.servicePrices ? '<span class="tag">서비스 가격표</span>' : '') + (p._del ? '<span class="tag del">삭제됨</span>' : '') + (st === 'new' ? '<span class="tag new">신규</span>' : st === 'chg' ? '<span class="tag chg">변경됨</span>' : '') + (p.hidden && !p._del ? '<span class="tag hid">숨김</span>' : '');
  var acts = p._del ? '<button class="btn ghost" data-a="restore" type="button">복원</button>'
    : '<button class="btn ghost" data-a="detail" type="button">' + (hasTable(p) ? '상세·옵션표' : '상세') + '</button>' + (st === 'chg' && pm[p.id] ? '<button class="btn ghost" data-a="revert" type="button">되돌리기</button>' : '') + '<button class="btn danger" data-a="del" type="button">삭제</button>';
  var catOpts = CATS.map(function(c){ return '<option value="' + c[0] + '"' + (p.category === c[0] ? ' selected' : '') + '>' + c[1] + '</option>'; }).join('');
  return '<tr data-id="' + esc(p.id) + '" class="' + (p._del ? 'is-del' : p.hidden ? 'is-hidden' : '') + '">' +
    '<td class="c-hide" data-label="숨김"><input type="checkbox" data-f="hidden"' + (p.hidden ? ' checked' : '') + dis + ' aria-label="사이트에서 숨김"></td>' +
    '<td class="c-img" data-label="이미지 URL" data-full>' + inputHtml(p, 'image') + '</td>' +
    '<td class="c-name" data-label="제품명" data-full><input type="text" data-f="name" value="' + esc(p.name) + '"' + dis + ' aria-label="제품명"><small class="muted" style="color:#8a94a6">' + esc(p.id) + (p.model ? ' · ' + esc(p.model) : '') + '</small></td>' +
    '<td class="c-cat" data-label="카테고리"><select data-f="category"' + dis + ' aria-label="카테고리">' + catOpts + '</select></td>' +
    '<td class="c-num" data-label="구매가격(원)">' + inputHtml(p, 'buyPrice') + '</td>' +
    '<td class="c-num" data-label="월 렌탈료(원)">' + inputHtml(p, 'rentalMonthly') + '</td>' +
    '<td class="c-sm" data-label="계약기간(개월)">' + inputHtml(p, 'rentalContractMonths') + '</td>' +
    '<td class="c-cyc" data-label="관리주기 ( | 로 구분)" data-full>' + inputHtml(p, 'visitCycles') + '</td>' +
    '<td class="c-filter" data-label="필터교체" data-full>' + inputHtml(p, 'filterInfo') + '</td>' +
    '<td class="c-chk" data-label="정기배송"><input type="checkbox" data-f="subscribable"' + (p.subscribable ? ' checked' : '') + dis + ' aria-label="정기배송 가능"></td>' +
    '<td class="c-chk" data-label="상담필요"><input type="checkbox" data-f="consultRequired"' + (p.consultRequired ? ' checked' : '') + dis + ' aria-label="상담 필요"></td>' +
    '<td class="c-act" data-label="상태 / 동작" data-full><div class="tags">' + tags + '</div><div class="act">' + acts + '</div></td></tr>';
}
function markChanged(tr, p, b){
  $$('[data-f]', tr).forEach(function(el){
    var k = el.dataset.f;
    var c = !b || !same(p[k], b[k]);
    if (k === 'hidden' || k === 'subscribable' || k === 'consultRequired') return;
    el.classList.toggle('chg', c);
  });
}
function filtered(){
  var q = $('#fSearch').value.trim().toLowerCase().replace(/\s+/g, ''), cat = $('#fCat').value, stt = $('#fStatus').value, sort = $('#fSort').value;
  var pm = pubMap();
  var list = work.map(function(p, i){ return { p: p, i: i }; }).filter(function(o){
    var p = o.p;
    if (cat !== 'all' && p.category !== cat) return false;
    if (q && (p.name + ' ' + p.id + ' ' + (p.model || '') + ' ' + (p.keywords || []).join(' ')).toLowerCase().replace(/\s+/g, '').indexOf(q) < 0) return false;
    if (stt === 'deleted') return p._del;
    if (p._del) return false;
    if (stt === 'noprice') return p.buyPrice == null && p.rentalMonthly == null && !(p.priceFrom && p.priceFrom.price != null);
    if (stt === 'rental') return p.rentalMonthly != null;
    if (stt === 'sub') return !!p.subscribable;
    if (stt === 'changed') return !!rowStatus(p, pm);
    if (stt === 'hidden') return !!p.hidden;
    return true;
  });
  var num = function(v){ return v == null ? Infinity : v; };
  if (sort === 'name') list.sort(function(a, b){ return a.p.name.localeCompare(b.p.name, 'ko'); });
  else if (sort === 'buyAsc') list.sort(function(a, b){ return num(a.p.buyPrice) - num(b.p.buyPrice) || a.i - b.i; });
  else if (sort === 'buyDesc') list.sort(function(a, b){ return (b.p.buyPrice == null ? -1 : b.p.buyPrice) - (a.p.buyPrice == null ? -1 : a.p.buyPrice) || a.i - b.i; });
  else if (sort === 'rentAsc') list.sort(function(a, b){ return num(a.p.rentalMonthly) - num(b.p.rentalMonthly) || a.i - b.i; });
  return list.map(function(o){ return o.p; });
}
function renderList(){
  var pm = pubMap(), list = filtered();
  $('#gridBody').innerHTML = list.map(function(p){ return rowHtml(p, pm); }).join('');
  $('#emptyMsg').hidden = list.length > 0;
  var live = work.filter(function(p){ return !p._del; }).length;
  $('#listCount').textContent = '표시 ' + list.length + '개 / 전체 ' + live + '개';
  $$('#gridBody tr').forEach(function(tr){ var p = work.find(function(x){ return x.id === tr.dataset.id; }); markChanged(tr, p, pm[p.id]); });
}
function renderStat(){
  var live = work.filter(function(p){ return !p._del; });
  var noPrice = live.filter(function(p){ return p.buyPrice == null && p.rentalMonthly == null && !(p.priceFrom && p.priceFrom.price != null); }).length;
  var ch = changeList().length;
  $('#topStat').innerHTML = '상품 <b>' + live.length + '</b>개 · 가격 미정 <b>' + noPrice + '</b>개 · ' + (ch ? '<span class="dirty">미게시 변경 ' + ch + '건</span>' : '게시본과 동일');
}
function changeList(){
  var pm = pubMap(), out = [], seen = {};
  work.forEach(function(p){
    seen[p.id] = 1;
    var b = pm[p.id];
    if (!b) { if (!p._del) out.push({ name: p.name, kind: '추가', fields: [] }); return; }
    if (!!b._del !== !!p._del) { out.push({ name: p.name, kind: p._del ? '삭제' : '복원', fields: [] }); return; }
    if (p._del) return;
    var ks = diffKeys(p, b);
    if (ks.length) out.push({ name: p.name, kind: '수정', fields: ks });
  });
  pubWork.forEach(function(b){ if (!seen[b.id] && !b._del) out.push({ name: b.name, kind: '삭제', fields: [] }); });
  return out;
}
function renderAll(){ renderList(); renderStat(); renderPublishSummary(); }

/* ───────────── 표 편집 이벤트 ───────────── */
function findP(id){ return work.find(function(p){ return p.id === id; }); }
$('#gridBody').addEventListener('change', function(e){
  var el = e.target, k = el.dataset.f; if (!k) return;
  var tr = el.closest('tr'), p = findP(tr.dataset.id); if (!p) return;
  var raw = el.type === 'checkbox' ? el.checked : el.value, v;
  if (k === 'name') { v = String(raw).trim(); if (!v) { el.classList.add('bad'); toast('제품명은 비울 수 없어요.'); return; } }
  else if (el.type === 'checkbox') v = raw;
  else { var r = F[k].parse(raw); if (r.err) { el.classList.add('bad'); toast(F[k].label + ': ' + r.err); return; } v = r.v; }
  el.classList.remove('bad');
  if (!same(p[k], v)) setField(p, k, v);
  // 표시값 정리 + 상태 갱신 (포커스를 잃지 않도록 행 전체를 다시 그리지 않음)
  if (el.type !== 'checkbox') {
    if (k === 'buyPrice' || k === 'rentalMonthly') el.value = v == null ? '' : nf(v);
    else if (k === 'visitCycles') el.value = v.join(' | ');
    else el.value = v == null ? '' : v;
  }
  var pm = pubMap(), b = pm[p.id];
  markChanged(tr, p, b);
  tr.classList.toggle('is-hidden', !!p.hidden);
  var st = rowStatus(p, pm);
  tr.querySelector('.tags').innerHTML = (hasOpt(p) ? '<span class="tag">옵션 ' + p.rentalOptions.length + '행</span>' : p.priceMatrix ? '<span class="tag">가격 매트릭스</span>' : p.servicePrices ? '<span class="tag">서비스 가격표</span>' : '') + (st === 'new' ? '<span class="tag new">신규</span>' : st === 'chg' ? '<span class="tag chg">변경됨</span>' : '') + (p.hidden ? '<span class="tag hid">숨김</span>' : '');
  var act = tr.querySelector('.act'), hasRev = !!act.querySelector('[data-a=revert]');
  if (st === 'chg' && b && !hasRev) act.insertAdjacentHTML('afterbegin', '<button class="btn ghost" data-a="revert" type="button">되돌리기</button>');
  if ((st !== 'chg' || !b) && hasRev) act.querySelector('[data-a=revert]').remove();
  saveDraft(); renderStat(); renderPublishSummary();
});
$('#gridBody').addEventListener('click', function(e){
  var btn = e.target.closest('[data-a]'); if (!btn) return;
  var tr = btn.closest('tr'), p = findP(tr.dataset.id), a = btn.dataset.a;
  if (a === 'detail') openModal(p);
  else if (a === 'revert') { var b = pubMap()[p.id]; if (b) { work[work.indexOf(p)] = clone(b); saveDraft(); renderAll(); toast('게시본 값으로 되돌렸습니다.'); } }
  else if (a === 'del') {
    if (!confirm('"' + p.name + '" 을(를) 삭제할까요?\n게시하면 사이트에서 사라집니다. (사이트에서 잠시 숨기려면 "숨김"을 사용하세요)')) return;
    if (BASE_IDS[p.id]) p._del = true; else work.splice(work.indexOf(p), 1);
    saveDraft(); renderAll(); toast('삭제했습니다. 상태 필터 "삭제됨"에서 복원할 수 있어요.');
  }
  else if (a === 'restore') { p._del = false; saveDraft(); renderAll(); toast('복원했습니다.'); }
});
['fSearch', 'fCat', 'fStatus', 'fSort'].forEach(function(id){ $('#' + id).addEventListener(id === 'fSearch' ? 'input' : 'change', renderList); });
$('#btnRevertAll').addEventListener('click', function(){
  if (!isDirty() && !localStorage.getItem(LS_DRAFT)) { toast('되돌릴 변경이 없어요.'); return; }
  if (!confirm('수정 중인 내용을 모두 버리고 현재 게시본으로 되돌릴까요?')) return;
  localStorage.removeItem(LS_DRAFT); work = build(pubOv); banner(''); renderAll(); toast('전체를 게시본으로 되돌렸습니다.');
});

/* ───────────── 상세 편집 / 상품 추가 모달 ───────────── */
var MF = [
  ['name', '제품명', 'text', true], ['category', '카테고리', 'cat'], ['type', '유형', 'select:product=제품,service=서비스'],
  ['image', '이미지 URL (assets/… 상대경로 또는 https://…)', 'text', true], ['model', '모델명', 'text'], ['buyUrl', '구매하기 링크 URL', 'text'],
  ['description', '한 줄 설명', 'area', true],
  ['buyPrice', '구매가격(원) — 비우면 상담 시 안내', 'price'], ['listPrice', '정가(원)', 'price'], ['nonMemberPrice', '비회원가(원)', 'price'], ['buyNote', '구매가 안내 문구', 'text'],
  ['rentalMonthly', '월 렌탈료(원) — 비우면 상담 시 안내', 'price'], ['rentalContractMonths', '계약기간(개월)', 'months'], ['rentalTotal', '총 렌탈금액(원, 자동 계산 — 직접 입력도 가능)', 'price'], ['rentalNote', '렌탈 안내 문구', 'text', true],
  ['visitCycles', '관리주기 ( | 로 구분)', 'list', true], ['careMethod', '관리방식', 'text', true], ['filterInfo', '필터교체 안내', 'area', true],
  ['subCycles', '정기배송 주기 ( | 로 구분, 예: 2주|1개월|2개월)', 'list', true],
  ['flags', '옵션', 'flags', true]
];
var FLAGS = [['subscribable', '정기배송 가능'], ['consultRequired', '"상담하기" 버튼 표시'], ['rentalInquire', '렌탈 가능 여부 상담 문의'], ['soldOut', '품절(구매 버튼 숨김)'], ['hidden', '사이트에서 숨김']];
var modalCtx = null;
function openModal(p, isNew){
  modalCtx = { p: p, orig: clone(p), isNew: !!isNew };
  $('#mTitle').textContent = isNew ? '상품 추가' : '상세 편집 — ' + p.name;
  var html = '<div class="mgrid">' + MF.map(function(f){
    var k = f[0], label = f[1], t = f[2], full = f[3] ? ' full' : '', v = p[k], inner;
    if (t === 'flags') inner = '<div class="checks">' + FLAGS.map(function(g){ return '<label><input type="checkbox" data-m="' + g[0] + '"' + (p[g[0]] ? ' checked' : '') + '> ' + g[1] + '</label>'; }).join('') + '</div>';
    else if (t === 'cat') inner = '<select data-m="category">' + CATS.map(function(c){ return '<option value="' + c[0] + '"' + (p.category === c[0] ? ' selected' : '') + '>' + c[1] + ' (' + c[0] + ')</option>'; }).join('') + '</select>';
    else if (t.indexOf('select:') === 0) inner = '<select data-m="' + k + '">' + t.slice(7).split(',').map(function(o){ var kv = o.split('='); return '<option value="' + kv[0] + '"' + (p[k] === kv[0] ? ' selected' : '') + '>' + kv[1] + '</option>'; }).join('') + '</select>';
    else if (t === 'area') inner = '<textarea data-m="' + k + '">' + esc(v || '') + '</textarea>';
    else {
      var txt = t === 'list' ? (v || []).join(' | ') : v == null ? '' : v;
      var ro = hasOpt(p) && (k === 'rentalMonthly' || k === 'rentalContractMonths' || k === 'rentalTotal' || k === 'visitCycles');
      inner = '<input type="text" data-m="' + k + '" value="' + esc(txt) + '"' + (t === 'price' || t === 'months' ? ' inputmode="numeric"' : '') + (ro ? ' readonly title="렌탈 옵션표에서 자동 계산됩니다"' : '') + '>';
    }
    return '<label class="fld' + full + '">' + esc(label) + inner + '</label>';
  }).join('') + '</div>' +
  '<div id="tblEd"></div>' +
  '<div class="fld" style="margin-top:10px">이미지 미리보기<img id="mImgPrev" alt="" style="max-height:120px;max-width:100%;object-fit:contain;border:1px solid #e3e8f0;border-radius:8px;padding:4px;background:#fff;justify-self:start"></div>' +
  '<div class="login-err" id="mErr" role="alert"></div>' +
  '<div class="mfoot"><button type="button" class="btn ghost" data-close>취소</button><button type="submit" class="btn primary">' + (isNew ? '추가' : '적용') + '</button></div>';
  $('#mForm').innerHTML = html;
  modalCtx.tbl = { opts: clone(p.rentalOptions || []), matrix: p.priceMatrix ? clone(p.priceMatrix) : null, svc: p.servicePrices ? clone(p.servicePrices) : null, dirty: false };
  renderTblEd();
  updImgPrev();
  $('#modal').hidden = false; document.body.style.overflow = 'hidden';
  setTimeout(function(){ var f = $('#mForm [data-m=name]'); if (f) f.focus(); }, 0);
}
/* ── 표 편집기(렌탈 옵션 배열 · 매트리스 가격표 · 서비스 가격표) ── */
var nfv = function(v){ return v == null ? '' : nf(v); };
function renderTblEd(){
  var box = $('#tblEd'); if (!box || !modalCtx) return;
  var T = modalCtx.tbl, h = '';
  h += '<div class="tbled"><h3>렌탈 옵션표 <small>(의무사용기간 × 방문주기별 · 모든 금액은 월 렌탈료 원, 비우면 “-”)</small></h3>';
  h += '<div class="tbl-scroll"><table class="grid tbl-in"><thead><tr>' + OPT_COLS.slice(0, 11).map(function(c){ return '<th>' + esc(c[1]) + '</th>'; }).join('') + '<th></th></tr></thead><tbody>';
  T.opts.forEach(function(o, i){
    h += '<tr data-i="' + i + '">' + OPT_COLS.slice(0, 11).map(function(c){
      var k = c[0], v = o[k], txt = c[2] === 'num' ? nfv(v) : (v == null ? '' : v);
      return '<td><input type="text" data-oi="' + i + '" data-ok="' + k + '" value="' + esc(txt) + '"' + (c[2] !== 't' ? ' inputmode="numeric" class="num"' : (k === 'note' ? ' class="wide"' : '')) + ' aria-label="' + esc(c[1]) + '"></td>';
    }).join('') + '<td><button type="button" class="btn danger sm" data-oa="del" data-oi="' + i + '" aria-label="행 삭제">삭제</button></td></tr>';
  });
  h += '</tbody></table></div><div class="row-btn" style="margin:8px 0"><button type="button" class="btn ghost sm" data-oa="add">＋ 옵션 행 추가</button><span class="note-sm" style="margin:0">적용하면 상품의 “월 렌탈료·계약기간·방문주기”는 옵션표(최저 이달의 판매가)에서 자동 계산됩니다. 행이 0개면 기존 단일 렌탈료 방식으로 돌아갑니다.</span></div>';
  if (T.matrix) {
    var m = T.matrix;
    h += '<h3>' + esc(m.title) + ' <small>(' + esc(m.rowHeader) + ' · 원)</small></h3><div class="tbl-scroll"><table class="grid tbl-in"><thead><tr><th>' + esc(m.rowHeader) + '</th>' + m.cols.map(function(c){ return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      m.rows.map(function(r, ri){ return '<tr><th>' + esc(r.label) + '</th>' + r.values.map(function(v, ci){ return '<td><input type="text" class="num" inputmode="numeric" data-mx="' + ri + ',' + ci + '" value="' + esc(nfv(v)) + '" aria-label="' + esc(r.label + ' ' + m.cols[ci]) + '"></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  if (T.svc) {
    var s = T.svc;
    h += '<h3>' + esc(s.title) + ' <small>(원 · 비우면 “-”)</small></h3><div class="tbl-scroll"><table class="grid tbl-in"><thead><tr><th>구분 1</th><th>구분 2</th><th>구분 3</th><th>세부</th><th>' + esc(s.colOffPeak) + '</th><th>' + esc(s.colQ4) + '</th></tr></thead><tbody>' +
      s.rows.map(function(r, ri){ return '<tr><td>' + esc(r.g1) + '</td><td>' + esc(r.g2) + '</td><td>' + esc(r.g3) + '</td><td>' + esc(r.detail) + '</td>' +
        '<td><input type="text" class="num" inputmode="numeric" data-sv="' + ri + ',offPeak" value="' + esc(nfv(r.offPeak)) + '" aria-label="비수기 판매가"></td><td><input type="text" class="num" inputmode="numeric" data-sv="' + ri + ',q4Special" value="' + esc(nfv(r.q4Special)) + '" aria-label="4분기 특판가"></td></tr>'; }).join('') + '</tbody></table></div>';
  }
  var jsonSrc = { rentalOptions: T.opts }; if (T.matrix) jsonSrc.priceMatrix = T.matrix; if (T.svc) jsonSrc.servicePrices = T.svc;
  h += '<details style="margin-top:10px"><summary>고급: 표 데이터 JSON 직접 편집</summary><textarea id="tblJson" spellcheck="false" style="width:100%;min-height:160px;font-family:monospace;font-size:12px;margin-top:6px">' + esc(JSON.stringify(jsonSrc, null, 1)) + '</textarea>' +
    '<div class="row-btn" style="margin-top:6px"><button type="button" class="btn ghost sm" data-oa="json">JSON → 위 표에 반영</button></div></details></div>';
  box.innerHTML = h;
}
function parseOptField(c, raw){
  var s = String(raw == null ? '' : raw).trim();
  if (c[2] === 'num') { if (s === '' || s === '-') return { v: null }; var r = parsePrice(s); return r; }
  if (c[2] === 'months') { if (s === '' || s === '-') return { v: null }; var r2 = parseMonths(s); return r2; }
  return { v: s };
}
document.addEventListener('change', function(e){
  var el = e.target, T = modalCtx && modalCtx.tbl; if (!T || !el.dataset) return;
  if (el.dataset.ok != null) {
    var i = +el.dataset.oi, c = OPT_COLS.filter(function(x){ return x[0] === el.dataset.ok; })[0], r = parseOptField(c, el.value);
    if (r.err) { el.classList.add('bad'); toast(c[1] + ': ' + r.err); return; }
    el.classList.remove('bad'); T.opts[i][el.dataset.ok] = r.v === '' && c[2] === 't' && c[0] !== 'visit' && c[0] !== 'note' && c[0] !== 'src' ? null : r.v;
    if (el.dataset.ok === 'period') T.opts[i].periodLabel = r.v == null ? '-' : r.v + '개월';
    if (c[2] === 'num') el.value = nfv(r.v);
    T.dirty = true;
  } else if (el.dataset.mx != null) {
    var p2 = el.dataset.mx.split(','), r3 = parsePrice(el.value);
    if (r3.err) { el.classList.add('bad'); toast(r3.err); return; }
    el.classList.remove('bad'); T.matrix.rows[+p2[0]].values[+p2[1]] = r3.v; el.value = nfv(r3.v); T.dirty = true;
  } else if (el.dataset.sv != null) {
    var p3 = el.dataset.sv.split(','), r4 = parsePrice(el.value);
    if (r4.err) { el.classList.add('bad'); toast(r4.err); return; }
    el.classList.remove('bad'); T.svc.rows[+p3[0]][p3[1]] = r4.v; el.value = nfv(r4.v); T.dirty = true;
  }
});
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-oa]'); if (!b || !modalCtx || !modalCtx.tbl) return;
  var T = modalCtx.tbl, a = b.dataset.oa;
  if (a === 'add') { var last = T.opts[T.opts.length - 1]; T.opts.push(normOpt(last ? { period: last.period, visit: last.visit, variant: last.variant } : { period: 36, visit: '' })); T.dirty = true; renderTblEd(); }
  else if (a === 'del') { T.opts.splice(+b.dataset.oi, 1); T.dirty = true; renderTblEd(); }
  else if (a === 'json') {
    try {
      var j = JSON.parse($('#tblJson').value);
      if (!j || typeof j !== 'object' || !Array.isArray(j.rentalOptions)) throw new Error('rentalOptions 배열이 필요합니다');
      T.opts = j.rentalOptions.map(normOpt);
      if (T.matrix && j.priceMatrix) T.matrix = j.priceMatrix;
      if (T.svc && j.servicePrices) T.svc = j.servicePrices;
      T.dirty = true; renderTblEd(); toast('JSON을 표에 반영했습니다. “적용”을 눌러야 저장됩니다.');
    } catch (ex) { toast('JSON 오류: ' + ex.message); }
  }
});
function validateTbl(T){
  for (var i = 0; i < T.opts.length; i++) {
    var o = T.opts[i];
    if (!o.visit) return (i + 1) + '번째 옵션 행: 방문주기를 입력하세요.';
    var any = ['listPrice', 'monthPrice', 'onsiteSingle', 'onsiteBundle', 'promo', 'rerental', 'rerentalPromo'].some(function(k){ return o[k] != null; });
    if (!any) return (i + 1) + '번째 옵션 행: 가격이 하나도 없습니다.';
  }
  return '';
}
function imgSrc(v){ v = String(v || '').trim(); if (!v) return ''; return /^(https?:)?\/\//i.test(v) || v.charAt(0) === '/' ? v : '../' + v; }
function updImgPrev(){ var i = $('#mImgPrev'), inp = $('#mForm [data-m=image]'); if (!i || !inp) return; var s = imgSrc(inp.value); if (s) { i.src = s; i.style.display = ''; } else i.style.display = 'none'; }
$('#mForm').addEventListener('input', function(e){ if (e.target.dataset.m === 'image') updImgPrev(); });
function closeModal(){ $('#modal').hidden = true; document.body.style.overflow = ''; modalCtx = null; }
$('#modal').addEventListener('click', function(e){ if (e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });
$('#mForm').addEventListener('submit', function(e){
  e.preventDefault();
  var ctx = modalCtx; if (!ctx) return;
  var p = ctx.p, orig = ctx.orig, vals = {}, err = '';
  MF.forEach(function(f){
    var k = f[0], t = f[2];
    if (t === 'flags') { FLAGS.forEach(function(g){ vals[g[0]] = $('[data-m=' + g[0] + ']', $('#mForm')).checked; }); return; }
    var el = $('[data-m=' + k + ']', $('#mForm')), raw = el.value, r;
    if (t === 'price') r = parsePrice(raw); else if (t === 'months') r = parseMonths(raw); else if (t === 'list') r = parseList(raw);
    else r = { v: String(raw).trim() };
    if (r.err) { err = f[1].split(' —')[0] + ': ' + r.err; return; }
    vals[k] = r.v;
  });
  if (!err && modalCtx.tbl) err = validateTbl(modalCtx.tbl);
  if (!err && !vals.name) err = '제품명을 입력하세요.';
  if (!err) vals.subCycles.forEach(function(c){ if (cycleToMonths(c) == null) err = '정기배송 주기는 "2주", "1개월" 같은 형식으로 입력하세요: ' + c; });
  if (err) { $('#mErr').textContent = err; return; }
  var target = ctx.isNew ? p : p;
  var order = ['name', 'category', 'type', 'image', 'model', 'buyUrl', 'description', 'buyPrice', 'listPrice', 'nonMemberPrice', 'buyNote', 'rentalMonthly', 'rentalContractMonths', 'rentalTotal', 'rentalNote', 'visitCycles', 'careMethod', 'filterInfo', 'subCycles', 'subscribable', 'consultRequired', 'rentalInquire', 'soldOut', 'hidden'];
  order.forEach(function(k){
    var v = vals[k];
    if (v === '' && (k === 'model' || k === 'rentalNote')) v = null;
    if (k === 'subCycles') { // 주기 목록이 바뀐 경우에만 months/recommend 갱신
      if (!same(v, orig.subCycles || [])) {
        target.subCycles = v; target.subMonths = v.map(cycleToMonths);
        if (target.subMonths.indexOf(target.subRecommend) < 0) target.subRecommend = target.subMonths.length ? (target.subMonths.indexOf(2) >= 0 ? 2 : target.subMonths[0]) : null;
      }
      return;
    }
    if (ctx.isNew || !same(v, orig[k])) { if (k === 'subscribable' && !v) target[k] = v; else setField(target, k, v); }
  });
  if (ctx.tbl && ctx.tbl.dirty) {
    var T = ctx.tbl;
    target.rentalOptions = T.opts.map(normOpt);
    if (!target.rentalOptions.length) delete target.rentalOptions;
    if (T.matrix) target.priceMatrix = T.matrix;
    if (T.svc) target.servicePrices = T.svc;
  }
  if (hasOpt(target)) deriveRental(target);
  deriveFrom(target);
  if (ctx.isNew) {
    target.rentalYears = target.rentalYears || [];
    if (target.rentalMonthly != null && target.rentalTotal == null) target.rentalTotal = target.rentalMonthly * (target.rentalContractMonths || 36);
    work.push(target);
  }
  saveDraft(); closeModal(); renderAll(); toast(ctx.isNew ? '상품을 추가했습니다. (게시하면 사이트에 표시됩니다)' : '적용했습니다.');
});
$('#btnAdd').addEventListener('click', function(){
  var id = 'custom-' + Date.now().toString(36);
  var today = new Date().toISOString().slice(0, 10);
  var p = { id: id, code: id, name: '', category: 'life', sections: ['healing.clean'], description: '', features: [], spaces: '', spaceKeys: [], targets: [], concerns: [], places: [], env: [], keywords: [],
    type: 'product', audience: 'both', bizFit: false, rentalInquire: false, bizOnlyRental: false, image: '', model: null, buyPrice: null, listPrice: null, buyOptions: [], buyLabel: '구매하기',
    nonMemberPrice: null, buyNote: '', buyUrl: '', rentalMonthly: null, rentalBase: null, rentalContractMonths: null, rentalYears: [], rentalTotal: null, visitCycles: [], rentalNote: null,
    careMethod: '상담 시 안내', filterInfo: '상담 시 안내', subscribable: false, subCycles: [], subMonths: [], subRecommend: null, consultRequired: true, popularity: null, soldOut: false,
    source: { name: '직접 등록', url: '', checkedAt: today }, hidden: false, _del: false };
  openModal(p, true);
});

/* ───────────── 탭 ───────────── */
function setTab(name){
  $$('.tab').forEach(function(t){ var on = t.dataset.tab === name; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
  ['products', 'upload', 'publish', 'inquiries'].forEach(function(n){ $('#tab-' + n).hidden = n !== name; });
  if (name === 'publish') renderPublishSummary();
  if (name === 'inquiries' && window.AdminInquiries) window.AdminInquiries.show();
  window.scrollTo({ top: 0 });
}
$$('.tab').forEach(function(t){ t.addEventListener('click', function(){ setTab(t.dataset.tab); }); });
$('#btnGoPublish').addEventListener('click', function(){ setTab('publish'); });

/* ───────────── CSV 템플릿 / 다운로드 ───────────── */
function csvCell(v){ v = v == null ? '' : String(v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function csvVal(p, k){
  var v = p[k];
  if (k === 'category') return CAT_KO[v] || v;
  if (k === 'visitCycles') return (v || []).join('|');
  if (k === 'subscribable' || k === 'consultRequired' || k === 'hidden') return v ? 'Y' : 'N';
  return v == null ? '' : v;
}
function buildCsv(){
  var head = ['제품ID', '제품명'].concat(CSV_KEYS.map(function(k){ return F[k].csv; }));
  var rows = [head].concat(work.filter(function(p){ return !p._del; }).map(function(p){ return [p.id, p.name].concat(CSV_KEYS.map(function(k){ return csvVal(p, k); })); }));
  return '\uFEFF' + rows.map(function(r){ return r.map(csvCell).join(','); }).join('\r\n') + '\r\n';
}
var OPT_CSV_COLS = OPT_COLS.slice();
function buildOptCsv(){
  var head = ['제품ID', '제품명', '옵션순번'].concat(OPT_CSV_COLS.map(function(c){ return c[3]; }));
  var rows = [head];
  work.filter(function(p){ return !p._del && hasOpt(p); }).forEach(function(p){
    p.rentalOptions.forEach(function(o, i){ rows.push([p.id, p.name, i + 1].concat(OPT_CSV_COLS.map(function(c){ var v = o[c[0]]; return v == null ? '' : v; }))); });
  });
  return '\uFEFF' + rows.map(function(r){ return r.map(csvCell).join(','); }).join('\r\n') + '\r\n';
}
function download(name, text, mime){
  var a = document.createElement('a'), url = URL.createObjectURL(new Blob([text], { type: mime }));
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
}
$('#btnOptCsv').addEventListener('click', function(){ download('cesco-rental-options-' + new Date().toISOString().slice(0, 10) + '.csv', buildOptCsv(), 'text/csv;charset=utf-8'); toast('렌탈 옵션 CSV를 내려받았습니다.'); });
$('#btnTemplate').addEventListener('click', function(){ download('cesco-products-' + new Date().toISOString().slice(0, 10) + '.csv', buildCsv(), 'text/csv;charset=utf-8'); toast('CSV 템플릿을 내려받았습니다.'); });
function currentOvJson(){ var ov = toOv(work); ov.updatedAt = new Date().toISOString(); return JSON.stringify(ov, null, 2) + '\n'; }
function dlJson(){ download('price-overrides.json', currentOvJson(), 'application/json'); toast('price-overrides.json 을 내려받았습니다. 저장소 data 폴더에 덮어쓰면 반영됩니다.'); }
$('#btnDlJson').addEventListener('click', dlJson); $('#btnDlJson2').addEventListener('click', dlJson);

/* ───────────── CSV / xlsx 파싱 ───────────── */
function parseCsvText(text){
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  var first = text.split(/\r?\n/, 1)[0] || '';
  var cnt = function(ch){ return first.split(ch).length - 1; };
  var delim = cnt('\t') > cnt(',') && cnt('\t') >= cnt(';') ? '\t' : cnt(';') > cnt(',') ? ';' : ',';
  var rows = [], row = [], cur = '', q = false;
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === delim) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
function decodeBytes(buf){
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch (e) { try { return new TextDecoder('euc-kr').decode(buf); } catch (e2) { return new TextDecoder('utf-8').decode(buf); } }
}
function loadSheetJS(){
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise(function(res, rej){
    var s = document.createElement('script');
    s.src = SHEETJS.url; s.integrity = SHEETJS.integrity; s.crossOrigin = 'anonymous';
    s.onload = function(){ window.XLSX ? res(window.XLSX) : rej(new Error('XLSX')); };
    s.onerror = function(){ rej(new Error('SheetJS CDN 불러오기 실패 (인터넷 연결 확인, 또는 엑셀에서 CSV로 저장해 올려주세요)')); };
    document.head.appendChild(s);
  });
}
var normHead = function(s){ return String(s == null ? '' : s).replace(/^\uFEFF/, '').replace(/[\s_\-()\[\]]/g, '').toLowerCase(); };
var ALIASES = {
  id: ['제품id', '상품id', 'id', 'productid', '상품코드', 'code'],
  name: ['제품명', '상품명', 'name', '이름'],
  buyPrice: ['구매가격', '구매가', '가격', '판매가', 'buyprice'],
  rentalMonthly: ['월렌탈료', '월렌탈', '렌탈료', '월렌탈금액', 'rentalmonthly'],
  rentalContractMonths: ['계약기간개월', '계약기간', '약정개월', 'rentalcontractmonths'],
  visitCycles: ['관리주기', '방문주기', 'visitcycles'],
  filterInfo: ['필터교체', '필터교체주기', 'filterinfo'],
  subscribable: ['정기배송', '정기배송가능', 'subscribable'],
  consultRequired: ['상담필요', '상담', 'consultrequired'],
  hidden: ['숨김', 'hidden'],
  image: ['이미지url', '이미지', 'image'],
  category: ['카테고리', '분류', 'category']
};
function mapHeaders(head){
  var idx = {};
  head.forEach(function(h, i){
    var n = normHead(h);
    Object.keys(ALIASES).forEach(function(k){ if (idx[k] == null && ALIASES[k].indexOf(n) >= 0) idx[k] = i; });
  });
  return idx;
}
var normName = function(s){ return String(s == null ? '' : s).replace(/\s+/g, '').toLowerCase(); };

/* 업로드 행 → 변경 사항 계산(미리보기용). work 를 수정하지 않음 */
function planOptUpload(rows){
  var res = { total: 0, matched: 0, changes: [], unchanged: 0, unmatched: [], errors: [], warns: [], cols: ['렌탈 옵션(행 단위)'], optMode: true };
  var h = rows[0].map(normHead), col = {};
  OPT_CSV_COLS.forEach(function(c){ var i = h.indexOf(normHead(c[3])); if (i < 0) i = h.indexOf(normHead(c[1])); if (i >= 0) col[c[0]] = i; });
  var idI = h.indexOf('제품id'); if (idI < 0) { res.errors.push('렌탈 옵션 CSV에는 "제품ID" 컬럼이 필요합니다.'); return res; }
  var byId = {}; work.forEach(function(p){ byId[p.id] = p; });
  var per = {}, order = [];
  for (var r = 1; r < rows.length; r++) {
    var row = rows[r], line = r + 1;
    if (!row || row.every(function(c){ return String(c == null ? '' : c).trim() === ''; })) continue;
    res.total++;
    var id = String(row[idI] == null ? '' : row[idI]).trim(), p = byId[id];
    if (!p || p._del) { res.unmatched.push(line + '행: ' + id); continue; }
    var o = {}, bad = false;
    OPT_CSV_COLS.forEach(function(c){
      if (col[c[0]] == null) { o[c[0]] = null; return; }
      var pr = parseOptField(c, row[col[c[0]]]);
      if (pr.err) { res.errors.push(line + '행 [' + p.name + '] ' + c[1] + ': ' + pr.err); bad = true; return; }
      o[c[0]] = pr.v;
    });
    if (bad) continue;
    if (!String(o.visit || '').trim()) { res.errors.push(line + '행 [' + p.name + ']: 방문주기가 비어 있습니다.'); continue; }
    if (!per[id]) { per[id] = []; order.push(id); }
    per[id].push(normOpt(o));
  }
  order.forEach(function(id){
    var p = byId[id], next = per[id];
    res.matched++;
    if (same(p.rentalOptions || [], next)) { res.unchanged++; return; }
    res.changes.push({ p: p, ch: [{ key: 'rentalOptions', before: p.rentalOptions || [], after: next }] });
  });
  res.warns.push('옵션 CSV는 파일에 포함된 제품의 옵션 배열을 통째로 교체합니다(파일에 없는 제품은 변경 없음).');
  return res;
}
function planUpload(rows){
  var res = { total: 0, matched: 0, changes: [], unchanged: 0, unmatched: [], errors: [], warns: [], cols: [] };
  if (!rows.length) { res.errors.push('빈 파일입니다.'); return res; }
  if (rows[0].map(normHead).indexOf('옵션순번') >= 0) return planOptUpload(rows);
  var idx = mapHeaders(rows[0]);
  if (idx.id == null && idx.name == null) { res.errors.push('첫 줄에 "제품ID" 또는 "제품명" 컬럼이 필요합니다. (템플릿을 내려받아 사용하세요)'); return res; }
  var keys = Object.keys(F).filter(function(k){ return idx[k] != null; });
  res.cols = keys.map(function(k){ return F[k].csv; });
  if (!keys.length) { res.errors.push('수정할 컬럼(구매가격, 월렌탈료 등)이 없습니다.'); return res; }
  var byId = {}, byName = {};
  work.forEach(function(p){ byId[p.id] = p; var n = normName(p.name); (byName[n] = byName[n] || []).push(p); });
  var per = {}, order = [];
  for (var r = 1; r < rows.length; r++) {
    var row = rows[r], line = r + 1;
    if (!row || row.every(function(c){ return String(c == null ? '' : c).trim() === ''; })) continue;
    res.total++;
    var rid = idx.id != null ? String(row[idx.id] == null ? '' : row[idx.id]).trim() : '';
    var rname = idx.name != null ? String(row[idx.name] == null ? '' : row[idx.name]).trim() : '';
    var p = rid && byId[rid] ? byId[rid] : null;
    if (!p && rname) { var cand = byName[normName(rname)] || []; if (cand.length === 1) p = cand[0]; else if (cand.length > 1) { res.errors.push(line + '행: 같은 이름의 제품이 ' + cand.length + '개라 제품ID가 필요합니다 — ' + rname); continue; } }
    if (!p) { res.unmatched.push(line + '행: ' + (rid || rname || '(식별값 없음)') + (rid && rname ? ' / ' + rname : '')); continue; }
    if (p._del) { res.warns.push(line + '행: 삭제된 제품이라 건너뜀 — ' + p.name); continue; }
    if (per[p.id]) res.warns.push(line + '행: ' + p.name + ' 이(가) 파일에 중복되어 마지막 줄 값을 사용합니다.');
    if (!per[p.id]) { per[p.id] = { p: p, vals: {} }; order.push(p.id); }
    keys.forEach(function(k){
      if (hasOpt(p) && (k === 'rentalMonthly' || k === 'rentalContractMonths' || k === 'visitCycles')) { // 옵션표에서 파생되는 값 — 이 CSV로는 바꾸지 않음
        var rw = String(row[idx[k]] == null ? '' : row[idx[k]]).trim(), cur = k === 'visitCycles' ? (p[k] || []).join('|') : (p[k] == null ? '' : String(p[k]));
        if (rw !== '' && rw.replace(/[,\s원]/g, '') !== cur.replace(/\s+/g, '') && k !== 'visitCycles') res.warns.push(line + '행 [' + p.name + '] ' + F[k].csv + ' 은(는) 렌탈 옵션표에서 자동 계산되어 무시합니다. (옵션 CSV 또는 상세 편집에서 수정)');
        return;
      }
      var raw = row[idx[k]], s = String(raw == null ? '' : raw).trim();
      if (s === '' && !F[k].emptyClears) return; // 비어 있으면 변경 없음 (가격류만 비움=상담 시 안내)
      var pr = F[k].parse(raw);
      if (pr.err) { res.errors.push(line + '행 [' + p.name + '] ' + F[k].csv + ': ' + pr.err + ' (입력값: ' + s + ')'); return; }
      per[p.id].vals[k] = pr.v;
    });
  }
  order.forEach(function(id){
    var o = per[id], ch = [];
    Object.keys(o.vals).forEach(function(k){ if (!same(o.p[k], o.vals[k])) ch.push({ key: k, before: o.p[k], after: o.vals[k] }); });
    res.matched++;
    if (ch.length) res.changes.push({ p: o.p, ch: ch }); else res.unchanged++;
  });
  return res;
}
var plan = null;
function renderPreview(res){
  plan = res;
  var box = $('#previewBox');
  var nf_ = res.changes.reduce(function(n, c){ return n + c.ch.length; }, 0);
  var h = '<div class="pv-sum"><span>읽은 행 ' + res.total + '</span><span class="ok">매칭 ' + res.matched + '</span><span class="' + (nf_ ? 'ok' : '') + '">변경 ' + res.changes.length + '개 제품 / ' + nf_ + '개 값</span><span>변경 없음 ' + res.unchanged + '</span>' +
    (res.unmatched.length ? '<span class="wn">매칭 실패 ' + res.unmatched.length + '</span>' : '') + (res.errors.length ? '<span class="er">오류 ' + res.errors.length + '</span>' : '') + '</div>';
  if (res.cols.length) h += '<div class="note-sm">인식한 컬럼: ' + res.cols.map(esc).join(', ') + ' (파일에 없는 컬럼은 건드리지 않습니다)</div>';
  if (res.errors.length) h += '<div class="pv-list" style="background:#fde0dd;color:#a1241b"><b>오류</b> (해당 값은 적용되지 않습니다)<br>' + res.errors.map(esc).join('<br>') + '</div>';
  if (res.unmatched.length) h += '<div class="pv-list"><b>매칭 실패</b> (적용되지 않음)<br>' + res.unmatched.map(esc).join('<br>') + '</div>';
  if (res.warns.length) h += '<div class="pv-list">' + res.warns.map(esc).join('<br>') + '</div>';
  if (res.changes.length) {
    h += '<div class="pv-wrap"><table class="pv-tbl"><thead><tr><th>제품</th><th>항목</th><th>변경 전</th><th>변경 후</th></tr></thead><tbody>' +
      res.changes.map(function(c){ return c.ch.map(function(x, i){
        return '<tr>' + (i === 0 ? '<td rowspan="' + c.ch.length + '"><b>' + esc(c.p.name) + '</b><br><small style="color:#8a94a6">' + esc(c.p.id) + '</small></td>' : '') +
          '<td>' + esc((F[x.key] ? F[x.key].label : '렌탈 옵션표')) + '</td><td class="old">' + esc(fmt(x.key, x.before)) + '</td><td class="new">' + esc(fmt(x.key, x.after)) + '</td></tr>';
      }).join(''); }).join('') + '</tbody></table></div>' +
      '<div class="row-btn" style="margin-top:10px"><button class="btn primary" id="btnApplyUp" type="button">미리보기대로 ' + res.changes.length + '개 제품에 적용</button><button class="btn ghost" id="btnCancelUp" type="button">취소</button></div>' +
      '<div class="note-sm">적용해도 아직 사이트에는 반영되지 않습니다. 확인 후 "게시 · 토큰" 탭에서 GitHub에 게시하세요.</div>';
  } else if (!res.errors.length || res.matched) h += '<p style="margin-top:8px"><b>적용할 변경 사항이 없습니다.</b></p>';
  box.innerHTML = h;
}
$('#previewBox').addEventListener('click', function(e){
  if (e.target.id === 'btnCancelUp') { plan = null; $('#previewBox').innerHTML = ''; $('#fileIn').value = ''; }
  if (e.target.id === 'btnApplyUp' && plan) {
    var n = 0;
    plan.changes.forEach(function(c){ var p = findP(c.p.id); if (!p) return; c.ch.forEach(function(x){ if (x.key === 'rentalOptions') { p.rentalOptions = clone(x.after); deriveRental(p); } else setField(p, x.key, clone(x.after)); n++; }); });
    saveDraft(); renderAll();
    $('#previewBox').innerHTML = '<p class="pv-sum"><span class="ok">' + plan.changes.length + '개 제품, ' + n + '개 값을 적용했습니다. "게시 · 토큰" 탭에서 GitHub에 게시하세요.</span></p>';
    plan = null; $('#fileIn').value = ''; toast('일괄 업로드 내용을 적용했습니다.');
  }
});
$('#fileIn').addEventListener('change', async function(e){
  var f = e.target.files[0]; if (!f) return;
  var box = $('#previewBox'); box.innerHTML = '<p>파일을 읽는 중…</p>';
  try {
    var buf = await f.arrayBuffer(), rows;
    if (/\.xlsx?$/i.test(f.name)) {
      var X = await loadSheetJS();
      var wb = X.read(new Uint8Array(buf), { type: 'array' });
      rows = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
    } else rows = parseCsvText(decodeBytes(buf));
    renderPreview(planUpload(rows));
  } catch (ex) { box.innerHTML = '<div class="pv-list" style="background:#fde0dd;color:#a1241b">파일을 읽지 못했습니다: ' + esc(ex.message || ex) + '</div>'; }
});

/* ───────────── 게시 (GitHub Contents API) ───────────── */
function getToken(){ try { return localStorage.getItem(LS_TOKEN) || ''; } catch (e) { return ''; } }
function renderTokState(){
  var t = getToken(), el = $('#tokState');
  el.className = 'tok-state ' + (t ? 'ok' : 'no');
  el.textContent = t ? '✓ 저장됨 (…' + t.slice(-4) + ')' : '토큰 없음 — "JSON 다운로드"로 수동 반영하세요';
}
function renderPublishSummary(){
  if (!$('#pubSummary')) return;
  var ch = changeList();
  $('#pubSummary').innerHTML = ch.length ? '<b>게시본 대비 변경 ' + ch.length + '건</b><ul style="padding-left:18px;margin-top:4px">' + ch.slice(0, 80).map(function(c){
    return '<li>[' + c.kind + '] ' + esc(c.name) + (c.fields.length ? ' — ' + c.fields.map(function(k){ return esc(F[k] ? F[k].label : (k === 'rentalOptions' ? '렌탈 옵션표' : k === 'priceMatrix' ? '가격 매트릭스' : k === 'servicePrices' ? '서비스 가격표' : k)); }).join(', ') : '') + '</li>'; }).join('') + (ch.length > 80 ? '<li>…외 ' + (ch.length - 80) + '건</li>' : '') + '</ul>' : '게시본과 동일합니다. (변경 사항 없음)';
  var inp = $('#commitMsg'); if (inp && !inp.dataset.touched) inp.value = '상품 가격/정보 업데이트 (' + ch.length + '건) - 관리자 페이지';
}
$('#commitMsg').addEventListener('input', function(){ this.dataset.touched = '1'; });
$('#tokShow').addEventListener('click', function(){ var i = $('#tokIn'); i.type = i.type === 'password' ? 'text' : 'password'; this.textContent = i.type === 'password' ? '보기' : '숨기기'; });
$('#tokSave').addEventListener('click', function(){
  var t = $('#tokIn').value.trim();
  if (!t) { toast('토큰을 입력하세요.'); return; }
  if (!/^(github_pat_|ghp_)[A-Za-z0-9_]+$/.test(t)) { toast('토큰 형식이 아닙니다. github_pat_ 로 시작해야 해요.'); return; }
  localStorage.setItem(LS_TOKEN, t); $('#tokIn').value = ''; renderTokState(); toast('토큰을 이 브라우저에 저장했습니다.');
});
$('#tokDel').addEventListener('click', function(){ localStorage.removeItem(LS_TOKEN); renderTokState(); toast('저장된 토큰을 삭제했습니다.'); });

/* UTF-8 문자열 → base64 (한글 안전) */
function b64utf8(str){
  var bytes = new TextEncoder().encode(str), bin = '';
  for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function ghHeaders(token){
  return { 'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + token, 'X-GitHub-Api-Version': '2022-11-28' };
}
var contentsUrl = function(){ return CFG.api + '/repos/' + CFG.owner + '/' + CFG.repo + '/contents/' + CFG.path.split('/').map(encodeURIComponent).join('/'); };
/* 현재 파일의 sha 조회 (없으면 null → 새 파일 생성) */
async function ghGetSha(token){
  var r = await fetch(contentsUrl() + '?ref=' + encodeURIComponent(CFG.branch), { headers: ghHeaders(token), cache: 'no-store' });
  if (r.status === 404) return null;
  if (!r.ok) throw await ghError(r);
  var j = await r.json();
  return j.sha;
}
/* PUT /repos/{owner}/{repo}/contents/{path}  body: { message, content(base64), sha?, branch } */
async function ghPut(token, text, message, sha){
  var body = { message: message, content: b64utf8(text), branch: CFG.branch };
  if (sha) body.sha = sha; // 기존 파일 갱신 시 필수
  return fetch(contentsUrl(), { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders(token)), body: JSON.stringify(body) });
}
async function ghError(r){
  var msg = ''; try { msg = (await r.json()).message || ''; } catch (e) {}
  var e = new Error(r.status + ' ' + msg); e.status = r.status; e.ghMessage = msg; return e;
}
function friendlyErr(e){
  if (e.status === 401) return '토큰이 올바르지 않거나 만료되었습니다. (401) 새 토큰을 발급해 저장하세요.';
  if (e.status === 403) return '권한이 없거나 요청 한도 초과입니다. (403) 토큰의 Contents 권한이 "Read and write" 인지 확인하세요.';
  if (e.status === 404) return '저장소/경로를 찾을 수 없거나 토큰이 이 저장소(cescoallcare/cesco-allcare)에 접근할 수 없습니다. (404)';
  if (e.status === 409 || e.status === 422) return '다른 곳에서 먼저 수정되어 충돌했습니다. 다시 시도하면 최신 버전을 기준으로 덮어씁니다. (' + e.status + ')';
  if (e.name === 'TypeError') return '네트워크 오류로 GitHub에 연결하지 못했습니다.';
  return '게시 실패: ' + e.message;
}
$('#btnPublish').addEventListener('click', async function(){
  var log = $('#pubLog'), btn = this, token = getToken();
  log.className = 'pub-log';
  if (!token) { log.className = 'pub-log err'; log.textContent = '저장된 토큰이 없습니다. 아래에서 토큰을 저장하거나, "JSON 다운로드"로 수동 반영하세요.'; return; }
  if (!confirm('GitHub(' + CFG.owner + '/' + CFG.repo + ')에 ' + CFG.path + ' 을(를) 커밋해 게시할까요?\n1~2분 뒤 사이트에 반영됩니다.')) return;
  btn.disabled = true; log.textContent = '게시 중…';
  var ov = toOv(work); ov.updatedAt = new Date().toISOString();
  var text = JSON.stringify(ov, null, 2) + '\n';
  var msg = ($('#commitMsg').value || '상품 가격/정보 업데이트 - 관리자 페이지').trim();
  try {
    var sha = await ghGetSha(token), r = await ghPut(token, text, msg, sha);
    if (r.status === 409 || r.status === 422) { sha = await ghGetSha(token); r = await ghPut(token, text, msg, sha); } // sha 충돌 시 최신 sha 로 1회 재시도
    if (!r.ok) throw await ghError(r);
    var j = await r.json();
    pubOv = normOv(ov); pubWork = build(pubOv); work = build(pubOv); localStorage.removeItem(LS_DRAFT); banner('');
    renderAll();
    log.className = 'pub-log ok';
    log.innerHTML = '✓ 게시 완료! GitHub Pages 재배포에 보통 1~2분 걸립니다. 잠시 후 사이트를 새로고침해 확인하세요.' + (j.commit && j.commit.html_url ? '<br><a href="' + esc(j.commit.html_url) + '" target="_blank" rel="noopener noreferrer">커밋 보기 ↗</a>' : '');
  } catch (e) { log.className = 'pub-log err'; log.textContent = friendlyErr(e) + ' — 급하면 "JSON 다운로드"로 수동 반영할 수 있어요.'; }
  btn.disabled = false;
});

/* ───────────── UI 초기화 ───────────── */
var uiInit = false;
function initUi(){
  if (uiInit) return; uiInit = true;
  $('#fCat').innerHTML = '<option value="all">전체 카테고리</option>' + CATS.map(function(c){ return '<option value="' + c[0] + '">' + c[1] + ' (' + c[0] + ')</option>'; }).join('');
  $('#ghRepoTxt').textContent = CFG.owner + '/' + CFG.repo; $('#ghPathTxt').textContent = CFG.path;
  renderTokState();
  var fit = function(){ document.documentElement.style.setProperty('--stick', ($('.top').offsetHeight + 8) + 'px'); };
  fit(); window.addEventListener('resize', fit);
}
/* 테스트/디버그용 최소 노출 (읽기 전용 용도) */
window.__admin = { b64utf8: b64utf8, parseCsvText: parseCsvText, planUpload: planUpload, toOv: function(){ return toOv(work); }, CFG: CFG };
showView();
})();
