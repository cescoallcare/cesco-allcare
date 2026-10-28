/* app.js — 라우터, 공통 UI(헤더/푸터/모달/검색), 이벤트 */
(function(){
'use strict';
const { C, P, byId, $, $$, esc, ico, img, PH } = window.U;
const PG = window.PAGES, NAV = window.NAV;
const app = $('#app');

/* ── 정적 UI 채우기 ── */
const MENUS = window.MENUS || [];
const subsOf = key => { const m = MENUS.find(x => x.key === key); return m && PG.menuSubs ? PG.menuSubs(m) : []; };
const subLink = (it, cls) => `<a class="${cls}" href="${it.href}" data-sub="${esc(it.target)}">${esc(it.label)}${it.hint ? `<small>${esc(it.hint)}</small>` : ''}</a>`;
/* PC 상단 메뉴 + 드롭다운(홈케어·사업장은 2단 메가메뉴) */
$('#nav').innerHTML = NAV.map(n => { const subs = subsOf(n.key).filter(s => s.items.length); const mega = subs.length > 1;
  return `<div class="nav-item${mega ? ' mega' : ''}" data-nav="${n.key}"><a class="top" href="${n.href}" data-key="${n.key}" ${subs.length ? `aria-haspopup="true" aria-expanded="false" aria-controls="dd-${n.key}"` : ''}>${esc(n.label)}</a>
    ${subs.length ? `<div class="dd" id="dd-${n.key}" role="menu" aria-label="${esc(n.label)} 하위 메뉴">${subs.map(s => `<div class="dd-col">${mega && s.title ? `<div class="dd-h">${esc(s.title)}</div>` : ''}${s.items.map(it => subLink(it, 'dd-a')).join('')}</div>`).join('')}</div>` : ''}</div>`; }).join('');
{ /* 마우스오버 지연(깜빡임 방지) · 키보드 포커스 · 클릭 시 닫힘 · ESC */
  const items = $$('#nav .nav-item'); let tOpen = null, tClose = null;
  const setOpen = (it, on) => { it.classList.toggle('open', on); const a = it.querySelector('a.top'); if (a && a.hasAttribute('aria-expanded')) a.setAttribute('aria-expanded', on ? 'true' : 'false'); };
  const closeAll = except => items.forEach(x => { if (x !== except) setOpen(x, false); });
  items.forEach(it => {
    if (!it.querySelector('.dd')) return;
    it.addEventListener('mouseenter', () => { clearTimeout(tClose); clearTimeout(tOpen); tOpen = setTimeout(() => { closeAll(it); setOpen(it, true); }, it.parentNode.querySelector('.nav-item.open') ? 0 : 140); });
    it.addEventListener('mouseleave', () => { clearTimeout(tOpen); tClose = setTimeout(() => setOpen(it, false), 220); });
    it.addEventListener('focusin', () => { closeAll(it); setOpen(it, true); });
    it.addEventListener('focusout', e => { if (!it.contains(e.relatedTarget)) setOpen(it, false); });
    it.addEventListener('keydown', e => { if (e.key === 'Escape') { setOpen(it, false); it.querySelector('a.top').focus(); }
      if (e.key === 'ArrowDown' && e.target.classList.contains('top')) { e.preventDefault(); setOpen(it, true); const f = it.querySelector('.dd a'); if (f) f.focus(); } });
  });
  $('#nav').addEventListener('click', e => { const a = e.target.closest('a'); if (!a) return; clearTimeout(tOpen); closeAll(null); if (a.classList.contains('dd-a')) a.blur(); });
}
/* 모바일: 헤더 아래 항상 보이는 6개 메뉴 가로 바 */
{ const mn = document.createElement('nav'); mn.className = 'mnav'; mn.id = 'mnav'; mn.setAttribute('aria-label', '주요 메뉴');
  mn.innerHTML = NAV.map(n => `<a href="${n.href}" data-key="${n.key}">${esc(n.label)}</a>`).join(''); $('#header').appendChild(mn); }
const NAVM = window.NAV_MORE || [];
$('#drawerLinks').innerHTML = `<div class="dr-main">` + NAV.map(n => { const subs = subsOf(n.key).filter(s => s.items.length);
  return `<div class="dr-acc" data-nav="${n.key}"><div class="dr-row"><a class="m" href="${n.href}" data-key="${n.key}" data-act="closeDrawer">${esc(n.label)}</a>${subs.length ? `<button type="button" class="dr-tg" aria-expanded="false" aria-controls="drs-${n.key}" aria-label="${esc(n.label)} 하위 메뉴 펼치기">${ico('chevron')}</button>` : ''}</div>
    ${subs.length ? `<div class="dr-sub" id="drs-${n.key}" hidden>${subs.map(s => `${s.title && subs.length > 1 ? `<div class="dr-h">${esc(s.title)}</div>` : ''}<div class="dr-items">${s.items.map(it => subLink(it, 'dr-a')).join('')}</div>`).join('')}</div>` : ''}</div>`; }).join('') + `</div>` +
  `<div class="dr-more">` + NAVM.map(n => `<a href="${n.href}" data-key="${n.key}" data-act="closeDrawer">${esc(n.label)}</a>`).join('') +
  `<a href="air/">에어케어 랜딩</a><a href="water/">워터케어 랜딩</a><a href="#/planner" data-act="closeDrawer">플래너 소개</a></div>`;
  `<a class="m" href="air/">에어케어 자세히 보기${ico('chevron')}</a><a class="m" href="water/">워터케어 자세히 보기${ico('chevron')}</a><a class="m" href="#/products" data-act="closeDrawer">전체 제품${ico('chevron')}</a><a class="m" href="#/planner" data-act="closeDrawer">플래너 소개${ico('chevron')}</a>`;
$('#drawerLinks').addEventListener('click', e => {
  const tg = e.target.closest('.dr-tg');
  if (tg) { const sub = document.getElementById(tg.getAttribute('aria-controls')); const on = tg.getAttribute('aria-expanded') !== 'true';
    tg.setAttribute('aria-expanded', on ? 'true' : 'false'); tg.closest('.dr-acc').classList.toggle('open', on); if (sub) sub.hidden = !on; return; }
  if (e.target.closest('.dr-a')) closeDrawer();
});
/* 같은 하위 항목을 다시 눌렀을 때(해시 변화 없음)도 앵커로 이동 */
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[data-sub]'); if (!a) return;
  if (location.hash === a.getAttribute('href')) { e.preventDefault(); PG.scrollToId(a.dataset.sub); } });
