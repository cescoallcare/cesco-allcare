/* app.js — 라우터, 공통 UI(헤더/푸터/모달/검색), 이벤트 */
(function(){
'use strict';
const { C, P, byId, $, $$, esc, ico, img, PH } = window.U;
const PG = window.PAGES, NAV = window.NAV;
const app = $('#app');

/* ── 정적 UI 채우기 ── */
$('#nav').innerHTML = NAV.map(n => `<a href="${n.href}" data-key="${n.key}">${esc(n.label)}</a>`).join('');
$('#drawerLinks').innerHTML = NAV.map(n => `<a class="m" href="${n.href}" data-key="${n.key}" data-act="closeDrawer">${esc(n.label)}${ico('chevron')}</a>`).join('') +
  `<a class="m" href="#/products" data-act="closeDrawer">전체 제품${ico('chevron')}</a><a class="m" href="#/planner" data-act="closeDrawer">플래너 소개${ico('chevron')}</a>`;
$('#drawerTel').innerHTML = ico('phone') + ' ' + esc(C.planner.phone);
$('#drawerTel').href = C.planner.phoneTel;
$('#btnSearch').innerHTML = ico('search'); $('#btnSearch').dataset.act = 'openSearch';
$('#btnMenu').innerHTML = ico('menu'); $('#btnMenu').dataset.act = 'openDrawer';
$('#btnDrawerX').innerHTML = ico('x'); $('#btnSearchX').innerHTML = ico('x'); $('#btnConsultX').innerHTML = ico('x');
$('#searchIco').innerHTML = ico('search');
$('#fab').innerHTML = ico('message') + ' 상담하기';
$('#bottomNav').innerHTML = `
  <a href="#/" data-bn="home">${ico('home')}<span>홈</span></a>
  <a href="#/products" data-bn="products">${ico('box')}<span>제품</span></a>
  <a href="#/finder" data-bn="finder">${ico('compass')}<span>케어찾기</span></a>
  <a href="javascript:void(0)" class="cta" data-act="consult"><span class="pill">${ico('message')}<span>상담</span></span></a>`;

function footerHtml(){
  const c = C.planner;
  return `<div class="container">
    <div class="cols">
      <div><img class="flogo" src="assets/logo/logo-white.png" alt="CESCO Lifecare"><p style="max-width:340px;line-height:1.75">${esc(c.slogan)}<br>공기부터 물, 생활까지. 내 공간에 꼭 필요한 케어를 함께 찾아 드립니다.</p>
        <ul class="contact" style="margin-top:18px">
          <li>${ico('message')} ${esc(c.title)} <b style="color:#fff">${esc(c.name)}</b></li>
          <li>${ico('pin')} ${esc(c.branch)}</li>
          <li>${ico('phone')} <a href="${c.phoneTel}" style="color:#fff;font-weight:700">${esc(c.phone)}</a></li>
          <li>${ico('mail')} <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li></ul></div>
      <div><h4>MENU</h4><ul class="menus">${NAV.map(n => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}<li><a href="#/products">전체 제품</a></li><li><a href="#/planner">플래너 소개</a></li></ul></div>
      <div><h4>CONTACT</h4><ul><li><a href="javascript:void(0)" data-act="consult">맞춤 상담 신청</a></li><li><a href="${c.phoneTel}">전화 상담</a></li><li><a href="${esc(C.kakaoUrl)}" data-act="kakao" target="_blank" rel="noopener">카카오톡 상담</a></li><li><a href="javascript:void(0)" data-act="inbox">이 브라우저의 상담 접수 내역</a></li></ul></div>
    </div>
    <div class="legal">
      <p><b>본 사이트는 세스코 라이프케어 플래너의 상품 안내 및 상담을 위한 페이지입니다.</b></p>
      <p>가격, 월 렌탈료, 계약 조건(의무사용기간·방문주기·약정·위약금 등)은 공식 판매/계약 기준에 따라 달라질 수 있으며, 최종 조건은 계약 시점의 공식 안내를 따릅니다. 표시된 정보는 세스코몰(${esc(C.mallUrl.replace('https://',''))}) 등에서 ${esc(C.priceCheckedAt)}에 확인한 내용과 플래너 제공 가격표(${esc(C.priceTableAt)} 반영)이며, 확인되지 않은 항목은 “상담 시 안내”로 표시했습니다.</p>
      <p>PARTNER PRODUCT(제휴·판매 상품)로 표시된 아롬비(AROMVI) 상품은 세스코 자체 제품이 아닙니다. 상품 이미지는 판매처 게시 이미지를 사용 허락을 받아 사용했으며, 분위기 사진은 Unsplash 무료 라이선스 이미지입니다.</p>
      <p>© CESCO ALL CARE · ${esc(c.branch)} ${esc(c.title)} ${esc(c.name)}. 세스코(CESCO)는 해당 권리자의 상표입니다.</p>
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
const TITLES = { air:'PURE AIR', water:'PURE WATER', life:'HEALING LIFE', business:'BUSINESS CARE', 'home-care':'HOME CARE', rental:'RENTAL', subscribe:'정기배송', best:'BEST', finder:'CARE FINDER', guide:'CARE GUIDE', products:'전체 제품', search:'검색', planner:'플래너 소개' };
let lastPath = null;
function render(){
  const { parts, qs } = parse();
  const [a, b] = parts;
  let html, navKey = a || 'home', title = 'CESCO ALL CARE';
  try {
    switch (a) {
      case undefined: html = PG.home(); navKey = 'home'; break;
      case 'air': case 'water': case 'life': html = PG.sectionPage(a, qs); break;
      case 'products': html = PG.productsPage(qs); navKey = ''; break;
      case 'product': html = PG.productPage(b); { const p = byId[b]; title = p ? p.name : ''; navKey = p ? (p.category === 'air' ? 'air' : p.category === 'water' ? 'water' : 'life') : ''; } break;
      case 'best': html = PG.bestPage(qs); break;
      case 'rental': html = PG.rentalPage(qs); break;
      case 'business': html = PG.businessPage(b); break;
      case 'home-care': html = PG.homeCarePage(b); navKey = 'homecare'; break;
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
  document.title = (TITLES[a] || title) && a ? `${TITLES[a] || title} | 세스코 올케어 CESCO ALL CARE` : '세스코 올케어 (CESCO ALL CARE) | 세스코 라이프케어 SOL 플래너 최영척';
  if (a === 'product' && title) document.title = `${title} | 세스코 올케어`;
  // nav 하이라이트
  $$('#nav a, #drawerLinks a[data-key]').forEach(x => x.classList.toggle('active', x.dataset.key === navKey));
  $$('#bottomNav a[data-bn]').forEach(x => x.classList.toggle('on', x.dataset.bn === (a === undefined ? 'home' : a === 'finder' ? 'finder' : ['products','air','water','life','product','best','rental','subscribe'].includes(a) ? 'products' : '')));
  // sub-bar
  const bar = $('#subBar'); if (bar) { bar.innerHTML = PG.subBarHtml(); bar.classList.toggle('show', !!bar.innerHTML); }
  // 스크롤: 같은 라우트의 필터 변경 시엔 유지
  const key = parts.join('/');
  if (key !== lastPath) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  lastPath = key;
  closeDrawer();
  // 홈 해시앵커
  if (qs.goto) { const el = document.getElementById(qs.goto); if (el) el.scrollIntoView(); }
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

/* ── 상담 모달 ── */
const LS_KEY = 'cescoInquiries';
let ctx = null;
function openConsult(o = {}){
  ctx = o;
  const p = o.product ? byId[o.product] : null;
  let topic = o.topic || '';
  if (p && !topic) topic = p.category === 'air' ? '공기 케어' : p.category === 'water' ? '물 케어 (정수기·샤워·비데)' : p.subscribable ? '정기배송' : p.servicePrices ? '에어컨 크리닝 문의' : p.priceMatrix ? '매트리스 문의' : p.type === 'service' ? '해충 관리' : '생활·위생용품';
  const topics = window.TOPICS;
  $('#consultBody').innerHTML = `<div id="cmForm">
    <span class="eyebrow">CONSULTATION</span>
    <h2 id="cmTitle" class="h3" style="margin:10px 0 6px;font-size:26px">맞춤 상담 신청</h2>
    <p class="muted" style="margin-bottom:20px;font-size:14.5px">${esc(C.planner.title)} ${esc(C.planner.name)}이 확인 후 연락드립니다.<br><b style="color:var(--navy)">“${esc(C.planner.slogan)}”</b></p>
    ${p ? `<div class="pchip">${img(p.image, p.name)}<div><small class="muted">문의 제품</small><br><b>${esc(p.name)}</b></div></div>` : ''}
    <form id="cmF" novalidate>
      <div class="field"><label for="cmName">이름 <i>*</i></label><input class="input" id="cmName" name="name" autocomplete="name" placeholder="홍길동"><span class="err">이름을 입력해 주세요.</span></div>
      <div class="field"><label for="cmPhone">연락처 <i>*</i></label><input class="input" id="cmPhone" name="phone" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000"><span class="err">올바른 연락처를 입력해 주세요.</span></div>
      <div class="field"><label>장소</label><div class="seg"><label><input type="radio" name="kind" value="가정" checked><span>가정</span></label><label><input type="radio" name="kind" value="사업장"><span>사업장</span></label></div></div>
      <div class="field"><label for="cmTopic">상담 주제</label><select class="input" id="cmTopic" name="topic">${topics.map(t => `<option ${t === topic ? 'selected' : ''}>${esc(t)}</option>`).join('')}${topic && !topics.includes(topic) ? `<option selected>${esc(topic)}</option>` : ''}</select></div>
      <div class="field"><label for="cmTime">연락 가능 시간</label><select class="input" id="cmTime" name="time"><option>언제든 괜찮습니다</option><option>오전 (9~12시)</option><option>오후 (12~18시)</option><option>저녁 (18시 이후)</option></select></div>
      <div class="field"><label for="cmMsg">문의 내용</label><textarea class="input" id="cmMsg" name="message" placeholder="공간 크기, 함께 사는 분, 마음 쓰이는 점 등을 편하게 적어 주세요.">${esc(o.msg || '')}</textarea></div>
      <label class="check"><input type="checkbox" id="cmAgree"><span>상담을 위해 이름·연락처를 수집·이용하는 것에 동의합니다. (상담 목적 외에는 사용하지 않습니다) <i style="color:var(--red);font-style:normal">*</i></span></label>
      <div class="field" id="agreeField" style="margin:6px 0 0"><span class="err">개인정보 수집·이용에 동의해 주세요.</span></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit" style="margin-top:14px">상담 신청하기</button>
    </form></div>`;
  $('#consultModal').classList.add('open'); document.body.style.overflow = 'hidden';
  setTimeout(() => $('#cmName') && $('#cmName').focus(), 60);
  $('#cmF').addEventListener('submit', submitForm);
}
function closeConsult(){ $('#consultModal').classList.remove('open'); if (!$('#searchOv.open')) document.body.style.overflow = ''; }

/* 백엔드 연동 자리: C.formEndpoint 를 설정하면 아래 fetch 가 실행됩니다.
   (예: Google Apps Script 웹앱 / Formspree / 자체 API). 미설정 시 이 브라우저 localStorage 에만 저장됩니다. */
async function submitInquiry(rec){
  const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  list.push(rec);
  localStorage.setItem(LS_KEY, JSON.stringify(list));
  // if (C.formEndpoint) {
  //   await fetch(C.formEndpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(rec) });
  // }
  return true;
}
async function submitForm(e){
  e.preventDefault();
  const f = e.target;
  const name = f.name.value.trim(), phone = f.phone.value.trim();
  const okName = name.length >= 2, okPhone = /^[0-9+\-\s()]{9,15}$/.test(phone) && phone.replace(/\D/g, '').length >= 9;
  const agree = $('#cmAgree').checked;
  f.name.closest('.field').classList.toggle('bad', !okName);
  f.phone.closest('.field').classList.toggle('bad', !okPhone);
  $('#agreeField').classList.toggle('bad', !agree);
  if (!okName || !okPhone || !agree) { const bad = $('.field.bad input'); if (bad) bad.focus(); return; }
  const p = ctx && ctx.product ? byId[ctx.product] : null;
  const rec = { id: 'INQ-' + Date.now(), createdAt: new Date().toISOString(), name, phone, kind: f.kind.value, topic: f.topic.value, time: f.time.value, message: f.message.value.trim(),
                product: p ? { id: p.id, name: p.name } : null, page: location.hash || '#/' };
  await submitInquiry(rec);
  $('#consultBody').innerHTML = `<div class="done-view"><span class="okc">${ico('check')}</span><h2 class="h3" style="font-size:26px">상담 신청이 접수되었습니다</h2>
    <p class="muted">${esc(name)}님, 확인 후 입력하신 연락처로 연락드리겠습니다.<br>급하신 경우에는 바로 전화 주세요.</p>
    <div style="background:var(--gray);border-radius:16px;padding:14px;font-size:14px;text-align:left">접수번호 <b>${esc(rec.id)}</b><br>주제 ${esc(rec.topic)}${p ? '<br>제품 ' + esc(p.name) : ''}</div>
    <p style="font-size:12.5px;color:var(--muted)">※ 접수 내용은 현재 이 기기의 브라우저에만 저장됩니다. 빠른 상담이 필요하시면 전화나 카카오톡으로 문의해 주세요.</p>
    <a class="btn btn-navy btn-lg btn-block" href="${C.planner.phoneTel}">${ico('phone')} ${esc(C.planner.phone)} 전화하기</a>
    <button class="btn btn-ghost btn-lg btn-block" data-act="closeConsult">닫기</button></div>`;
}
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
function onScroll(){ if (ticking) return; ticking = true; requestAnimationFrame(() => { header.classList.toggle('scrolled', window.scrollY > 12); ticking = false; }); }
window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const RV = '.section-head, .tile, .concern-card, .pick-card, .pcard, .rcard, .gcard, .benefit, .step-block, .cta-strip, .p-item, .planner .card-img, .consult .inner > *, .stats .stat-i, .faq, .cmp, .notice, .result-hero, .rec-card, .worry-list li';
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
