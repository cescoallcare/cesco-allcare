/* floating.js — 모든 라우트에서 유지되는 고정(fixed) 플로팅 UI
   ① 오른쪽 아래: 빠른 상담 FAB (맞춤 상담 신청 / 전화 / 카카오톡 / 맨 위로)
   ② 왼쪽 위(헤더 아래): 베스트 인기 · 베스트 핫딜 · 이맘때 추천 칩 + 상품 패널
   상품 목록은 window.CESCO_PRODUCTS(관리자 오버라이드 반영본)에서 열 때마다 계산하므로 숨김/삭제 상품은 자동 제외됩니다.
   설정·월별 규칙은 data/curation.js 에서 수정합니다. */
(function(){
'use strict';
const U = window.U, CUR = window.CURATION;
if (!U || !CUR) return;
const { C, P, esc, ico, won, img, fromInfo } = U;
const doc = document;
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const live = p => !p.soldOut && !p.hidden;
const pop = p => (p.popularity ? p.popularity.reviews : 0);

/* ───────── 계산 ───────── */
function priceText(p){
  const f = fromInfo(p);
  if (f && f.kind === 'rent') return f.text;
  if (!U.isRent(p) && p.buyPrice != null) return won(p.buyPrice) + (p.pricePrefix ? ' ' + p.pricePrefix : '');
  if (f) return f.text;
  return p.rentalMonthly ? '월 ' + won(p.rentalMonthly) : '상담 시 안내';
}
/* 베스트 인기: BEST 페이지와 동일 기준 (리뷰 수 순, 제휴 상품 제외) */
function calcBest(){
  return P.filter(p => live(p) && p.popularity && !p.partner)
    .sort((a, b) => pop(b) - pop(a)).slice(0, CUR.best.limit)
    .map((p, i) => ({ p, badge: (i + 1) + '위', price: priceText(p), meta: '평점 ' + p.popularity.rating + ' · 리뷰 ' + pop(p).toLocaleString('ko-KR') + '개' }));
}
/* 베스트 핫딜: 렌탈 가격표의 월 렌탈료가 가격표 기준가 대비 얼마나 낮은지(할인율)로 계산. 화면에는 월 렌탈료와 할인율%만 표시 */
function calcHot(){
  const out = [];
  P.forEach(p => {
    if (!live(p) || !Array.isArray(p.rentalOptions)) return;
    let best = null;
    p.rentalOptions.forEach(o => {
      const list = o.listPrice; if (!(list > 0)) return;
      [['월 렌탈료', o.monthPrice]].forEach(c => {
        const v = c[1]; if (!(v > 0) || v >= list) return;
        const amt = list - v, rate = amt / list;
        if (!best || rate > best.rate + 1e-9 || (Math.abs(rate - best.rate) < 1e-9 && amt > best.amt)) best = { o, kind: c[0], v, list, amt, rate };
      });
    });
    if (best) out.push({ p, best });
  });
  out.sort((a, b) => b.best.rate - a.best.rate || b.best.amt - a.best.amt);
  return out.slice(0, CUR.hotdeal.limit).map(x => {
    const o = x.best.o, opt = [o.periodLabel, o.visit && o.visit !== '-' ? '방문 ' + o.visit : '', o.variant].filter(Boolean).join(' · ');
    return { p: x.p, badge: '−' + Math.round(x.best.rate * 100) + '%', hot: x.best, meta: opt };
  });
}
/* 이맘때 추천: data/curation.js 의 월별 규칙 */
function calcSeason(now){
  const S = CUR.seasonal, m = (now || new Date()).getMonth() + 1, rule = S.months[m];
  if (!rule) return { rule: null, items: [] };
  const matchGroup = g => P.filter(p => {
    if (!live(p) || (g.exclude || []).includes(p.id)) return false;
    if ((g.ids || []).includes(p.id)) return true;
    if (g.category && p.category === g.category && (!g.sections || (p.sections || []).some(s => g.sections.includes(s)))) return true;
    if (!g.category && g.sections && (p.sections || []).some(s => g.sections.includes(s))) return true;
    if (g.category && g.sections === undefined && p.category === g.category) return true;
    if (g.keywords) { const hay = (p.name + ' ' + (p.keywords || []).join(' ')); if (g.keywords.some(k => hay.includes(k))) return true; }
    return false;
  }).sort((a, b) => g.pin && g.ids ? g.ids.indexOf(a.id) - g.ids.indexOf(b.id) : pop(b) - pop(a));
  const lists = rule.picks.map(k => ({ k, g: S.groups[k], list: S.groups[k] ? matchGroup(S.groups[k]) : [] }));
  const seen = {}, items = [];
  for (let round = 0; items.length < S.limit && round < 6; round++) {
    for (const L of lists) {
      if (items.length >= S.limit) break;
      const p = L.list.filter(x => !seen[x.id])[0]; if (!p) continue;
      seen[p.id] = 1;
      const note = S.groupNotes && S.groupNotes[L.k]; const noteOk = note && (!note.months || note.months.includes(m));
      items.push({ p, badge: L.g.label, price: priceText(p), meta: noteOk ? note.text : '' });
    }
  }
  return { rule, month: m, items };
}

/* ───────── DOM ───────── */
const CHIPS = [
  { key: 'best', label: '베스트 인기', icon: 'star', title: '베스트 인기', sub: '리뷰 수가 많은 순서' },
  { key: 'hotdeal', label: '베스트 핫딜', icon: 'tag', title: '베스트 핫딜', sub: '할인율이 큰 렌탈 옵션' },
  { key: 'seasonal', label: '이맘때 추천', icon: 'calendar', title: '이맘때 추천', sub: '' }
];
const root = doc.createElement('div');
root.id = 'floatRoot';
root.innerHTML = `
  <div class="fl-chips" id="flChips" role="group" aria-label="추천 상품 바로가기">
    ${CHIPS.map(c => `<button type="button" class="fl-chip" data-fl="${c.key}" aria-expanded="false" aria-controls="flPanel" aria-haspopup="true">${ico(c.icon)}<span>${c.label}</span></button>`).join('')}
  </div>
  <section class="fl-panel" id="flPanel" role="region" aria-live="polite" hidden></section>`;
const quick = doc.createElement('div');
quick.className = 'fl-quick'; quick.id = 'flQuick';
quick.innerHTML = `
    <div class="fl-menu" id="flMenu" role="menu" aria-label="빠른 상담 메뉴">
      <button type="button" role="menuitem" class="fl-act" data-act="consult" data-fl-item>${ico('message')}<span>맞춤 상담 신청</span></button>
      <a role="menuitem" class="fl-act" href="${esc(C.planner.phoneTel)}" data-fl-item>${ico('phone')}<span>전화 상담</span></a>
      <a role="menuitem" class="fl-act kk" href="${esc(C.kakaoUrl)}" target="_blank" rel="noopener" data-act="kakao" data-fl-item>${ico('message')}<span>카카오톡 상담</span></a>
      <button type="button" role="menuitem" class="fl-act" data-fl-top data-fl-item>${ico('arrow', 'up')}<span>맨 위로</span></button>
    </div>
    <button type="button" class="fl-fab" id="flFab" aria-expanded="false" aria-controls="flMenu" aria-label="빠른 상담 메뉴 열기">
      <span class="o">${ico('message')}<b>상담</b></span><span class="c">${ico('x')}</span>
    </button>`;
/* 칩은 헤더 바로 뒤(Tab 순서상 앞), 빠른 상담 FAB 는 문서 끝에 둡니다. 둘 다 CSS position:fixed */
const hdr = doc.getElementById('header');
if (hdr && hdr.parentNode) hdr.parentNode.insertBefore(root, hdr.nextSibling); else doc.body.appendChild(root);
doc.body.appendChild(quick);
const $ = (s, r = doc) => r.querySelector(s);
const panel = $('#flPanel'), fab = $('#flFab'), menu = $('#flMenu'), chipsEl = $('#flChips');
let openKey = null;

function itemHtml(it){
  const p = it.p, hot = it.hot;
  let priceHtml;
  if (hot) priceHtml = `<span class="fl-price"><strong>월 ${won(hot.v)}</strong></span>${it.meta ? `<small>${esc(it.meta)}</small>` : ''}`;
  else priceHtml = `<span class="fl-price"><strong>${esc(it.price)}</strong></span>${it.meta ? `<small>${esc(it.meta)}</small>` : ''}`;
  return `<li><a class="fl-item" href="#/product/${esc(p.id)}" data-fl-link>
    <span class="th">${img(p.image, '', 'loading="lazy"')}</span>
    <span class="tx"><span class="bd ${hot ? 'hot' : ''}">${esc(it.badge)}</span><b>${esc(p.name)}</b>${priceHtml}</span>${ico('chevron')}</a></li>`;
}
function panelHtml(key){
  let items = [], head = '', note = '';
  if (key === 'best') { items = calcBest(); note = CUR.best.note; head = '리뷰 수가 많은 순서'; }
  else if (key === 'hotdeal') { items = calcHot(); note = CUR.hotdeal.note; head = '할인율이 큰 렌탈 옵션'; }
  else { const r = calcSeason(); items = r.items; note = CUR.seasonal.note; head = r.rule ? `${r.month}월 · ${r.rule.season} — 이 시기에 많이 찾는 케어` : ''; }
  const meta = CHIPS.filter(c => c.key === key)[0];
  return `<div class="fl-head"><div><b>${esc(meta.title)}</b><small>${esc(head)}</small></div><button type="button" class="fl-x" data-fl-close aria-label="${esc(meta.title)} 닫기">${ico('x')}</button></div>
    ${items.length ? `<ul class="fl-list">${items.map(itemHtml).join('')}</ul>` : `<p class="fl-empty">지금 보여 드릴 상품이 없습니다.</p>`}
    <p class="fl-note">${esc(note)}</p>`;
}
function setChips(){
  $$all('.fl-chip').forEach(b => { const on = b.dataset.fl === openKey; b.classList.toggle('on', on); b.setAttribute('aria-expanded', on ? 'true' : 'false'); });
}
function $$all(s){ return Array.prototype.slice.call(doc.querySelectorAll('#floatRoot ' + s + ', #flQuick ' + s)); }
function openPanel(key){
  closeMenu();
  openKey = key; panel.innerHTML = panelHtml(key); panel.hidden = false;
  panel.setAttribute('aria-label', CHIPS.filter(c => c.key === key)[0].title + ' 상품 목록');
  requestAnimationFrame(() => panel.classList.add('open'));
  setChips();
}
function closePanel(focusChip){
  if (!openKey) return;
  const k = openKey; openKey = null;
  panel.classList.remove('open'); panel.hidden = true; setChips();
  if (focusChip) { const b = $('.fl-chip[data-fl="' + k + '"]'); if (b) b.focus(); }
}
function openMenu(){
  closePanel();
  quick.classList.add('menu-open'); fab.setAttribute('aria-expanded', 'true'); fab.setAttribute('aria-label', '빠른 상담 메뉴 닫기');
}
function closeMenu(focusFab){
  if (!quick.classList.contains('menu-open')) return;
  quick.classList.remove('menu-open'); fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-label', '빠른 상담 메뉴 열기');
  if (focusFab) fab.focus();
}

/* 이벤트 */
function onFloatClick(e){
  const chip = e.target.closest('.fl-chip');
  if (chip) { chip.dataset.fl === openKey ? closePanel() : openPanel(chip.dataset.fl); return; }
  if (e.target.closest('[data-fl-close]')) { closePanel(true); return; }
  if (e.target.closest('[data-fl-link]')) { closePanel(); return; }
  if (e.target.closest('#flFab')) { quick.classList.contains('menu-open') ? closeMenu() : openMenu(); return; }
  if (e.target.closest('[data-fl-top]')) { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); closeMenu(); return; }
  if (e.target.closest('.fl-act')) { closeMenu(); }
}
root.addEventListener('click', onFloatClick); quick.addEventListener('click', onFloatClick);
doc.addEventListener('click', e => { if (!root.contains(e.target) && !quick.contains(e.target)) { closePanel(); closeMenu(); } });
doc.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (openKey) { closePanel(true); }
    else if (quick.classList.contains('menu-open')) { closeMenu(true); }
    return;
  }
  if (quick.classList.contains('menu-open') && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && quick.contains(doc.activeElement)) {
    const els = $$all('[data-fl-item]'), i = els.indexOf(doc.activeElement);
    e.preventDefault();
    if (e.key === 'ArrowUp') (els[i <= 0 ? els.length - 1 : i - 1]).focus(); else (els[i < 0 || i >= els.length - 1 ? 0 : i + 1]).focus();
  }
});
/* 키보드로 칩 사이를 좌우 화살표로 이동 */
chipsEl.addEventListener('keydown', e => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const bs = $$all('.fl-chip'), i = bs.indexOf(doc.activeElement); if (i < 0) return;
  e.preventDefault(); bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length].focus();
});
window.addEventListener('hashchange', () => { closePanel(); closeMenu(); });
/* 상담 모달·검색·드로어가 열려 있으면 플로팅 UI 접기 */
doc.addEventListener('click', e => { if (e.target.closest('[data-act="consult"],[data-act="openSearch"],[data-act="openDrawer"]')) { closePanel(); closeMenu(); } }, true);

/* 하단 고정 바(정기배송 선택 바 등) 높이만큼 FAB 를 위로 올려 겹침 방지 */
let liftQ = false;
function syncLift(){
  if (liftQ) return; liftQ = true;
  requestAnimationFrame(() => {
    liftQ = false;
    const bar = doc.getElementById('subBar');
    const h = bar && bar.classList.contains('show') && bar.innerHTML.trim() ? bar.offsetHeight : 0;
    doc.documentElement.style.setProperty('--fl-lift', h + 'px');
  });
}
const appEl = doc.getElementById('app');
if (appEl) new MutationObserver(syncLift).observe(appEl, { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
window.addEventListener('resize', syncLift); window.addEventListener('hashchange', syncLift); syncLift();
/* 맨 위로 버튼은 스크롤했을 때만 강조 */
function onScroll(){ quick.classList.toggle('scrolled', window.scrollY > 320); }
window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* 테스트/점검용 */
window.FloatingUI = { calcBest, calcHot, calcSeason };
})();