$('#drawerTel').innerHTML = ico('phone') + ' ' + esc(C.planner.phone);
$('#drawerTel').href = C.planner.phoneTel;
$('#btnSearch').innerHTML = ico('search'); $('#btnSearch').dataset.act = 'openSearch';
$('#btnMenu').innerHTML = ico('menu'); $('#btnMenu').dataset.act = 'openDrawer';
$('#btnDrawerX').innerHTML = ico('x'); $('#btnSearchX').innerHTML = ico('x'); $('#btnConsultX').innerHTML = ico('x');
$('#searchIco').innerHTML = ico('search');
$('#bottomNav').innerHTML = `
  <a href="#/" data-bn="home">${ico('home')}<span>홈</span></a>
  <a href="#/products" data-bn="products">${ico('box')}<span>제품</span></a>
  <a href="#/finder" data-bn="finder">${ico('compass')}<span>케어찾기</span></a>
  <a href="${esc(C.kakaoUrl)}" data-act="kakao" class="kk" target="_blank" rel="noopener">${ico('message')}<span>카톡</span></a>
  <a href="javascript:void(0)" class="cta" data-act="consult"><span class="pill">${ico('message')}<span>상담</span></span></a>`;

function footerHtml(){
  const c = C.planner;
  return `<div class="container">
    <div class="cols">
      <div><img class="flogo" src="assets/logo/logo-white.png" alt="CESCO Lifecare"><p style="max-width:340px;line-height:1.75">${esc(c.slogan)}<br>공기부터 물, 생활까지. 내 공간에 꼭 필요한 케어를 함께 찾아 드립니다.</p>
        <ul class="contact" style="margin-top:18px">
          <li>${ico('phone')} <a href="${c.phoneTel}" style="color:#fff;font-weight:700">${esc(c.phone)}</a></li>
          <li>${ico('mail')} <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li></ul></div>
      <div><h4>MENU</h4><ul class="menus">${NAV.concat(window.NAV_MORE || []).map(n => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}<li><a href="#/planner">플래너 소개</a></li></ul></div>
      <div><h4>CONTACT</h4><ul><li><a href="javascript:void(0)" data-act="consult">맞춤 상담 신청</a></li><li><a href="${c.phoneTel}">전화 상담</a></li><li><a href="${esc(C.kakaoUrl)}" data-act="kakao" target="_blank" rel="noopener">카카오톡 상담</a></li><li><a href="javascript:void(0)" data-act="inbox">이 브라우저의 상담 접수 내역</a></li></ul></div>
    </div>
    <div class="legal">
      <p><b>본 사이트는 세스코 라이프케어 플래너의 상품 안내 및 상담을 위한 페이지입니다.</b></p>
      <div class="trust-note"><p>본 사이트는 세스코 라이프케어 SOL 플래너가 운영하는 상담·안내 사이트입니다.</p><p>세스코 본사 공식 홈페이지가 아닙니다.</p><p>최종 상품 가격과 계약 조건은 상담 시 확인해야 합니다.</p><p>렌탈료는 약정기간, 방문주기, 제휴카드, 프로모션에 따라 달라질 수 있습니다.</p></div>
      <p>가격, 월 렌탈료, 계약 조건(의무사용기간·방문주기·약정·위약금 등)은 공식 판매/계약 기준에 따라 달라질 수 있으며, 최종 조건은 계약 시점의 공식 안내를 따릅니다. 확인되지 않은 항목은 “상담 시 안내”로 표시합니다.</p>
      <p>PARTNER PRODUCT(제휴·판매 상품)로 표시된 아롬비(AROMVI) 상품은 세스코 자체 제품이 아닙니다.</p>
      <p>© CESCO ALL CARE · ${esc(c.title)}. 세스코(CESCO)는 해당 권리자의 상표입니다.</p>
    </div></div>`;
}
$('#footer').innerHTML = footerHtml();

