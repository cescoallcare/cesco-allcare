/* pages.js — 각 화면(라우트) 렌더러 */
(function(){
'use strict';
const { C, P, byId, esc, won, ico, img, catLabel, hasBuy, hasRent, isRent, buyText, rentText, rentHtml, rOpts, hasOpts, minMonth, groupOf, groupProducts, groupedGrid, lowOpt, optLow, rentBasisOf, isLegacyRent, fromInfo, noteLines, RENT_BASIS, RENT_BASIS_SHORT, careShort, badgesFor, productCard, pgrid,
        sectionHead, pageHero, consultStrip, disclaimer, partnerNotice, consultAttrs } = window.U;
const NAVL = window.NAV, CONCERNS = window.CONCERNS, INDUSTRIES = window.INDUSTRIES, HOMECARES = window.HOMECARES, SECTIONS = window.SECTIONS, GUIDES = window.GUIDES, FINDER = window.FINDER;

const pop = p => (p.popularity ? p.popularity.reviews : 0);
const sortPop = list => list.slice().sort((a,b) => pop(b) - pop(a));
const live = p => !p.soldOut;
const q2 = (o) => { const s = Object.keys(o).filter(k => o[k] != null && o[k] !== '' && o[k] !== 'all').map(k => k + '=' + encodeURIComponent(o[k])).join('&'); return s ? '?' + s : ''; };
const chip = (href, label, on, cls='') => `<a class="chip ${cls} ${on?'on':''}" href="${href}" ${on?'aria-current="true"':''}>${esc(label)}</a>`;
const btnConsult = (label='상담하기', extra='', cls='btn btn-primary') => `<button class="${cls}" data-act="consult" ${extra}>${label}</button>`;
const disc = disclaimer;

/* ────────── HOME ────────── */
function home(){
  const c = C.planner;
  const bestTop = sortPop(P.filter(p => live(p) && p.popularity && !p.partner)).slice(0, 4);
  const rentals = P.filter(p => hasOpts(p) && p.category !== 'biz' && !p.bizOnlyRental).slice(0,3);
  const guides = GUIDES.slice(0, 3);
  return `
  <section class="hero">
    <div class="bg">${img('assets/img/hero-living.webp','밝고 정돈된 거실', 'loading="eager" fetchpriority="high"')}</div>
    <div class="container hero-grid">
      <div class="hero-copy">
        <span class="eyebrow on-dark">CESCO ALL CARE</span>
        <h1 class="h1">집마다 깨끗함의 기준이 달라서,<br><em>필요한 케어도 모두 다릅니다.</em></h1>
        <p class="sub">공기부터 물, 생활까지. 우리에게 필요한 케어를 한곳에서.</p>
        <div class="cta"><a class="btn btn-primary btn-lg" href="#/finder">내게 맞는 케어 찾기 ${ico('arrow')}</a><a class="btn btn-glass btn-lg" href="#/products">전체 제품 보기</a></div>
      </div>
      <aside class="hero-card" aria-label="플래너 상담 안내">
        <span class="hc-badge">${ico('shield')} ${esc(c.title)}</span>
        <div class="hc-name"><b>공간을 먼저 살펴보는 상담</b><small>공기 · 물 · 생활 케어 맞춤 안내</small></div>
        <p class="hc-quote">“${esc(c.slogan)}”</p>
        <div class="hc-actions"><a class="btn btn-white" href="${c.phoneTel}">${ico('phone')} ${esc(c.phone)}</a><button class="btn btn-primary" data-act="consult">상담하기</button></div>
      </aside>
    </div>
    <button class="scroll-cue" data-act="scrollTo" data-target="concerns" aria-label="아래로 스크롤"><span></span></button>
  </section>

  <section class="stats-band" aria-label="사이트 구성 한눈에 보기"><div class="container"><div class="stats">
    <div class="stat-i"><span class="si">${ico('box')}</span><b data-count="${P.length}">${P.length}</b><span class="sl">제품·서비스</span></div>
    <div class="stat-i"><span class="si">${ico('wind')}</span><b data-count="3">3</b><span class="sl">케어 라인<br><small>공기 · 물 · 생활</small></span></div>
    <div class="stat-i"><span class="si">${ico('store')}</span><b data-count="${INDUSTRIES.length}">${INDUSTRIES.length}</b><span class="sl">업종별 맞춤 케어</span></div>
    <div class="stat-i"><span class="si">${ico('home')}</span><b data-count="${HOMECARES.length}">${HOMECARES.length}</b><span class="sl">가정 유형별 케어</span></div>
  </div></div></section>

  <section class="section" id="concerns"><div class="container">
    ${sectionHead('WHAT MATTERS', '지금 가장 신경 쓰이는 것은?', '가장 마음에 걸리는 고민을 하나 골라 보세요. 관련 제품과 서비스를 모아 안내해 드립니다.')}
    <div class="grid g4 concern-grid">${CONCERNS.map(k => `
      <a class="concern-card" href="#/concern/${k.id}">${img(k.img, k.name)}<div class="txt"><span class="chip-ico">${ico(k.icon)}</span><h3>${esc(k.name)}</h3><p>${esc(k.sub)}</p></div><span class="go" aria-hidden="true">${ico('arrow')}</span></a>`).join('')}</div>
  </div></section>

  <section class="section gray" id="spaces"><div class="container">
    ${sectionHead('HOME & BUSINESS', '우리 집도, 우리 가게도, 공간에 맞게', '가정은 함께 사는 사람에 따라, 사업장은 업종에 따라 필요한 케어가 달라집니다.')}
    <div class="grid g2">
      <a class="tile" href="#/home-care">${img('assets/img/home-family.webp','가족이 있는 집')}<div class="bd"><span class="en">HOME CARE</span><h3>함께 사는 사람에 따라<br>필요한 케어가 달라집니다</h3><p>BABY · PET · SENIOR · FAMILY · SINGLE &amp; COUPLE</p><span class="link-more" style="color:#fff">홈케어 보기 ${ico('arrow')}</span></div></a>
      <a class="tile" href="#/business">${img('assets/img/biz-cafe.webp','카페')}<div class="bd"><span class="en">BUSINESS CARE</span><h3>업종마다 챙겨야 할<br>위생 포인트가 다릅니다</h3><p>요식업 · 카페 · PC방 · 숙박업 · 병원 · 학원 · 사무실 · 공장 · 매장</p><span class="link-more" style="color:#fff">업종별 케어 보기 ${ico('arrow')}</span></div></a>
    </div>
    <div class="grid g5" style="margin-top:24px">${HOMECARES.map(h => `<a class="pick-card" href="#/home-care/${h.id}"><div class="im">${img(h.img,h.ko)}</div><div class="bd"><span class="en">${esc(h.name)}</span><h3>${esc(h.ko)}</h3></div></a>`).join('')}</div>
  </div></section>

  <section class="section" id="lines"><div class="container">
    ${sectionHead('PURE AIR · PURE WATER · HEALING LIFE', '공기부터 물, 생활까지', '세 가지 라인에서 꼭 필요한 케어만 골라 보세요.')}
    <div class="grid g3">
      <a class="tile" href="#/air">${img(SECTIONS.air.img,'PURE AIR')}<div class="bd"><span class="en">PURE AIR</span><h3>매일 마시는 공기</h3><p>공기청정 · 공기살균 · 스페이스 케어</p><div class="chips"><span>AIR CLEAN</span><span>AIR STERILIZATION</span><span>SPACE CARE</span></div></div></a>
      <a class="tile" href="#/water">${img(SECTIONS.water.img,'PURE WATER')}<div class="bd"><span class="en">PURE WATER</span><h3>매일 마시고 쓰는 물</h3><p>정수기 · 샤워필터 · 비데</p><div class="chips"><span>DRINK</span><span>SHOWER</span><span>BATH</span></div></div></a>
      <a class="tile" href="#/life">${img(SECTIONS.life.img,'HEALING LIFE')}<div class="bd"><span class="en">HEALING LIFE</span><h3>일상의 위생과 청결</h3><p>살균 · 청소 · 위생 · 탈취 · 해충</p><div class="chips"><span>STERILIZE</span><span>CLEAN</span><span>HYGIENE</span><span>FRESH</span><span>BUG CARE</span></div></div></a>
    </div>
  </div></section>

  <section class="section sky" id="best-home"><div class="container">
    ${sectionHead('BEST', '지금 많이 찾는 제품', '리뷰 수를 기준으로 정리했습니다.', `<a class="link-more" href="#/best">BEST 전체 보기 ${ico('chevron')}</a>`)}
    ${pgrid(bestTop, (p,i) => ({ rank: i+1, showReview: true }))}
  </div></section>

  <section class="section" id="rental-home"><div class="container">
    ${sectionHead('RENTAL', '부담은 줄이고<br>관리는 꾸준히 받고 싶다면', '월 렌탈료와 방문 관리를 함께 살펴보세요.', `<a class="link-more" href="#/rental">렌탈 전체 보기 ${ico('chevron')}</a>`)}
    <div class="grid g3">${rentals.map(rentalCardMini).join('')}</div>
    <div class="banner-soft">
      <div><span class="eyebrow">정기배송</span><h3 class="h3">자주 쓰는 생활용품, 매번 다시 주문하지 않아도 됩니다.</h3><p class="muted" style="margin-top:6px">세정제·소독제·탈취제 같은 소모품은 배송주기를 정해 두면 떨어질 걱정이 없습니다.</p></div>
      <a class="btn btn-navy btn-lg" href="#/subscribe">정기배송 주기 정하기 ${ico('arrow')}</a></div>
  </div></section>

  <section class="section gray" id="finder-home"><div class="container">
    <div class="two-col" style="align-items:center">
      <div style="display:grid;gap:18px"><span class="eyebrow">CARE FINDER</span><h2 class="h2">네 가지 질문으로<br>나에게 필요한 케어를</h2>
        <p class="lead">장소, 환경, 고민, 구매 방식. 네 가지만 고르시면 추천 제품과 그 이유를 안내해 드립니다.</p>
        <div><a class="btn btn-primary btn-lg" href="#/finder">케어 찾기 시작 ${ico('arrow')}</a></div></div>
      <div class="grid g2" style="gap:14px">${['장소','환경','고민','구매방식'].map((s,i) => `<div class="benefit"><div class="bi"><b style="font-size:20px">${i+1}</b></div><h3>${s}</h3><p>${['어디에 필요하신가요?','누가, 어떻게 사용하시나요?','가장 마음 쓰이는 점은?','어떤 방식이 편하신가요?'][i]}</p></div>`).join('')}</div>
    </div>
  </div></section>

  <section class="section" id="guide-home"><div class="container">
    ${sectionHead('CARE GUIDE', '알고 고르면 선택이 한결 쉬워집니다', '제품을 고르기 전에 알아 두면 좋은 이야기를 모았습니다.', `<a class="link-more" href="#/guide">가이드 전체 보기 ${ico('chevron')}</a>`)}
    <div class="grid g3">${guides.map(guideCard).join('')}</div>
  </div></section>

  ${consultSection()}
  ${plannerSection()}`;
}

function rentalCardMini(p){
  return `<article class="pcard"><a class="pcard-img" href="#/product/${esc(p.id)}">${img(p.image,p.name)}<span class="badges">${badgesFor(p)}</span></a>
   <div class="pcard-body"><div class="pcard-cat">${esc(catLabel(p))}</div><h3><a href="#/product/${esc(p.id)}">${esc(p.name)}</a></h3>
   <div class="rcard"><div class="bd" style="padding:6px 0 0;grid-column:1/-1;display:grid;gap:4px">${hasOpts(p) ? `<div class="monthly" style="font-size:26px">월 ${won(minMonth(p))}<small>부터 시작</small></div>` : `<div class="monthly" style="font-size:20px">상담 시 안내</div>`}</div></div>
   <div class="pcard-actions"><a class="btn btn-ghost" href="#/product/${esc(p.id)}">렌탈 자세히</a>${btnConsult('렌탈 상담', consultAttrs(p,'렌탈 문의'))}</div></div></article>`;
}
function guideCard(g){
  return `<a class="gcard" href="#/guide/${g.id}"><div class="im">${img(g.img,g.title)}</div><div class="bd"><span class="tg">${esc(g.tag)}</span><h3>${esc(g.title)}</h3><p>${esc(g.excerpt)}</p><span class="meta">읽는 시간 ${esc(g.read)}</span></div></a>`;
}

function consultSection(){
  const c = C.planner;
  return `<section class="consult" id="consult"><div class="container"><div class="inner">
    <div><span class="eyebrow" style="color:#8FD2FF">CONSULTATION</span>
      <h2 class="h2" style="margin-top:14px">무엇이 필요한지 모르겠다면,<br>제가 먼저 살펴보겠습니다.</h2>
      <p class="sig">“${esc(c.slogan)}”</p>
      <p style="margin-top:22px;color:rgba(255,255,255,.75);max-width:520px">공간과 함께 사는 분, 예산, 관리에 들일 수 있는 시간을 먼저 듣고 꼭 필요한 케어만 제안드립니다. 부담 없이 문의해 주세요.</p></div>
    <div class="consult-card"><div class="who"><small>CESCO LIFECARE</small><b>${esc(c.title)}</b></div>
      <a class="tel" href="${c.phoneTel}">${esc(c.phone)}</a>
      <div class="btns"><a class="btn btn-white btn-lg" href="${c.phoneTel}">${ico('phone')} 전화 상담</a>
        <a class="btn kakao btn-lg" href="${esc(C.kakaoUrl)}" target="_blank" rel="noopener" data-act="kakao">${ico('message')} 카카오톡 상담</a>
        <button class="btn btn-primary btn-lg" data-act="consult">맞춤 상담 신청</button></div>
      <small style="color:rgba(255,255,255,.6)">${ico('mail')} ${esc(c.email)}</small></div>
  </div></div></section>`;
}
function plannerSection(){
  const c = C.planner;
  return `<section class="section" id="planner"><div class="container"><div class="planner">
    <div><span class="eyebrow">PLANNER</span><h2 class="h2" style="margin-top:14px">${esc(c.title)}</h2>
      <p class="lead" style="margin-top:14px">제품을 먼저 권하기보다, 공간을 먼저 봅니다.</p>
      <div class="p-list">
        <div class="p-item"><span class="pi">${ico('compass')}</span><div><h3>공간 진단</h3><p>평수, 생활 패턴, 함께 사는 분과 고민을 듣고 어디부터 손댈지 정리합니다.</p></div></div>
        <div class="p-item"><span class="pi">${ico('clipboard')}</span><div><h3>맞춤 추천</h3><p>필요한 것만 골라 렌탈·구매·정기배송 중 맞는 방식으로 제안합니다.</p></div></div>
        <div class="p-item"><span class="pi">${ico('wrench')}</span><div><h3>관리 상담</h3><p>필터 교체, 방문 관리 주기, 소모품 배송까지 사용하는 동안 함께 살핍니다.</p></div></div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:30px"><button class="btn btn-primary btn-lg" data-act="consult">상담하기</button><a class="btn btn-ghost btn-lg" href="${c.phoneTel}">${ico('phone')} ${esc(c.phone)}</a></div></div>
    <div class="pl-card" role="img" aria-label="세스코 라이프케어 SOL 플래너 상담 안내">
      <div class="pl-top"><img src="assets/logo/logo-white.png" alt="" loading="lazy"></div>
      <div class="pl-mid"><span class="pl-ico">${ico('shield')}</span><b>SOL 플래너</b><small>공간을 먼저 살펴보는 맞춤 케어 상담</small></div>
      <ul class="pl-tags"><li>${ico('compass')} 공간 진단</li><li>${ico('clipboard')} 맞춤 추천</li><li>${ico('wrench')} 관리 상담</li></ul>
    </div>
  </div></div></section>`;
}
function plannerPage(){ return pageHero({eyebrow:'PLANNER', title:'세스코 라이프케어<br>SOL 플래너', lead:esc(C.planner.slogan), img:'assets/img/team-office.webp', crumbs:[{label:'플래너 소개'}]}) + plannerSection() + consultSection(); }

/* ────────── 제품 섹션 (air / water / life) ────────── */
function sectionPage(key, qs){
  const S = SECTIONS[key];
  const sub = qs.sub || 'all', space = qs.space || 'all';
  let list = P.filter(p => key === 'life' ? (p.sections||[]).some(s => s.startsWith('healing.')) : (p.sections||[]).some(s => s.startsWith(key + '.')));
  if (key === 'air') list = list.concat(P.filter(p => !list.includes(p) && (groupOf(p) || {}).family === 'air'));   // 핸드·바디 드라이어 등 에어케어 그룹 상품
  const secGroups = groupProducts(list, key).map(x => x.g);
  const gsub = sub.startsWith('g-') ? sub.slice(2) : null;
  if (gsub) list = list.filter(p => (groupOf(p, key) || {}).id === gsub);
  else if (sub !== 'all') list = list.filter(p => p.sections.includes(sub));
  if (key === 'air' && space !== 'all') list = list.filter(p => (p.spaceKeys||[]).includes(space));
  const base = '#/' + key;
  const subChips = [['all', '전체']].concat(secGroups.map(g => ['g-' + g.id, g.label])).map(s => chip(base + q2({sub:s[0], space: key==='air'?space:null}), s[1], sub===s[0])).join('');
  const spaceChips = key === 'air' ? `<div class="chipbar"><span class="label">공간</span>${S.space.map(s => chip(base + q2({sub, space:s[0]}), s[1], space===s[0], 'blue')).join('')}</div>` : '';
  const gd = secGroups.find(g => 'g-' + g.id === sub);
  const desc = gd && gd.desc ? `<p class="muted" style="margin:0 0 18px">${esc(gd.desc)}</p>` : S.subDesc[sub] ? `<p class="muted" style="margin:0 0 18px">${esc(S.subDesc[sub])}</p>` : '';
  return pageHero({eyebrow:S.title, title:S.headline, lead:'', img:S.img, crumbs:[{label:S.title}],
      actions:`<a class="btn btn-white" href="#/finder">내게 맞는 케어 찾기</a><button class="btn btn-line-w" data-act="consult">상담하기</button>`}) + `
  <section class="section" style="padding-top:48px"><div class="container">
    <div class="chipbar"><span class="label">카테고리</span>${subChips}</div>
    ${spaceChips}${desc}
    <div class="muted" style="margin-bottom:18px;font-size:14px" id="cnt"><b style="color:var(--navy)">${list.length}</b>개 제품</div>
    ${key === 'water' && (sub === 'all' || sub === 'water.shower' || sub === 'g-water-shower') ? `<div style="margin-bottom:22px">${partnerNotice()}</div>` : ''}
    ${groupedGrid(list, key)}
    <div style="margin-top:36px">${disc()}</div>
    ${consultStrip('', '', key === 'air' ? '공기 케어' : key === 'water' ? '물 케어 (정수기·샤워·비데)' : '생활·위생용품')}
  </div></section>`;
}

/* ────────── 전체 제품 ────────── */
function productsPage(qs){
  const cat = qs.cat || 'all', f = qs.f || 'all', gsel = qs.g || 'all';
  const cats = [['all','전체'],['air','PURE AIR'],['water','PURE WATER'],['life','HEALING LIFE'],['service','서비스·진단'],['biz','사업장']];
  const fs = [['all','전체'],['rent','렌탈 가능'],['sub','정기배송 가능'],['buy','구매 가능'],['partner','제휴·판매']];
  let list = P.slice();
  if (cat === 'life') list = list.filter(p => p.category === 'life' || p.category === 'pest');
  else if (cat === 'service') list = list.filter(p => p.type === 'service');
  else if (cat === 'biz') list = list.filter(p => p.audience === 'biz' || p.bizFit || p.category === 'biz');
  else if (cat !== 'all') list = list.filter(p => p.category === cat);
  if (cat === 'air') list = list.concat(P.filter(p => !list.includes(p) && (groupOf(p) || {}).family === 'air'));   // 핸드·바디 드라이어 등 에어케어 그룹 상품
  if (f === 'rent') list = list.filter(p => p.rentalMonthly);
  if (f === 'sub') list = list.filter(p => p.subscribable);
  if (f === 'buy') list = list.filter(hasBuy);
  if (f === 'partner') list = list.filter(p => p.partner);
  const fam = cat === 'air' || cat === 'water' ? cat : cat === 'life' ? 'life' : null;
  const gList = fam ? groupProducts(list, fam).map(x => x.g) : [];
  if (fam && gsel !== 'all') list = list.filter(p => (groupOf(p, fam) || {}).id === gsel);
  const gChips = fam ? `<div class="chipbar"><span class="label">세부 분류</span>${[['all','전체']].concat(gList.map(g => [g.id, g.label])).map(c => chip('#/products'+q2({cat,f,g:c[0]}), c[1], gsel===c[0], 'blue')).join('')}</div>` : '';
  return pageHero({eyebrow:'ALL PRODUCTS', title:'전체 제품', lead:'세스코 제품과 제휴·판매 상품을 한곳에 모았습니다.', img:'assets/img/living-plants.webp', crumbs:[{label:'제품'}]}) + `
  <section class="section" style="padding-top:48px"><div class="container">
    <div class="chipbar"><span class="label">분류</span>${cats.map(c => chip('#/products'+q2({cat:c[0],f}), c[1], cat===c[0])).join('')}</div>
    ${gChips}
    <div class="chipbar"><span class="label">조건</span>${fs.map(c => chip('#/products'+q2({cat,f:c[0],g:fam?gsel:null}), c[1], f===c[0], 'blue')).join('')}</div>
    <div class="muted" style="margin:6px 0 18px;font-size:14px"><b style="color:var(--navy)">${list.length}</b>개 제품</div>
    ${groupedGrid(list, fam)}
    <div style="margin-top:36px">${disc()}</div>
  </div></section>`;
}

/* ────────── 렌탈 옵션 / 가격표 블록 ────────── */
const OS = {};   // 상품별 선택 상태 {v, p, c} (타입, 의무사용기간, 방문주기)
const won0 = n => n == null ? '<span class="muted">-</span>' : won(n);
const optKey = o => [o.variant || '', o.periodLabel, o.visit];
function optSel(p){
  const o = rOpts(p);
  let s = OS[p.id];
  const hit = s && o.find(x => (x.variant||'') === s.v && x.periodLabel === s.p && x.visit === s.c);
  if (hit) return { s, cur: hit };
  const lo = lowOpt(p), best = (lo && lo.o) || o[0];
  s = { v: best.variant || '', p: best.periodLabel, c: best.visit }; OS[p.id] = s;
  return { s, cur: best };
}
function optPick(id, k, val){
  const p = byId[id]; if (!p) return;
  const o = rOpts(p), { s } = optSel(p);
  const t = { v: s.v, p: s.p, c: s.c }; t[k] = val;
  // 바꾼 항목은 고정하고, 나머지는 가능한 한 유지(안 되면 가장 가까운 옵션)
  const pri = k === 'v' ? ['v','p','c'] : k === 'p' ? ['p','v','c'] : ['c','v','p'];
  const f = { v: x => (x.variant||'') === t.v, p: x => x.periodLabel === t.p, c: x => x.visit === t.c };
  let pool = o.slice();
  for (const key of pri) { const next = pool.filter(f[key]); if (next.length) pool = next; else if (key === k) return; }
  const x = pool[0]; OS[id] = { v: x.variant || '', p: x.periodLabel, c: x.visit };
}
function optRowPick(id, i){ const p = byId[id], x = p && rOpts(p)[i]; if (x) OS[id] = { v: x.variant || '', p: x.periodLabel, c: x.visit }; }
const pLabel = l => l === '-' ? '기간 미표기(-)' : l;
function rentalOptBlock(p){
  const o = rOpts(p), { s, cur } = optSel(p);
  const hasVar = o.some(x => x.variant);
  const btn = (k, val, label, on) => `<button type="button" class="chip ${on ? 'on' : ''}" data-act="rOpt" data-id="${esc(p.id)}" data-k="${k}" data-v="${esc(val)}" aria-pressed="${on}">${esc(label)}</button>`;
  const uniq = (arr) => Array.from(new Set(arr));
  const vars = uniq(o.map(x => x.variant || ''));
  const periods = uniq(o.filter(x => (x.variant||'') === s.v).map(x => x.periodLabel));
  const visits = uniq(o.filter(x => (x.variant||'') === s.v && x.periodLabel === s.p).map(x => x.visit));
  const col = f => o.some(x => x[f] != null);
  const step = (k, sub, v, cls='') => v == null ? '' : `<div class="lad ${cls}"><div class="k">${k}${sub ? `<small>${sub}</small>` : ''}</div><div class="v">${won(v)}</div></div>`;
  const cur_ = cur, curLow = optLow(cur_), gLow = lowOpt(p), isLowest = !!(gLow && gLow.o === cur_);
  const notes = [];
  o.forEach(x => { if (x.note) notes.push({ lines: noteLines(x.note), where: [x.variant, x.periodLabel === '-' ? '' : x.periodLabel, x.visit].filter(Boolean).join(' · ') }); });
  const head = ['의무사용기간', '방문주기'].concat(hasVar ? ['타입'] : []).concat(['월 렌탈료']).concat(notes.length ? ['비고'] : []);
  return `<div class="rent-opt" id="rentOpt">
    <h3 class="h3" style="font-size:20px">렌탈 옵션 선택</h3>
    <p class="muted" style="font-size:13px;margin-top:4px">의무사용기간${hasVar ? '·타입' : ''}·방문주기를 고르면 월 렌탈료가 바뀝니다. 표시 금액은 월 렌탈료(원)입니다.</p>
    ${hasVar ? `<div class="opt-group"><span class="lbl">타입 <small>(가격표에 같은 제품명이 여러 세트로 있어 구분용으로 붙인 중립 라벨)</small></span><div class="chips-row">${vars.map(v => btn('v', v, v || '기본', v === s.v)).join('')}</div></div>` : ''}
    <div class="opt-group"><span class="lbl">의무사용기간</span><div class="chips-row">${periods.map(v => btn('p', v, pLabel(v), v === s.p)).join('')}</div></div>
    <div class="opt-group"><span class="lbl">방문주기</span><div class="chips-row">${visits.map(v => btn('c', v, v, v === s.c)).join('')}</div></div>
    <div class="opt-card" aria-live="polite">
      <div class="sel">선택한 옵션 · ${esc([cur_.variant, pLabel(cur_.periodLabel), '방문 ' + cur_.visit].filter(Boolean).join(' · '))}${isLowest ? ' <span class="low-tag">최저가 옵션</span>' : ''}</div>
      <div class="ladder">
        ${curLow ? step('월 렌탈료' + (curLow.label ? '' : ''), curLow.label, curLow.price, 'mid') : '<div class="lad mid"><div class="k">월 렌탈료</div><div class="v">상담 시 안내</div></div>'}
      </div>
      ${cur_.note ? `<ul class="opt-notes">${noteLines(cur_.note).map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    </div>
    ${notes.length ? `<div class="notice opt-note-all">${ico('info')}<div><b>비고 (가격표 표기)</b>${notes.map(n => `<div>${n.where ? `<small class="muted">[${esc(n.where)}]</small> ` : ''}${n.lines.map(esc).join(' · ')}</div>`).join('')}</div></div>` : ''}
    <details class="opt-all" ${o.length <= 8 ? 'open' : ''}><summary>전체 옵션 가격표 보기 (${o.length}행)</summary>
      <div class="opt-scroll"><table class="ptbl"><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${o.map((x, i) => `<tr class="${x === cur_ ? 'on' : ''}${gLow && gLow.o === x ? ' low' : ''}" data-act="rOptRow" data-id="${esc(p.id)}" data-i="${i}" tabindex="0" title="이 옵션 선택">
        <td>${esc(pLabel(x.periodLabel))}</td><td>${esc(x.visit)}</td>${hasVar ? `<td>${esc(x.variant || '-')}</td>` : ''}<td class="n hl">${(() => { const l = optLow(x); return l ? won(l.price) + (l.label ? `<small class="kl">${esc(l.label)}</small>` : '') + (gLow && gLow.o === x ? '<span class="low-tag">최저</span>' : '') : '상담 시 안내'; })()}</td>${notes.length ? `<td class="nt">${x.note ? noteLines(x.note).map(esc).join('<br>') : ''}</td>` : ''}</tr>`).join('')}</tbody></table></div>
      <p class="muted" style="font-size:12.5px;margin-top:8px">월 렌탈료는 프로모션·제휴카드 등 적용 조건에 따라 달라질 수 있습니다. 적용 조건은 상담 시 확인해 주세요.</p></details>
  </div>`;
}
function matrixBlock(p){
  const m = p.priceMatrix;
  return `<div class="rent-opt"><h3 class="h3" style="font-size:20px">${esc(m.title)}</h3><p class="muted" style="font-size:13px;margin-top:4px">단위: 원 · ${esc(m.note)}</p>
    <div class="opt-scroll"><table class="ptbl mx"><thead><tr><th>${esc(m.rowHeader)}</th>${m.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${m.rows.map(r => `<tr><th>${esc(r.label)}</th>${r.values.map(v => `<td class="n">${won0(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="notice" style="margin-top:12px">${ico('info')}<div>구성·사양·배송/설치 조건은 가격표에 없어 <b>상담 시 안내</b>해 드립니다. 상담 신청 후 확인해 주세요.</div></div></div>`;
}
function serviceBlock(p){
  const s = p.servicePrices, fmtC = r => [r.g2, r.g3, r.detail].filter(x => x && x !== '-').join(' · ');
  const groups = [['base', '구분별 가격'], ['outdoor', '실외기'], ['bulk', '기업 (100대 이상) 정기세척관리'], ['extra', '옵션 추가금 (대당 가격)']];
  return `<div class="rent-opt"><h3 class="h3" style="font-size:20px">${esc(s.title)}</h3><p class="muted" style="font-size:13px;margin-top:4px">단위: 원 · ${esc(s.note)}</p>
    ${groups.map(([k, title]) => { const rs = s.rows.filter(r => r.kind === k); if (!rs.length) return '';
      const q4 = rs.some(r => r.q4Special != null);
      return `<h4 class="opt-h4">${esc(title)}</h4><div class="opt-scroll"><table class="ptbl svc"><thead><tr><th>구분</th><th>세부</th>${k === 'extra' ? '<th>대당 추가금</th>' : `<th>${esc(s.colOffPeak)}</th>${q4 ? `<th>${esc(s.colQ4)}</th>` : ''}`}</tr></thead><tbody>${rs.map(r => `<tr><td>${esc(r.g1)}</td><td>${esc(fmtC(r)) || '-'}</td><td class="n hl">${won0(r.offPeak)}</td>${k === 'extra' ? '' : (q4 ? `<td class="n">${won0(r.q4Special)}</td>` : '')}</tr>`).join('')}</tbody></table></div>`; }).join('')}
    <div class="notice" style="margin-top:12px">${ico('info')}<div>이 서비스는 <b>상담 후 일정·견적을 확정</b>합니다. ‘4분기 특판가’는 가격표상 20~100대 기준 가격이며, 대수·현장 조건은 상담 시 확인해 주세요.</div></div></div>`;
}
function rentalBlockHtml(p){ return hasOpts(p) ? rentalOptBlock(p) : p.priceMatrix ? matrixBlock(p) : p.servicePrices ? serviceBlock(p) : ''; }

/* ────────── 상품 상세 ────────── */
function productPage(id){
  const p = byId[id];
  if (!p) return notFound();
  const rows = [];
  rows.push(['카테고리', catLabel(p)]);
  rows.push(['사용공간', p.spaces || '상담 시 안내']);
  rows.push(['권장대상', (p.targets||[]).join(' · ') || '상담 시 안내']);
  if (p.model) rows.push(['모델명', p.model]);
  rows.push(['관리방식', p.careMethod || careShort(p)]);
  if (p.filterInfo) rows.push(['필터교체', p.filterInfo]);
  if (hasOpts(p)) {
    const ps = Array.from(new Set(rOpts(p).map(o => o.periodLabel)));
    rows.push(['의무사용기간', ps.map(x => x === '-' ? '미표기(-)' : x).join(' / ') + ' (옵션별, 아래 선택)']);
  } else if (p.rentalMonthly && !isLegacyRent(p)) { rows.push(['계약기간', `의무사용 ${p.rentalContractMonths||36}개월` + ((p.rentalYears||[]).length ? ` · 약정 ${p.rentalYears.join('/')}년 선택 가능` : '')]); }
  if ((p.visitCycles||[]).length) rows.push(['방문주기', p.visitCycles.join(' / ')]);
  rows.push(['정기배송', p.subscribable ? '가능 · 주기 ' + p.subCycles.join(' / ') : (p.partner ? '해당 없음' : '해당 없음(상담 시 안내)')]);
  const fi = fromInfo(p);
  const showBuyRow = !isRent(p) && !(fi && fi.kind === 'from');
  const buyBtn = hasBuy(p) ? `<a class="btn btn-navy btn-lg" href="${esc(p.buyUrl)}" target="_blank" rel="noopener">${esc(p.buyLabel || '구매하기')} ${ico('external')}</a>` : '';
  const rentBtn = hasRent(p) ? btnConsult('렌탈 문의', consultAttrs(p,'렌탈 문의'), 'btn btn-ghost btn-lg') : '';
  const subBtn = p.subscribable ? `<a class="btn btn-ghost btn-lg" href="#/subscribe?add=${esc(p.id)}">정기배송 주기 정하기</a>` : '';
  const rel = P.filter(x => x.id !== p.id && live(x) && (x.sections||[])[0] && (p.sections||[]).some(s => x.sections.includes(s))).slice(0, 4);
  const relList = rel.length ? rel : P.filter(x => x.id !== p.id && x.category === p.category && live(x)).slice(0,4);
  return `
  <section class="section" style="padding-top:calc(var(--header-h) + 28px)"><div class="container">
    <nav class="crumbs" style="color:var(--muted)"><a href="#/" style="color:var(--muted)">HOME</a> <span>/</span> <a href="#/products" style="color:var(--muted)">제품</a> <span>/</span> ${esc(catLabel(p))}</nav>
    <div class="detail" style="margin-top:18px">
      <div class="gallery">${img(p.image, p.name, 'loading="eager"')}</div>
      <div class="info">
        <div style="display:grid;gap:12px">
          <div class="tag-list">${p.partner ? `<span class="badge partner" style="box-shadow:none">PARTNER PRODUCT · 제휴·판매 상품</span>` : ''}${p.rentalMonthly ? '<span class="tag">렌탈 가능</span>' : ''}${p.priceMatrix ? '<span class="tag">규격·등급별 가격표</span>' : ''}${p.servicePrices ? '<span class="tag">방문 서비스 · 상담 후 견적</span>' : ''}${p.subscribable ? '<span class="tag">정기배송 가능</span>' : ''}${p.soldOut ? '<span class="tag" style="background:#FFF3E0;color:#B45309">판매처 품절 표시</span>' : ''}${p.bizOnlyRental ? '<span class="tag">사업자용 렌탈</span>' : ''}</div>
          <span class="eyebrow">${esc(catLabel(p))}</span>
          <h1>${esc(p.name)}</h1>
          <p class="lead" style="font-size:17px">${esc(p.description)}</p>
        </div>
        <div class="pricebox">
          ${fi && fi.kind === 'from' ? `<div class="row"><span class="k">${esc(fi.label)}</span><span class="v">${won(fi.price)}<small>부터</small></span></div><div class="note">${esc(fi.basis)}</div>` : ''}
          ${showBuyRow ? `<div class="row"><span class="k">구매가격</span><span class="v ${p.buyPrice==null?'ask':''}">${p.buyPrice != null ? won(p.buyPrice) + (p.pricePrefix ? `<small>${esc(p.pricePrefix)}</small>` : '') : '상담 시 안내'}</span></div>` : ''}
          ${hasOpts(p) && minMonth(p) != null ? `<div class="row"><span class="k">렌탈료</span><span class="v blue">월 ${won(minMonth(p))}<small>부터 시작</small></span></div><div class="note">아래에서 의무사용기간·방문주기별 월 렌탈료를 선택해 확인하세요.</div>` : ''}
          ${!hasOpts(p) && (p.rentalMonthly != null || p.rentalInquire) ? `<div class="row"><span class="k">월 렌탈료</span><span class="v ask">상담 시 안내</span></div>` : ''}
          ${!isRent(p) && p.nonMemberPrice && p.nonMemberPrice !== p.buyPrice ? `<div class="note">비회원가 ${won(p.nonMemberPrice)}</div>` : ''}
          ${p.rentalNote && !isLegacyRent(p) ? `<div class="note">${esc(p.rentalNote)}</div>` : ''}
        </div>
        ${rentalBlockHtml(p)}
        <div class="btn-stack">${buyBtn}${rentBtn}${subBtn}${btnConsult('상담하기', consultAttrs(p), 'btn btn-primary btn-lg')}</div>
        ${p.partner ? partnerNotice() : ''}
        ${p.soldOut ? `<div class="notice warn">${ico('info')}<div>현재 품절로 표시된 상품입니다. 재입고·대체 상품은 상담으로 안내해 드립니다.</div></div>` : ''}
        ${p.rentalMonthly && p.bizOnlyRental ? `<div class="notice warn">${ico('info')}<div>사업자 대상 렌탈 상품입니다(가정용 렌탈 중단). 자세한 조건은 상담 시 안내해 드립니다.</div></div>` : ''}
        <div><h3 class="h3" style="font-size:20px;margin-bottom:12px">핵심 특징</h3><ul class="feat-list">${(p.features||[]).map(f => `<li>${ico('check')}<span>${esc(f)}</span></li>`).join('')}</ul></div>
        <div><h3 class="h3" style="font-size:20px;margin-bottom:8px">상세 정보</h3><table class="spec-table"><tbody>${rows.map(r => `<tr><th>${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div>
        ${!isRent(p) && ((p.buyOptions||[]).length > 1 || (p.buyOptions||[]).length === 1 && p.buyOptions[0].price !== p.buyPrice) ? `<div><h3 class="h3" style="font-size:20px;margin-bottom:8px">구매 옵션</h3><table class="opt-table"><tbody>${p.buyOptions.map(o => `<tr><td>${esc(o.label)}</td><td>${won(o.price)}</td></tr>`).join('')}</tbody></table></div>` : ''}
        ${p.detailNote ? `<div class="notice">${ico('info')}<div>${esc(p.detailNote)}</div></div>` : ''}
        <div class="muted" style="font-size:13px;line-height:1.7">가격·조건은 변동될 수 있습니다.</div>
      </div>
    </div>
    <div style="margin-top:72px">${sectionHead('RELATED', '함께 살펴보면 좋은 제품', '')}${pgrid(relList)}</div>
    <div style="margin-top:44px">${disc()}</div>
  </div></section>`;
}

/* ────────── BEST ────────── */
function bestPage(qs){
  const cat = qs.cat || 'all';
  const cats = [['all','전체'],['air','공기'],['water','물'],['life','생활'],['hygiene','위생'],['biz','사업장']];
  const test = {
    air: p => p.category === 'air', water: p => p.category === 'water',
    life: p => ['healing.clean','healing.everyday','healing.fresh','healing.bug'].some(s => (p.sections||[]).includes(s)),
    hygiene: p => ['healing.sterilize','healing.hygiene'].some(s => (p.sections||[]).includes(s)),
    biz: p => p.audience === 'biz' || p.bizFit || p.category === 'biz'
  };
  let list = P.filter(p => live(p) && p.popularity && !p.partner);
  if (cat !== 'all') list = list.filter(test[cat]);
  list = sortPop(list).slice(0, 12);
  return pageHero({eyebrow:'BEST', title:'지금 많이 찾는 제품', lead:'리뷰 수가 많은 순서로 정리했어요.', img:'assets/img/living-warm.webp', crumbs:[{label:'BEST'}]}) + `
  <section class="section" style="padding-top:48px"><div class="container">
    <div class="chipbar"><span class="label">카테고리</span>${cats.map(c => chip('#/best'+q2({cat:c[0]}), c[1], cat===c[0])).join('')}</div>
    <p class="muted" style="margin-bottom:18px;font-size:14px">순위는 판매량이 아닌 <b>리뷰 수</b> 기준의 참고 자료입니다.</p>
    ${pgrid(list, (p,i) => ({rank:i+1, showReview:true}))}
    <div style="margin-top:36px">${disc()}</div>
  </div></section>`;
}

/* ────────── RENTAL ────────── */
function rentalPage(qs){
  const cat = qs.cat || 'all';
  const cats = [['all','전체'],['air','공기'],['water','물·욕실'],['biz','사업장·기타']];
  let list = P.filter(p => p.rentalMonthly);
  if (cat === 'air') list = list.filter(p => p.category === 'air');
  else if (cat === 'water') list = list.filter(p => p.category === 'water');
  else if (cat === 'biz') list = list.filter(p => p.category !== 'air' && p.category !== 'water');
  const card = p => {
    if (hasOpts(p)) {
      const o = rOpts(p), lo = lowOpt(p), best = (lo && lo.o) || o[0];
      const periods = Array.from(new Set(o.map(x => x.periodLabel))).filter(x => x !== '-').join(' / ') || '미표기';
      const vars = Array.from(new Set(o.map(x => x.variant).filter(Boolean)));
      const nt = Array.from(new Set(o.filter(x => x.note).map(x => x.note)));
      return `<article class="rcard"><a class="im" href="#/product/${esc(p.id)}">${img(p.image,p.name)}</a><div class="bd">
      <div class="pcard-cat" style="color:var(--blue);font-weight:800;font-size:11.5px;letter-spacing:.12em">${esc(catLabel(p))}${p.bizOnlyRental ? ' · 사업자용' : ''}</div>
      <h3><a href="#/product/${esc(p.id)}">${esc(p.name)}</a></h3>
      <div class="monthly">${lo ? '월 ' + won(lo.price) + '<small>부터 시작</small>' : '상담 시 안내'}</div>
      <dl><dt>의무사용기간</dt><dd>${esc(periods)}</dd>
      <dt>방문주기</dt><dd>${esc((p.visitCycles||[]).join(' / ') || '상담 시 안내')}</dd>
      ${vars.length ? `<dt>타입</dt><dd>${esc(vars.join(' / '))} (가격표 세트 구분)</dd>` : ''}
      <dt>옵션 수</dt><dd>${o.length}개 (상세에서 선택)</dd>
      ${nt.length ? `<dt>비고</dt><dd>${nt.map(n => esc(noteLines(n).join(' · '))).join('<br>')}</dd>` : ''}</dl>
      <div class="actions"><a class="btn btn-ghost" href="#/product/${esc(p.id)}">옵션·가격표 보기</a>${btnConsult('렌탈 상담하기', consultAttrs(p,'렌탈 문의'))}</div></div></article>`;
    }
    return `<article class="rcard"><a class="im" href="#/product/${esc(p.id)}">${img(p.image,p.name)}</a><div class="bd">
      <div class="pcard-cat" style="color:var(--blue);font-weight:800;font-size:11.5px;letter-spacing:.12em">${esc(catLabel(p))}${p.bizOnlyRental ? ' · 사업자용' : ''}</div>
      <h3><a href="#/product/${esc(p.id)}">${esc(p.name)}</a></h3>
      <div class="monthly" style="font-size:22px">상담 시 안내</div>
      <dl>
      <dt>관리방식</dt><dd>${esc(p.careMethod || careShort(p))}</dd>
      <dt>필터교체</dt><dd>${esc(p.filterInfo || (p.category==='air'||p.category==='water' ? '방문 관리 시 안내' : '해당 시 상담 안내'))}</dd>
      <dt>방문주기</dt><dd>${esc((p.visitCycles||[]).join(' / ') || '상담 시 안내')}</dd>
      </dl>
      <div class="actions"><a class="btn btn-ghost" href="#/product/${esc(p.id)}">렌탈 자세히 보기</a>${btnConsult('렌탈 상담하기', consultAttrs(p,'렌탈 문의'))}</div></div></article>`;
  };
  return pageHero({eyebrow:'RENTAL', title:'부담은 줄이고<br>관리는 꾸준히 받고 싶다면', lead:'월 렌탈료 · 의무사용기간 · 방문주기 · 방문 관리를 한눈에 비교하세요.', img:'assets/img/modern-house.webp', crumbs:[{label:'RENTAL'}],
      actions:`<a class="btn btn-white" href="#/finder?mode=rental">나에게 맞는 렌탈 찾기</a><button class="btn btn-line-w" data-act="consult" data-topic="렌탈 문의">렌탈 상담하기</button>`}) + `
  <section class="section" style="padding-top:56px"><div class="container">
    <div class="grid g3" style="margin-bottom:56px">
      <div class="benefit"><span class="bi">${ico('wrench')}</span><h3>방문 관리</h3><p>선택한 방문주기에 맞춰 점검과 필터 교체가 진행됩니다. 내용은 제품과 주기에 따라 다를 수 있습니다.</p></div>
      <div class="benefit"><span class="bi">${ico('calendar')}</span><h3>월 단위 부담</h3><p>초기 비용을 월 단위로 나누어 부담할 수 있습니다. 의무사용기간과 계약 조건은 꼭 확인해 주세요.</p></div>
      <div class="benefit"><span class="bi">${ico('shield')}</span><h3>솔직한 비교</h3><p>월 렌탈료와 의무사용기간별 총 렌탈금액을 미리 비교하실 수 있도록 안내해 드립니다.</p></div></div>
    <div class="chipbar"><span class="label">분류</span>${cats.map(c => chip('#/rental'+q2({cat:c[0]}), c[1], cat===c[0])).join('')}</div>
    <div class="muted" style="margin:6px 0 20px;font-size:14px"><b style="color:var(--navy)">${list.length}</b>개 렌탈 상품 · 가격표 상품은 ‘월 ○○원부터 시작’으로 표시하며, 의무사용기간·방문주기별 월 렌탈료는 상세 페이지에서 확인하실 수 있습니다.</div>
    <div class="grid g2">${list.map(card).join('')}</div>
    <div style="margin-top:72px">${sectionHead('COMPARE', '렌탈 vs 구매, 한눈에 비교', '')}
      <div style="overflow:auto"><table class="cmp"><thead><tr><th></th><th>렌탈</th><th>구매</th></tr></thead><tbody>
        <tr><th>초기 비용</th><td>월 렌탈료로 나누어 부담</td><td>구매 비용을 한 번에 부담(할부 여부는 판매처 기준)</td></tr>
        <tr><th>관리</th><td>선택한 방문주기에 맞춘 방문 관리</td><td>케어십 포함/미포함 옵션에 따라 다름(미포함은 셀프 관리)</td></tr>
        <tr><th>계약</th><td>의무사용기간이 있습니다(상품별로 36·60·72개월 등, 상세 페이지의 옵션표 참고)</td><td>별도 의무사용 없음</td></tr>
        <tr><th>총비용</th><td>월 렌탈료 × 기간 + 조건에 따른 추가 비용 가능</td><td>구매 비용 + 관리 비용(선택)</td></tr>
        <tr><th>이런 분께</th><td>관리를 맡기고 싶은 분, 초기 비용을 줄이고 싶은 분</td><td>오래 쓰고 직접 관리할 수 있는 분</td></tr></tbody></table></div></div>
    <div style="margin-top:72px;max-width:860px">${sectionHead('FAQ', '자주 묻는 질문', '')}
      <details class="faq"><summary>렌탈료는 항상 같은가요?</summary><p>월 렌탈료는 프로모션·제휴카드·약정기간·방문주기에 따라 달라질 수 있습니다. 계약 시점의 공식 조건이 우선합니다.</p></details>
      <details class="faq"><summary>중도 해지나 이전 설치는 어떻게 되나요?</summary><p>계약 조건에 따라 다릅니다. 정확한 위약금·이전 설치 조건은 계약서 기준으로 확인이 필요하며, 상담 시 함께 짚어 드립니다.</p></details>
      <details class="faq"><summary>필터 교체는 누가 하나요?</summary><p>렌탈은 방문 관리 시 교체·점검이 함께 안내됩니다. 일부 필터는 자가교체이므로 제품 상세의 필터교체 항목을 확인해 주세요.</p></details>
      <details class="faq"><summary>가정에서도 사업장용 렌탈을 쓸 수 있나요?</summary><p>일부 제품(예: 에어제닉 Max)은 사업자 대상입니다. 조건은 상담으로 확인해 드립니다.</p></details>
    </div>
    <div style="margin-top:44px">${disc()}</div>
    ${consultStrip('나에게 맞는 렌탈, 함께 찾아볼까요?', '견적서보다 처방전을 먼저 씁니다.', '렌탈 문의')}
  </div></section>`;
}

/* ────────── BUSINESS / HOME CARE ────────── */
function careTable(picks){
  const items = picks.map(id => byId[id]).filter(Boolean).filter(p => p.rentalMonthly != null || p.priceMatrix || p.servicePrices || p.buyPrice != null);
  if (!items.length) return '';
  const cell = p => {
    if (hasOpts(p) && minMonth(p) != null) return '월 ' + won(minMonth(p)) + '<small class="muted">부터 시작</small>';
    if (p.rentalMonthly != null) return '<span class="muted">상담 시 안내</span>';
    return '<span class="muted">-</span>'; };
  const buyCell = p => { const f = fromInfo(p);
    if (isRent(p)) return '<span class="muted">-</span>';
    if (p.buyPrice != null) return won(p.buyPrice) + (p.pricePrefix ? ' ' + p.pricePrefix : '');
    if (f && f.kind === 'from') return won(f.price) + '<small class="muted"> 부터</small>';
    return '<span class="muted">상담 시 안내</span>'; };
  return `<div style="overflow:auto;margin-top:18px"><table class="cmp"><thead><tr><th>추천 제품</th><th>월 렌탈료</th><th>구매가</th></tr></thead><tbody>${items.map(p => `<tr><td><a class="link-more" href="#/product/${esc(p.id)}" style="text-align:left">${esc(p.name)}</a></td><td>${cell(p)}</td><td>${buyCell(p)}</td></tr>`).join('')}</tbody></table></div>`;
}
function careDetail(x, kind){
  const picks = x.picks.map(id => byId[id]).filter(Boolean);
  const isBiz = kind === 'biz';
  const title = isBiz ? `${x.name} 맞춤 케어` : `${x.ko} <span style="opacity:.8">· ${x.name}</span>`;
  return pageHero({eyebrow: isBiz ? 'BUSINESS CARE · ' + x.en : 'HOME CARE · ' + x.name, title, lead: esc(x.summary), img: x.img,
      crumbs:[{label: isBiz ? 'BUSINESS CARE' : 'HOME CARE', href: isBiz ? '#/business' : '#/home-care'}, {label: x.name}],
      actions: `<button class="btn btn-white" data-act="consult" data-topic="${isBiz?'사업장 맞춤 상담':'잘 모르겠어요 (먼저 진단받고 싶어요)'}" data-msg="${esc(x.cta)}">${esc(x.cta)}</button>`}) + `
  <section class="section" style="padding-top:40px"><div class="container">
    <div class="step-block"><div class="step-label"><span class="no">STEP 01</span><h3>주요 고민</h3></div><ul class="worry-list">${x.worries.map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>
    <div class="step-block"><div class="step-label"><span class="no">STEP 02</span><h3>추천 케어</h3></div><div class="care-chips">${x.care.map(w => `<span>${esc(w)}</span>`).join('')}</div></div>
    <div class="step-block" style="grid-template-columns:1fr"><div class="step-label"><span class="no">STEP 03</span><h3>추천 제품</h3></div>${isBiz ? pgrid(picks) : groupedGrid(picks, null)}</div>
    <div class="step-block"><div class="step-label"><span class="no">STEP 04</span><h3>렌탈 / 구매</h3></div><div><p class="lead" style="color:var(--text)">${esc(x.buy)}</p>${careTable(x.picks)}<div style="margin-top:14px"><a class="link-more" href="#/rental">렌탈 상품 전체 보기 ${ico('chevron')}</a></div></div></div>
    <div class="step-block" style="grid-template-columns:1fr"><div class="step-label"><span class="no">STEP 05</span><h3>상담하기</h3></div>
      ${consultStrip((isBiz ? esc(x.name) : esc(x.ko)) + ' 맞춤 케어, 먼저 살펴보겠습니다.', '견적서보다 처방전을 먼저 씁니다. 공간과 상황을 알려 주시면 꼭 필요한 것만 제안드립니다.', isBiz ? '사업장 맞춤 상담' : '잘 모르겠어요 (먼저 진단받고 싶어요)').replace('data-act="consult"', `data-act="consult" data-msg="${esc(x.cta)}"`)}</div>
    <div style="margin-top:30px">${disc()}</div>
  </div></section>`;
}
function businessPage(id){
  if (id) { const x = INDUSTRIES.find(i => i.id === id); return x ? careDetail(x, 'biz') : notFound(); }
  return pageHero({eyebrow:'BUSINESS CARE', title:'업종마다 챙겨야 할 위생 포인트가 다릅니다', lead:'업종을 고르면 주요 고민, 추천 케어, 추천 제품, 렌탈·구매 순서로 안내해 드립니다.', img:'assets/img/biz-restaurant.webp', crumbs:[{label:'BUSINESS CARE'}]}) + `
  <section class="section" style="padding-top:56px"><div class="container">
    <div class="grid g5" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${INDUSTRIES.map(i => `<a class="pick-card" href="#/business/${i.id}"><div class="im">${img(i.img,i.name)}</div><div class="bd"><span class="en">${esc(i.en)}</span><h3>${esc(i.name)}</h3><p>${esc(i.summary)}</p></div></a>`).join('')}</div>
    <div style="margin-top:44px">${disc()}</div>${consultStrip('', '', '사업장 맞춤 상담')}
  </div></section>`;
}
function homeCarePage(id){
  if (id) { const x = HOMECARES.find(i => i.id === id); return x ? careDetail(x, 'home') : notFound(); }
  return pageHero({eyebrow:'HOME CARE', title:'함께 사는 사람에 따라<br>필요한 케어가 달라집니다', lead:'우리 집 상황과 가장 가까운 유형을 골라 보세요.', img:'assets/img/home-family.webp', crumbs:[{label:'HOME CARE'}]}) + `
  <section class="section" style="padding-top:56px"><div class="container">
    <div class="grid g3">${HOMECARES.map(h => `<a class="tile" href="#/home-care/${h.id}">${img(h.img,h.ko)}<div class="bd"><span class="en">${esc(h.name)}</span><h3>${esc(h.ko)}</h3><p>${esc(h.summary)}</p><div class="chips">${h.care.slice(0,4).map(c => `<span>${esc(c)}</span>`).join('')}</div></div></a>`).join('')}</div>
    <div style="margin-top:44px">${disc()}</div>${consultStrip()}
  </div></section>`;
}

/* ────────── 고민(concern) ────────── */
function concernPage(id){
  const k = CONCERNS.find(c => c.id === id);
  if (!k) return notFound();
  const inc = k.include || {};
  const incIds = inc.ids || [], incKw = inc.keywords || [];
  let list = P.filter(p => !p.hidden && ((live(p) && ((p.concerns||[]).includes(id) || incKw.some(w => (p.name||'').includes(w)))) || incIds.includes(p.id)));
  list = list.sort((a,b) => (b.partner?-1:0) - (a.partner?-1:0) || pop(b) - pop(a));
  if (k.order) {   // 고민별 추가 정렬: top(맨 위 고정 ID) → 렌탈 기기 → 그 밖의 서비스·상품 → bottom(키워드가 이름에 있는 소모품). 같은 단계 안에서는 기존 순서 유지
    const top = k.order.top || [], bk = k.order.bottomKeywords || [];
    const tier = p => top.includes(p.id) ? 0 : bk.some(w => (p.name||'').includes(w)) ? 3 : isRent(p) ? 1 : 2;
    list = list.map((p, i) => ({ p, i })).sort((a, b) => tier(a.p) - tier(b.p) || (tier(a.p) === 0 ? top.indexOf(a.p.id) - top.indexOf(b.p.id) : 0) || a.i - b.i).map(x => x.p);
  }
  const topic = { air:'공기 케어', water:'물 케어 (정수기·샤워·비데)', pest:'해충 관리', biz:'사업장 맞춤 상담', clean:'생활·위생용품', sterilize:'생활·위생용품', odor:'생활·위생용품', pet:'공기 케어' }[id];
  return pageHero({eyebrow:'지금 가장 신경 쓰이는 것', title: esc(k.name) + ' — ' + esc(k.sub), lead: esc(k.lead), img: k.img, crumbs:[{label:'고민별 케어'},{label:k.name}],
      actions:`<a class="btn btn-white" href="#/finder">케어 찾기</a><button class="btn btn-line-w" data-act="consult" data-topic="${esc(topic)}">상담하기</button>`}) + `
  <section class="section" style="padding-top:48px"><div class="container">
    <div class="two-col" style="margin-bottom:48px">
      <div><h3 class="h3" style="margin-bottom:14px">이런 고민이라면</h3><ul class="worry-list" style="grid-template-columns:1fr">${k.checks.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
      <div class="benefit" style="align-content:start"><span class="bi">${ico(k.icon)}</span><h3>이렇게 도와드립니다</h3><p style="font-size:16px;color:var(--text)">${esc(k.approach)}</p></div></div>
    ${sectionHead('RECOMMENDED', k.id === 'water' ? '퓨어케어 서비스' : esc(k.name) + ' 관련 제품·서비스', `${list.length}개`)}
    ${k.order ? pgrid(list) : groupedGrid(list, null)}
    <div style="margin-top:36px">${disc()}</div>${consultStrip('', '', topic)}
  </div></section>`;
}

/* ────────── GUIDE ────────── */
function guidePage(id){
  if (!id) return pageHero({eyebrow:'CARE GUIDE', title:'알고 고르면<br>선택이 쉬워집니다', lead:'제품을 고르기 전에 알아 두면 좋은 이야기 ' + GUIDES.length + '가지를 모았습니다.', img:'assets/img/living-plants.webp', crumbs:[{label:'CARE GUIDE'}]}) + `
    <section class="section" style="padding-top:56px"><div class="container"><div class="grid g3">${GUIDES.map(guideCard).join('')}</div>${consultStrip()}</div></section>`;
  const g = GUIDES.find(x => x.id === id); if (!g) return notFound();
  const others = GUIDES.filter(x => x.id !== id).slice(0,3);
  return pageHero({eyebrow:'CARE GUIDE · ' + g.tag, title: esc(g.title), lead: esc(g.excerpt), img: g.img, crumbs:[{label:'CARE GUIDE', href:'#/guide'},{label:g.tag}]}) + `
  <section class="section" style="padding-top:56px"><div class="container">
    <article class="article">
      <p class="muted" style="font-size:14px">읽는 시간 ${esc(g.read)} · 작성: ${esc(C.planner.title)}</p>
      ${g.body.map(b => `<h2>${esc(b[0])}</h2><p>${esc(b[1])}</p>`).join('')}
      <div class="notice" style="margin-top:36px">${ico('info')}<div>이 글은 일반적인 생활 정보이며, 제품 사양·가격·조건은 판매처 공식 기준을 따릅니다. 구체적인 선택은 상담으로 도와드립니다.</div></div>
    </article>
    <div style="margin-top:64px">${sectionHead('RELATED', '글에서 소개한 제품', '')}${pgrid(g.products.map(id => byId[id]).filter(Boolean))}</div>
    <div style="margin-top:44px">${consultStrip('이 글의 내용, 우리 집에는 어떻게 적용될까요?', '', '잘 모르겠어요 (먼저 진단받고 싶어요)')}</div>
    <div style="margin-top:64px">${sectionHead('MORE', '다른 가이드', '')}<div class="grid g3">${others.map(guideCard).join('')}</div></div>
  </div></section>`;
}

/* ────────── SUBSCRIBE (정기배송) ────────── */
const SUB = { cycle: 1, picked: {} };
function subMonthsLabel(m){ return m === 0.46 ? '2주' : m === 0.69 ? '3주' : m === 0.92 ? '4주' : m + '개월'; }
function subscribePage(qs){
  if (qs.add && byId[qs.add] && byId[qs.add].subscribable && !SUB.picked[qs.add]) SUB.picked[qs.add] = byId[qs.add].subRecommend || 1;
  return pageHero({eyebrow:'정기배송', title:'자주 쓰는 생활용품,<br>매번 다시 주문하지 않아도 됩니다.', lead:'배송주기를 정해 두면 필요한 때에 맞춰 받아보실 수 있습니다.', img:'assets/img/couple-kitchen.webp', crumbs:[{label:'정기배송'}]}) + `
  <section class="section" style="padding-top:56px"><div class="container" id="subRoot">${subscribeBody()}</div></section>
  <div class="sub-bar" id="subBar"></div>`;
}
function subscribeBody(){
  const list = P.filter(p => p.subscribable && live(p));
  const cycles = [1,2,3,6];
  const supports = (p, m) => (p.subMonths||[]).includes(m);
  return `
    <div style="margin-bottom:12px"><span class="eyebrow">STEP 1</span><h3 class="h3" style="margin-top:8px">배송주기를 선택하세요</h3></div>
    <div class="cycle-box" role="radiogroup" aria-label="배송주기">${cycles.map(m => `<button class="cycle ${SUB.cycle===m?'on':''}" data-act="subCycle" data-m="${m}" role="radio" aria-checked="${SUB.cycle===m}">${m}개월<small>${m===6?'상담 시 확인':'마다 배송'}</small></button>`).join('')}</div>
    <p class="muted" style="margin:14px 0 40px;font-size:14px">상품별로 지원하는 주기가 다릅니다. 정기배송 옵션은 2주·3주·4주·1~4개월 등이며, <b>6개월 주기는 확인되지 않아</b> 선택 시 상담으로 가능 여부를 확인합니다.</p>
    <div style="margin-bottom:12px"><span class="eyebrow">STEP 2</span><h3 class="h3" style="margin-top:8px">상품별 추천 주기 · ${list.length}개</h3></div>
    <div class="pgrid">${list.map(p => {
      const rec = p.subRecommend, sel = SUB.picked[p.id];
      const ok = supports(p, SUB.cycle);
      return `<article class="pcard scard"><a class="pcard-img" href="#/product/${esc(p.id)}">${img(p.image,p.name)}<span class="badges"><span class="badge sub">정기배송</span></span></a>
      <div class="pcard-body"><div class="pcard-cat">${esc(catLabel(p))}</div><h3><a href="#/product/${esc(p.id)}">${esc(p.name)}</a></h3>
      <div>${rec ? `<span class="recbadge">${ico('sparkle')} 추천 주기 ${subMonthsLabel(rec)}</span>` : ''}</div>
      <dl class="pcard-spec"><div><dt>가격</dt><dd class="${!isRent(p) && p.buyPrice!=null?'price':'ask'}">${esc(isRent(p) ? rentText(p) : buyText(p))}</dd></div><div><dt>지원 주기</dt><dd>${esc((p.subCycles||[]).join(' · '))}</dd></div>
      <div><dt>선택 주기(${SUB.cycle}개월)</dt><dd class="${ok?'rent':'ask'}">${ok ? '지원' : (SUB.cycle===6 ? '상담 시 확인' : '미지원 · 다른 주기 선택')}</dd></div></dl>
      <div class="pcard-actions"><button class="btn ${sel!=null?'btn-navy':'btn-ghost'} pick-toggle" data-act="subToggle" data-id="${esc(p.id)}">${sel!=null ? `✓ ${subMonthsLabel(sel)} 선택됨` : '이 상품 담기'}</button></div></div></article>`;
    }).join('')}</div>
    <div style="margin-top:36px">${disc()}</div>`;
}
function subBarHtml(){
  const ids = Object.keys(SUB.picked);
  if (!ids.length) return '';
  return `<div class="container"><div><b style="color:var(--navy)">${ids.length}개 상품 선택</b><div class="muted" style="font-size:13px">${ids.slice(0,3).map(id => esc(byId[id].name.replace('세스코 마이랩 ','')) + ' (' + subMonthsLabel(SUB.picked[id]) + ')').join(', ')}${ids.length>3?' 외 '+(ids.length-3)+'개':''}</div></div>
   <div style="display:flex;gap:10px"><button class="btn btn-ghost" data-act="subClear">비우기</button><button class="btn btn-primary" data-act="subConsult">정기배송 상담 신청</button></div></div>`;
}

/* ────────── CARE FINDER ────────── */
const FS = { step: 0, place: null, env: [], concern: [], mode: null };
function finderPage(qs){
  if (qs.mode && FINDER.modes.some(m => m.id === qs.mode) && FS.mode !== qs.mode) { FS.step = 0; FS.place = null; FS.env = []; FS.concern = []; FS.mode = qs.mode; }
  return pageHero({eyebrow:'CARE FINDER', title:'4단계로 찾는<br>내게 맞는 케어', lead:'장소 → 환경 → 고민 → 구매방식', img:'assets/img/living-soft.webp', crumbs:[{label:'CARE FINDER'}]}) + `
  <section class="section" style="padding-top:56px"><div class="container"><div class="finder-wrap" id="finderRoot">${finderBody()}</div></div></section>`;
}
function finderBody(){
  const s = FS.step;
  if (s >= 4) return finderResult();
  const bar = `<div class="progress" aria-label="진행 ${s+1}/4">${[0,1,2,3].map(i => `<i class="${i<s?'done':i===s?'cur':''}"></i>`).join('')}</div>`;
  const cfg = [
    { t:'어디에 필요하신가요?', d:'케어가 필요한 장소를 골라 주세요.', k:'place', multi:false, opts: FINDER.places.map(o => [o.id, o.label, o.sub]) },
    { t:'어떤 환경인가요?', d:'해당하는 항목을 모두 골라 주세요. 없으면 건너뛰셔도 됩니다.', k:'env', multi:true, opts: FINDER.envs.map(o => [o.id, o.label, '']) },
    { t:'가장 신경 쓰이는 것은?', d:'하나 이상 골라 주세요.', k:'concern', multi:true, opts: FINDER.concerns.map(o => [o.id, o.label, '']) },
    { t:'어떤 방식이 편하신가요?', d:'구매 방식을 골라 주세요.', k:'mode', multi:false, opts: FINDER.modes.map(o => [o.id, o.label, o.sub]) }
  ][s];
  const cur = FS[cfg.k];
  const isOn = id => cfg.multi ? cur.includes(id) : cur === id;
  const canNext = cfg.k === 'env' ? true : cfg.multi ? cur.length > 0 : !!cur;
  return `${bar}<div class="f-step"><span class="eyebrow">STEP ${s+1} / 4</span><h2 style="margin-top:10px">${cfg.t}</h2><p class="muted">${cfg.d}</p>
    <div class="opt-grid">${cfg.opts.map(o => `<button class="opt ${isOn(o[0])?'on':''}" data-act="fOpt" data-k="${cfg.k}" data-id="${o[0]}" aria-pressed="${isOn(o[0])}"><b>${esc(o[1])}</b>${o[2] ? `<span>${esc(o[2])}</span>` : ''}</button>`).join('')}</div>
    <div class="f-nav">${s>0 ? `<button class="btn btn-ghost btn-lg" data-act="fPrev">이전</button>` : '<span></span>'}<button class="btn btn-primary btn-lg ${canNext?'':'disabled'}" data-act="fNext" ${canNext?'':'disabled'}>${s===3 ? '결과 보기' : (cfg.k==='env' && !cur.length ? '건너뛰기' : '다음')} ${ico('arrow')}</button></div></div>`;
}

function scoreProducts(){
  const place = FINDER.places.find(p => p.id === FS.place) || FINDER.places[1];
  const isBiz = place.type === 'biz';
  const envSet = new Set(FS.env); if (place.size === 'large') envSet.add('large'); if (place.size === 'small') envSet.add('small');
  const sizeMap = { small:['lt10','10-20'], mid:['10-20','20-30'], large:['20-30','30+'], biz:['biz','30+'] };
  const want = sizeMap[place.size];
  const concerns = new Set(FS.concern);
  if (envSet.has('pet')) concerns.add('pet');
  if (envSet.has('smoke')) concerns.add('odor');
  const out = [];
  P.forEach(p => {
    if (p.soldOut) return;
    let sc = 0; const why = [];
    const cm = (p.concerns||[]).filter(c => concerns.has(c));
    const direct = (p.concerns||[]).filter(c => FS.concern.includes(c));
    if (!cm.length && FS.concern.length) return;
    if (!isBiz && (p.audience === 'biz' || p.bizOnlyRental)) return;
    sc += direct.length * 4 + (cm.length - direct.length) * 2;
    if (direct.length) why.push('선택하신 “' + direct.map(c => (FINDER.concerns.find(x => x.id === c) || {label:c}).label).join('·') + '” 고민에 해당하는 제품');
    if (p.category === 'air' && (p.spaceKeys||[]).length) {
      if (p.spaceKeys.some(k => want.includes(k))) { sc += 4; why.push(`${place.label}(${place.sub}) 공간에 맞는 사용 면적(${p.spaces.split('·')[0].trim()})`); }
      else sc -= 5;
    }
    if (p.category === 'water' && (p.spaceKeys||[]).length === 0) {
      if (isBiz && (p.bizFit || p.audience==='biz')) { sc += 2; }
    }
    if (isBiz && (p.bizFit || p.audience === 'biz')) { sc += 3; why.push('사업장에서 많이 검토하는 제품'); }
    if (!isBiz && p.audience === 'both' && p.category === 'water' && place.size === 'small' && /미니|슬림|더슬림|비데/.test(p.name)) sc += 1;
    const em = (p.env||[]).filter(e => envSet.has(e) && !['large','small'].includes(e));
    if (em.length) { sc += em.length * 1.5; why.push('“' + em.map(e => (FINDER.envs.find(x => x.id === e) || {label:e}).label.replace('있어요','').replace('계세요','').trim()).join('·') + '” 환경에 적합(제품 설명 기준)'); }
    const pl = (p.places||[]).includes(isBiz ? 'biz' : 'living'); if (pl) sc += 1;
    if (FS.mode === 'rental') { if (p.rentalMonthly) { sc += 4; why.push(hasOpts(p) ? `월 ${won(minMonth(p))}부터 시작하는 렌탈로 방문 관리 가능` : '렌탈 가능(월 렌탈료는 상담 시 안내)'); } else sc -= 1; }
    else if (FS.mode === 'buy') { if (p.buyPrice != null && !p.partner) { sc += 3; why.push(isRent(p) ? '구매해서 셀프 관리 가능' : `구매가 ${won(p.buyPrice)}${p.pricePrefix?' '+p.pricePrefix:''}`); } else if (p.partner && p.buyPrice != null) { sc += 2; } else sc -= 2; }
    else if (FS.mode === 'sub') { if (p.subscribable) { sc += 6; why.push('정기배송 가능' + (p.subRecommend ? ` · 추천 주기 ${subMonthsLabel(p.subRecommend)}` : '')); } else sc -= 3; }
    if (p.popularity) sc += Math.min(1.5, p.popularity.reviews / 40);
    if (sc > 0) out.push({ p, sc, why, cm });
  });
  out.sort((a,b) => b.sc - a.sc);
  const pick = []; const secCount = {};
  for (const r of out) { const k = (r.p.sections||[r.p.category])[0]; if ((secCount[k]||0) >= 2) continue; secCount[k] = (secCount[k]||0)+1; pick.push(r); if (pick.length >= 5) break; }
  if (pick.length < 3) for (const r of out) { if (!pick.includes(r)) pick.push(r); if (pick.length >= 3) break; }
  return { pick, place };
}
function finderResult(){
  const { pick, place } = scoreProducts();
  const lb = (arr, list) => arr.map(id => (list.find(x => x.id === id) || {label:id}).label).join(' · ') || '선택 없음';
  const mode = FINDER.modes.find(m => m.id === FS.mode);
  const recs = pick.map((r, i) => {
    const p = r.p;
    return `<article class="rec-card"><a class="im" href="#/product/${esc(p.id)}">${img(p.image,p.name)}</a><div class="bd">
      <div style="display:flex;gap:6px;flex-wrap:wrap">${badgesFor(p)}</div>
      <h3 style="font-size:20px;color:var(--navy);font-weight:800;line-height:1.35"><span class="rec-no">${i+1}</span>${esc(p.name)}</h3>
      <div class="why">${ico('sparkle')} 추천 이유 — ${esc(r.why.length ? r.why.join(' / ') : '선택하신 조건과 가장 가까운 제품입니다.')}</div>
      <div style="display:flex;gap:22px;flex-wrap:wrap;font-size:15px">${isRent(p) ? '' : `<span>구매가격 <b style="color:var(--navy)">${esc(buyText(p))}</b></span>`}<span>${fromInfo(p) && fromInfo(p).kind === 'from' ? esc(fromInfo(p).label) + ' <b style="color:var(--blue)">' + esc(fromInfo(p).text) + '</b></span><span>' : ''}렌탈 <b style="color:var(--blue)">${p.rentalMonthly ? '가능 · ' + esc(rentText(p)) : (p.rentalInquire ? '문의' : '해당 없음')}</b></span></div>
      <div class="btn-stack" style="max-width:420px"><a class="btn btn-ghost" href="#/product/${esc(p.id)}">제품 보기</a>${btnConsult('상담하기', consultAttrs(p, 'finder'), 'btn btn-primary').replace('data-topic="finder"','')}</div></div></article>`;
  }).join('');
  return `<div class="result-hero"><span class="eyebrow" style="color:#8FD2FF">RESULT</span><h2 style="margin-top:10px">나에게 필요한 케어</h2>
    <div class="tags"><span>${esc(place.label)} · ${esc(place.sub)}</span><span>${esc(lb(FS.env, FINDER.envs))}</span><span>${esc(lb(FS.concern, FINDER.concerns))}</span><span>${esc(mode ? mode.label : '')}</span></div></div>
    ${pick.length ? `<div style="display:grid;gap:20px">${recs}</div>` : `<div class="empty"><span class="ico-wrap">${ico('compass')}</span><b>꼭 맞는 제품을 찾지 못했습니다</b>조건을 조금 바꾸시거나 상담으로 문의해 주세요.</div>`}
    <div class="f-nav" style="margin-top:34px"><button class="btn btn-ghost btn-lg" data-act="fReset">다시 하기</button><button class="btn btn-primary btn-lg" data-act="consult" data-topic="잘 모르겠어요 (먼저 진단받고 싶어요)" data-msg="CARE FINDER 결과 — 장소: ${esc(place.label)} ${esc(place.sub)} / 환경: ${esc(lb(FS.env, FINDER.envs))} / 고민: ${esc(lb(FS.concern, FINDER.concerns))} / 방식: ${esc(mode?mode.label:'')} / 추천: ${esc(pick.map(r=>r.p.name).join(', '))}">이 결과로 상담하기</button></div>
    <div style="margin-top:28px">${disc()}</div>`;
}

/* ────────── 검색 결과 ────────── */
function searchGroups(q, limit){
  const res = window.U.search(q);
  const order = ['제품','케어','업종','가이드'];
  if (!q.trim()) return '';
  if (!res.length) return `<div class="empty"><span class="ico-wrap">${ico('search')}</span><b>“${esc(q)}”에 대한 검색 결과가 없습니다</b>다른 검색어를 입력하시거나 <button class="link-more" data-act="consult">상담하기 ${ico('arrow')}</button>로 문의해 주세요.</div>`;
  return order.map(t => {
    const items = res.filter(r => r.type === t);
    if (!items.length) return '';
    const shown = limit ? items.slice(0, limit) : items;
    return `<div class="sgroup"><h4>${t} <span>${items.length}건</span></h4>${shown.map(it => `<a class="sitem" href="${it.href}" data-act="closeSearch">${it.img ? img(it.img, '') : `<span class="ti">${ico(it.icon || 'compass')}</span>`}<div><b>${esc(it.title)}</b><small>${esc((it.sub||'').slice(0, 90))}</small></div></a>`).join('')}${limit && items.length > limit ? `<a class="link-more" style="padding:6px 12px" href="#/search?q=${encodeURIComponent(q)}" data-act="closeSearch">${t} ${items.length - limit}건 더 보기 ${ico('chevron')}</a>` : ''}</div>`;
  }).join('');
}
function searchPage(qs){
  const q = qs.q || '';
  const sug = ['공기청정기','정수기','비데','에어컨 크리닝','매트리스','반려동물','PC방','냄새','해충','렌탈'];
  return `<section class="section" style="padding-top:calc(var(--header-h) + 40px)"><div class="container" style="max-width:900px">
    <span class="eyebrow">SEARCH</span><h1 class="h2" style="margin:12px 0 22px">${q ? '“' + esc(q) + '” 검색 결과' : '검색'}</h1>
    <form class="search-ov-bar" id="searchPageForm" style="display:flex;gap:10px;margin-bottom:20px"><input class="input" id="searchPageInput" value="${esc(q)}" placeholder="검색어를 입력하세요" aria-label="검색어"><button class="btn btn-primary" type="submit">검색</button></form>
    <div class="chips-row" style="margin-bottom:12px">${sug.map(s => `<a class="chip" href="#/search?q=${encodeURIComponent(s)}">${s}</a>`).join('')}</div>
    ${searchGroups(q, 0) || ''}</div></section>`;
}

function notFound(){ return `<section class="section" style="padding-top:calc(var(--header-h) + 60px)"><div class="container"><div class="empty"><span class="ico-wrap">${ico('info')}</span><b>페이지를 찾을 수 없습니다</b><a class="btn btn-primary" href="#/">홈으로</a></div></div></section>`; }

window.PAGES = { optPick, optRowPick, rentalOptBlock, home, sectionPage, productsPage, productPage, bestPage, rentalPage, businessPage, homeCarePage, concernPage, guidePage, subscribePage, subscribeBody, subBarHtml, SUB, subMonthsLabel,
  finderPage, finderBody, FS, searchGroups, searchPage, plannerPage, notFound, consultSection };
})();