/* ── 라우터 ── */
function parse(){
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  const qs = {}; query.split('&').filter(Boolean).forEach(kv => { const [k, v=''] = kv.split('='); qs[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' ')); });
  return { parts: path.split('/').filter(Boolean), qs };
}
const TITLES = { air:'퓨어에어', water:'퓨어워터', perfume:'퓨어퍼퓸', supplies:'소모품', business:'사업장', 'home-care':'홈케어', rental:'RENTAL', subscribe:'정기배송', best:'BEST', finder:'CARE FINDER', guide:'CARE GUIDE', products:'전체 제품', search:'검색', planner:'플래너 소개' };
let lastPath = null;
function render(){
  const { parts, qs } = parse();
  const [a, b] = parts;
  let html, navKey = a || 'home', title = 'CESCO ALL CARE';
  try {
    switch (a) {
      case undefined: html = PG.home(); navKey = 'home'; break;
      case 'consult': html = PG.home(); navKey = 'home'; setTimeout(() => { let pf = {}; try { pf = JSON.parse(sessionStorage.getItem('cescoPrefill') || '{}') || {}; sessionStorage.removeItem('cescoPrefill'); } catch (e) {} openConsult({ topic: pf.topic || qs.topic, msg: pf.msg, kind: pf.kind }); }, 250); break;
      case 'air': if (qs.sub === 'air.space') { location.replace('#/perfume'); return; } html = PG.menuPage('air', qs); break;
      case 'water': html = PG.menuPage('water', qs); break;
      case 'perfume': case 'supplies': html = PG.menuPage(a, qs); break;
      case 'life': location.replace((window.MENU_REDIRECTS || {}).life || '#/supplies'); return;
      case 'products': html = PG.productsPage(qs); navKey = ''; break;
      case 'product': html = PG.productPage(b); { const p = byId[b]; title = p ? p.name : ''; navKey = PG.navKeyOf(p); } break;
      case 'best': html = PG.bestPage(qs); break;
      case 'rental': html = PG.rentalPage(qs); break;
      case 'business': html = b ? PG.businessPage(b) : PG.menuPage('business', qs); break;
      case 'home-care': html = b ? PG.homeCarePage(b) : PG.menuPage('homecare', qs); navKey = 'homecare'; break;
      case 'concern': html = PG.concernPage(b); navKey = ''; break;
      case 'guide': html = PG.guidePage(b); break;
      case 'subscribe': html = PG.subscribePage(qs); break;
      case 'finder': html = PG.finderPage(qs); break;
      case 'search': html = PG.searchPage(qs); navKey = ''; break;
      case 'planner': html = PG.plannerPage(); navKey = ''; break;
      default: html = PG.notFound(); navKey = '';
    }
  } catch (e) { console.error('render error', e); html = PG.notFound(); }
  app.innerHTML = html;
  document.body.classList.toggle('rt-home', a === undefined);
  document.title = (TITLES[a] || title) && a ? `${TITLES[a] || title} | 세스코 올케어 CESCO ALL CARE` : '세스코 올케어 (CESCO ALL CARE) | 세스코 라이프케어 SOL 플래너';
  if (a === 'product' && title) document.title = `${title} | 세스코 올케어`;
  // nav 하이라이트
  $$('#nav a.top, #mnav a, #drawerLinks a[data-key]').forEach(x => { const on = x.dataset.key === navKey; x.classList.toggle('active', on); if (on) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
  { const m = $('#mnav'), on = m && m.querySelector('a.active'); if (m) m.scrollLeft = on ? on.offsetLeft - (m.clientWidth - on.offsetWidth) / 2 : 0; }
  $$('#bottomNav a[data-bn]').forEach(x => x.classList.toggle('on', x.dataset.bn === (a === undefined ? 'home' : a === 'finder' ? 'finder' : ['products','air','water','perfume','supplies','product','best','rental','subscribe'].includes(a) ? 'products' : '')));
  // sub-bar
  const bar = $('#subBar'); if (bar) { bar.innerHTML = PG.subBarHtml(); bar.classList.toggle('show', !!bar.innerHTML); }
  // 스크롤: 같은 라우트의 필터 변경 시엔 유지
  const key = parts.join('/');
  if (key !== lastPath) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  lastPath = key;
  closeDrawer();
  // 홈 해시앵커
  if (qs.goto) { const el = document.getElementById(qs.goto); if (el) el.scrollIntoView(); }
  { const mk = { air: 'air', water: 'water', perfume: 'perfume', supplies: 'supplies', 'home-care': 'homecare', business: 'business' }[a]; const id = mk && !b && PG.anchorOf ? PG.anchorOf(mk, qs) : null; if (id) PG.scrollToId(id); }
}
window.addEventListener('hashchange', render);

/* ── 이미지 폴백 ── */
document.addEventListener('error', e => {
  const t = e.target;
  if (t && t.tagName === 'IMG' && !t.dataset.fb) { t.dataset.fb = '1'; t.src = PH; }
}, true);

/* ── 드로어/검색 ── */
function openDrawer(){ $('#drawer').classList.add('open'); $('#drawer').setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; }
function closeDrawer(){ $('#drawer').classList.remove('open'); $('#drawer').setAttribute('aria-hidden','true'); if (!$('#searchOv.open') && !$('#consultModal.open')) document.body.style.overflow = ''; }
function openSearch(){ closeDrawer(); $('#searchOv').classList.add('open'); document.body.style.overflow = 'hidden'; const i = $('#searchInput'); setTimeout(() => i.focus(), 30); renderSearch(); }
function closeSearch(){ $('#searchOv').classList.remove('open'); if (!$('#consultModal.open')) document.body.style.overflow = ''; }
function renderSearch(){
  const q = $('#searchInput').value.trim();
  const sug = ['공기청정기','정수기','비데','에어컨 크리닝','매트리스','반려동물','PC방','냄새','해충','렌탈'];
  $('#searchBody').innerHTML = q ? PG.searchGroups(q, 4) : `<div class="sgroup"><h4>추천 검색어</h4><div class="chips-row">${sug.map(s => `<button class="chip" data-act="sq" data-q="${s}">${s}</button>`).join('')}</div></div>`;
}
$('#searchInput').addEventListener('input', renderSearch);
$('#searchForm').addEventListener('submit', e => { e.preventDefault(); const q = $('#searchInput').value.trim(); if (q) { closeSearch(); location.hash = '#/search?q=' + encodeURIComponent(q); } });

/* ── 상담 모달 (폼·전송은 core.js 공용: U.consultFormHtml / U.bindConsultForm — CONFIG.formEndpoint 설정 시 Apps Script 로 전송) ── */
const LS_KEY = 'cescoInquiries';
function openConsult(o = {}){
  const p = o.product ? byId[o.product] : null;
  let topic = o.topic || '';
  if (p && !topic) topic = p.category === 'air' ? '공기 케어' : p.category === 'water' ? '물 케어 (정수기·샤워·비데)' : p.subscribable ? '정기배송' : p.servicePrices ? '에어컨 크리닝 문의' : p.priceMatrix ? '매트리스 문의' : p.type === 'service' ? '해충 관리' : '생활·위생용품';
  const c = { product: o.product, topic, msg: o.msg, kind: o.kind };
  $('#consultBody').innerHTML = window.U.consultFormHtml(c);
  $('#consultModal').classList.add('open'); document.body.style.overflow = 'hidden';
  setTimeout(() => $('#cmName') && $('#cmName').focus(), 60);
  window.U.bindConsultForm(c);
}
function closeConsult(){ $('#consultModal').classList.remove('open'); if (!$('#searchOv.open')) document.body.style.overflow = ''; }
function openInbox(){
  const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]').slice().reverse();
  $('#consultBody').innerHTML = `<span class="eyebrow">INBOX</span><h2 class="h3" style="margin:10px 0 14px">이 브라우저의 상담 접수 내역</h2>
   ${list.length ? `<div style="overflow:auto"><table class="inbox-table"><thead><tr><th>접수</th><th>이름</th><th>주제</th></tr></thead><tbody>${list.map(r => `<tr><td>${esc(r.createdAt.slice(0,16).replace('T',' '))}</td><td>${esc(r.name)}<br><small class="muted">${esc(r.phone)}</small></td><td>${esc(r.topic)}${r.product ? '<br><small class="muted">'+esc(r.product.name)+'</small>' : ''}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">접수된 내역이 없습니다.</div>'}
   <button class="btn btn-ghost btn-lg btn-block" style="margin-top:16px" data-act="closeConsult">닫기</button>`;
  $('#consultModal').classList.add('open'); document.body.style.overflow = 'hidden';
}

/* ── 토스트 ── */
let tt;
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600); }

/* ── 이벤트 위임 ── */
function refreshSub(){
  const root = $('#subRoot'); if (root) root.innerHTML = PG.subscribeBody();
  const bar = $('#subBar'); if (bar) { bar.innerHTML = PG.subBarHtml(); bar.classList.toggle('show', !!bar.innerHTML); }
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act, d = el.dataset;
  switch (act) {
    case 'consult': e.preventDefault(); closeDrawer(); closeSearch(); openConsult({ product: d.product, topic: d.topic, msg: d.msg }); break;
    case 'closeConsult': closeConsult(); break;
    case 'inbox': e.preventDefault(); openInbox(); break;
    case 'openDrawer': openDrawer(); break;
    case 'closeDrawer': closeDrawer(); break;
    case 'openSearch': openSearch(); break;
    case 'closeSearch': closeSearch(); break;
    case 'rOpt': { PG.optPick(d.id, d.k, d.v); const el = document.getElementById('rentOpt'); if (el) { const y = window.scrollY; el.outerHTML = PG.rentalOptBlock(byId[d.id]); window.scrollTo(0, y); } break; }
    case 'rOptRow': { PG.optRowPick(d.id, +d.i); const el = document.getElementById('rentOpt'); if (el) { const y = window.scrollY; el.outerHTML = PG.rentalOptBlock(byId[d.id]); const nel = document.getElementById('rentOpt'); const det = nel && nel.querySelector('.opt-all'); if (det) det.open = true; window.scrollTo(0, y); } break; }
    case 'sq': $('#searchInput').value = d.q; renderSearch(); break;
    case 'kakao': if (/REPLACE_ME/.test(C.kakaoUrl)) { e.preventDefault(); toast('카카오톡 상담 채널을 준비 중입니다. 전화 또는 상담 신청을 이용해 주세요.'); } break;
    case 'subCycle': PG.SUB.cycle = +d.m; refreshSub(); break;
    case 'subToggle': { const p = byId[d.id]; if (PG.SUB.picked[d.id] != null) delete PG.SUB.picked[d.id]; else PG.SUB.picked[d.id] = ((p.subMonths||[]).includes(PG.SUB.cycle) ? PG.SUB.cycle : (p.subRecommend || p.subMonths[0])); refreshSub(); break; }
    case 'subClear': PG.SUB.picked = {}; refreshSub(); break;
    case 'subConsult': { const ids = Object.keys(PG.SUB.picked); const msg = '정기배송 문의: ' + ids.map(id => `${byId[id].name} (${PG.subMonthsLabel(PG.SUB.picked[id])}마다)`).join(', '); openConsult({ topic: '정기배송', msg }); break; }
    case 'fOpt': { const F = PG.FS, k = d.k, id = d.id; if (k === 'env' || k === 'concern') { const i = F[k].indexOf(id); i >= 0 ? F[k].splice(i, 1) : F[k].push(id); } else F[k] = id; $('#finderRoot').innerHTML = PG.finderBody(); break; }
    case 'fNext': PG.FS.step++; $('#finderRoot').innerHTML = PG.finderBody(); window.scrollTo({ top: $('#finderRoot').offsetTop - 120 }); break;
    case 'fPrev': PG.FS.step--; $('#finderRoot').innerHTML = PG.finderBody(); break;
    case 'fReset': Object.assign(PG.FS, { step: 0, place: null, env: [], concern: [], mode: null }); $('#finderRoot').innerHTML = PG.finderBody(); window.scrollTo({ top: 0 }); break;
  }
});
document.addEventListener('submit', e => {
  if (e.target.id === 'searchPageForm') { e.preventDefault(); const q = $('#searchPageInput').value.trim(); location.hash = '#/search?q=' + encodeURIComponent(q); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.act === 'rOptRow') { e.target.click(); return; }
  if (e.key === 'Escape') { closeConsult(); closeSearch(); closeDrawer(); }
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
});

render();

/* ── 헤더 스크롤 전환 / 스크롤 리빌 / 숫자 카운트 ── */
const header = $('#header');
let ticking = false;
let lastY = 0;
function onScroll(){ if (ticking) return; ticking = true; requestAnimationFrame(() => { const y = window.scrollY; header.classList.toggle('scrolled', y > 12);
  /* 모바일: 아래로 스크롤하면 로고 줄을 접고 메뉴 바만 고정, 위로 올리면 다시 펼침 */
  if (y < 120 || y < lastY - 6) header.classList.remove('hdr-min'); else if (y > lastY + 6) header.classList.add('hdr-min');
  document.body.classList.toggle('scr', y > 140); lastY = y; ticking = false; }); }
window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const RV = '.section-head, .tile, .concern-card, .pick-card, .pcard, .rcard, .gcard, .benefit, .step-block, .cta-strip, .p-item, .planner .pl-card, .consult .inner > *, .stats .stat-i, .faq, .cmp, .notice, .result-hero, .rec-card, .worry-list li';
let io = null;
function countUp(el){
  const end = +el.dataset.count; if (!end || reduce) return;
  const t0 = performance.now(), dur = 1100;
  const tick = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(end * e); if (k < 1) requestAnimationFrame(tick); else el.textContent = end; };
  el.textContent = '0'; requestAnimationFrame(tick);
}
function setupReveal(){
  if (io) io.disconnect();
  const nodes = $$(RV, app);
  if (reduce || !('IntersectionObserver' in window)) { nodes.forEach(n => n.classList.add('in')); return; }
  io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in'); io.unobserve(en.target);
    $$('[data-count]', en.target).forEach(countUp);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  let lastTop = -1, idx = 0;
  nodes.forEach(n => {
    if (n.closest('.rv-skip')) return;
    const top = Math.round(n.getBoundingClientRect().top + window.scrollY);
    idx = Math.abs(top - lastTop) < 40 ? idx + 1 : 0; lastTop = top;
    n.style.setProperty('--d', Math.min(idx, 6) * 70 + 'ms');
    n.classList.add('rv'); io.observe(n);
  });
  $$('.stat-i [data-count]', app).forEach(el => { el.textContent = el.dataset.count; });
}
const _render = render;
window.removeEventListener('hashchange', render);
window.addEventListener('hashchange', () => { _render(); setupReveal(); });
setupReveal();
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act="scrollTo"]'); if (!el) return;
  const tg = document.getElementById(el.dataset.target); if (tg) tg.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
});
})();
