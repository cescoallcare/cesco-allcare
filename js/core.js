/* core.js — 유틸, 아이콘, 제품 카드/공통 컴포넌트, 검색 인덱스 */
(function(){
'use strict';
const C = window.CONFIG, P = window.CESCO_PRODUCTS;
const byId = {}; P.forEach(p => byId[p.id] = p);
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const won = n => n == null ? null : Number(n).toLocaleString('ko-KR') + '원';

/* ── 아이콘 (stroke) ── */
const ICONS = {
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>', x:'<path d="M6 6l12 12M18 6 6 18"/>',
  chevron:'<path d="m9 6 6 6-6 6"/>', arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>', back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>', plus:'<path d="M12 5v14M5 12h14"/>',
  shield:'<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  wind:'<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 15h15a3 3 0 1 1-3 3"/><path d="M3 12h8"/>',
  droplet:'<path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z"/><path d="M9.5 15a2.7 2.7 0 0 0 2.5 2"/>',
  bug:'<path d="M9 8a3 3 0 0 1 6 0v1H9z"/><rect x="7" y="9" width="10" height="9" rx="5"/><path d="M12 9v9M3 12h4M17 12h4M4 6l3 2M20 6l-3 2M4 19l3-2M20 19l-3-2"/>',
  flower:'<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C10 6 12 3 12 3s2 3 0 6.5zM14.5 12c3.5-2 6.500 0 6.500 0s-3 2-6.500 0zM12 14.500c2 3.500 0 6.500 0 6.500s-2-3 0-6.500zM9.500 12c-3.500 2-6.500 0-6.500 0s3-2 6.500 0z"/>',
  sparkle:'<path d="M12 3l1.8 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z"/><path d="M19 16v4M17 18h4"/>',
  paw:'<circle cx="7" cy="10" r="1.800"/><circle cx="11" cy="6.500" r="1.800"/><circle cx="16" cy="7.500" r="1.800"/><circle cx="18.500" cy="12" r="1.800"/><path d="M12 12c-3 0-5.500 3-5.500 5.200 0 1.800 1.800 2.300 3.200 1.700 1.300-.6 2.900-.6 4.200 0 1.400.6 3.200.1 3.200-1.700C17 15 14.500 12 12 12z"/>',
  store:'<path d="M4 9l1.500-5h13L20 9"/><path d="M4 9a2.700 2.700 0 0 0 5.300 0 2.700 2.700 0 0 0 5.400 0A2.700 2.700 0 0 0 20 9"/><path d="M5 12v8h14v-8M10 20v-5h4v5"/>',
  building:'<rect x="5" y="3" width="14" height="18" rx="1.500"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M10 21v-4h4v4"/>',
  home:'<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
  message:'<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M8 10h8M8 13h5"/>',
  star:'<path d="m12 3.500 2.600 5.400 5.900.8-4.300 4.100 1 5.800L12 16.800 6.800 19.600l1-5.800L3.500 9.700l5.900-.8z"/>',
  calendar:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14-4.500L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0 0 14 4.500L20 15"/><path d="M20 20v-5h-5"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="8" cy="9" r="1.200"/>',
  clipboard:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 17.500h3"/>',
  heart:'<path d="M12 20s-8-4.800-8-11a4.500 4.500 0 0 1 8-2.500A4.500 4.500 0 0 1 20 9c0 6.200-8 11-8 11z"/>',
  wrench:'<path d="M14.500 6.500a4 4 0 0 0 5 5L20 14l-6 6-3-3 6-6zM4 20l5-5"/><path d="m9 15-2.500-2.500L4 15l2 2z"/>',
  box:'<path d="M3 8 12 3l9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15.500 8.500-2 5-5 2 2-5z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.500 7 8.500 6 8.500-6"/>',
  pin:'<path d="M12 21s7-6.200 7-11.500a7 7 0 0 0-14 0C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  handshake:'<path d="M3 12l4-4 4 1 3-2 7 6-4 4-3-1-3 2-4-3z"/><path d="m14 9-3 2.500"/>',
  gift:'<rect x="3" y="9" width="18" height="12" rx="1.500"/><path d="M3 13h18M12 9v12M12 9c-3-1-4.500-2.500-4-4s3-1.500 4 4zM12 9c3-1 4.500-2.500 4-4s-3-1.500-4 4z"/>',
  filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',
  external:'<path d="M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
function ico(n, cls=''){ return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||ICONS.info}</svg>`; }

/* ── 이미지 ── */
const PH = 'assets/img/placeholder.svg';
function img(src, alt='', extra=''){ return `<img src="${esc(src||PH)}" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`; }

/* ── 제품 도우미 ── */
const CATNAME = { air:'PURE AIR', water:'PURE WATER', life:'HEALING LIFE', pest:'BUG CARE', biz:'BUSINESS', service:'SERVICE' };
function catLabel(p){
  if (p.catLabel) return p.catLabel;
  if (p.partner) return 'PURE WATER · SHOWER';
  const s = (p.sections||[])[0] || '';
  const M = { 'air.clean':'AIR CLEAN','air.sterilize':'AIR STERILIZATION','air.space':'SPACE CARE','water.drink':'DRINK','water.bath':'BATH','water.shower':'SHOWER',
              'healing.sterilize':'STERILIZE','healing.clean':'CLEAN','healing.hygiene':'HYGIENE','healing.fresh':'FRESH','healing.bug':'BUG CARE','healing.everyday':'EVERYDAY' };
  return M[s] || CATNAME[p.category] || 'CARE';
}
const isRentalCat = p => p.category === 'air' || p.category === 'water' || !!p.rentalMonthly;
const hasBuy = p => p.buyPrice != null && !!p.buyUrl && !p.soldOut;
const hasRent = p => p.rentalMonthly != null || p.rentalInquire;
/* 렌탈 옵션 배열(rentalOptions: 의무사용기간×방문주기별 가격 행) — 가격표 기반 상품 */
const rOpts = p => Array.isArray(p.rentalOptions) ? p.rentalOptions : [];
const hasOpts = p => rOpts(p).length > 0;
const RENT_BASIS = '이달의 판매가(온라인 노출가) 옵션 중 최저가 기준';
const RENT_BASIS_SHORT = '이달의 판매가 최저 기준';
function minMonth(p){ const v = rOpts(p).map(o => o.monthPrice).filter(x => x != null); return v.length ? Math.min.apply(null, v) : null; }
/* 목록/카드용 "OO원부터" 정보 */
function fromInfo(p){
  if (hasOpts(p)) { const m = minMonth(p); if (m != null) return { price: m, label: '월 렌탈료', text: '월 ' + won(m) + '부터', basis: RENT_BASIS, short: RENT_BASIS_SHORT, kind: 'rent' }; }
  if (p.priceFrom && p.priceFrom.price != null) return { price: p.priceFrom.price, label: p.priceFrom.label || '가격', text: won(p.priceFrom.price) + '부터', basis: p.priceFrom.basis || '', short: p.priceFrom.basis || '', kind: 'from' };
  return null;
}
function buyText(p){
  if (p.buyPrice != null) return won(p.buyPrice) + (p.pricePrefix ? ' ' + p.pricePrefix : '');
  if (p.rentalMonthly) return '렌탈 전용';
  const f = fromInfo(p); if (f && f.kind === 'from') return f.text;
  return '상담 시 안내';
}
function rentText(p){
  if (hasOpts(p) && minMonth(p) != null) return '월 ' + won(minMonth(p)) + '부터 (' + RENT_BASIS_SHORT + ')';
  if (p.rentalMonthly != null) return '월 ' + won(p.rentalMonthly);
  if (p.rentalInquire) return '렌탈 가능 여부 상담 시 안내';
  return '상담 시 안내';
}
function rentHtml(p){
  if (hasOpts(p) && minMonth(p) != null) return esc('월 ' + won(minMonth(p)) + '부터') + `<small class="basis">${esc(RENT_BASIS_SHORT)}</small>`;
  return esc(rentText(p));
}
/* 비고 셀: '* A * B * C' → ['A','B','C'] (원문은 데이터에 한 줄로 보존) */
const noteLines = s => String(s || '').split(/\s*\*\s*/).map(x => x.trim()).filter(Boolean);
function careShort(p){
  if (p.partner) return '셀프 교체 (소모품·부품)';
  if (p.type === 'service') return '전문가 방문 서비스';
  if (p.priceMatrix) return '상담 시 안내';
  if (p.rentalMonthly) return '방문 관리 · ' + ((p.visitCycles||[]).join(' / ') || '주기 상담');
  if (p.category === 'air' || p.category === 'water') return '케어십 선택 · 셀프 관리';
  if (p.subscribable) return '셀프 사용 · 정기배송 가능';
  return '셀프 사용';
}
function badgesFor(p){
  let b = '';
  if (p.partner) b += `<span class="badge partner">PARTNER PRODUCT</span>`;
  if (p.soldOut) b += `<span class="badge warn">품절 표시</span>`;
  if (p.rentalMonthly) b += `<span class="badge rent">렌탈 가능</span>`;
  if (p.subscribable) b += `<span class="badge sub">정기배송</span>`;
  if (p.bizOnlyRental) b += `<span class="badge">사업자용</span>`;
  return b;
}
function consultAttrs(p, topic){
  return `data-act="consult" data-product="${esc(p.id)}" ${topic ? `data-topic="${esc(topic)}"` : ''}`;
}
function productCard(p, opts={}){
  const rows = [];
  rows.push(['사용공간', esc(p.spaces || '상담 시 안내'), '']);
  const fi = fromInfo(p);
  if (fi && fi.kind === 'from') rows.push([fi.label, esc(fi.text) + `<small class="basis">${esc(fi.short)}</small>`, 'price']);
  else {
    if (isRentalCat(p) && !p.partner) rows.push(['월 렌탈료', rentHtml(p), p.rentalMonthly ? 'rent' : 'ask']);
    rows.push(['구매가격', esc(buyText(p)), p.buyPrice != null ? 'price' : 'ask']);
  }
  rows.push(['관리방식', esc(careShort(p)), '']);
  const rank = opts.rank ? `<span class="badge rank">${opts.rank}위</span>` : '';
  const rv = opts.showReview && p.popularity ? `<div class="review">${ico('star')} 평점 ${p.popularity.rating} · 리뷰 ${p.popularity.reviews.toLocaleString()}개 <span class="muted">(세스코몰)</span></div>` : '';
  return `<article class="pcard">
    <a class="pcard-img" href="#/product/${esc(p.id)}" aria-label="${esc(p.name)} 자세히 보기">${img(p.image, p.name)}<span class="badges">${rank}${badgesFor(p)}</span></a>
    <div class="pcard-body">
      <div class="pcard-cat">${esc(catLabel(p))}</div>
      <h3><a href="#/product/${esc(p.id)}">${esc(p.name)}</a></h3>
      <p class="pcard-desc">${esc(p.description)}</p>
      ${rv}
      <dl class="pcard-spec">${rows.map(r => `<div><dt>${r[0]}</dt><dd class="${r[2]}">${r[1]}</dd></div>`).join('')}</dl>
      <div class="pcard-actions">
        <a class="btn btn-ghost" href="#/product/${esc(p.id)}">자세히 보기</a>
        ${p.consultRequired ? `<button class="btn btn-primary" ${consultAttrs(p)}>상담하기</button>` : ''}
      </div>
    </div></article>`;
}
function pgrid(list, opts){ return list.length ? `<div class="pgrid">${list.map((p,i) => productCard(p, typeof opts==='function'? opts(p,i): opts)).join('')}</div>` : `<div class="empty"><span class="ico-wrap">${ico('search')}</span><b>조건에 맞는 제품이 없습니다</b>필터를 바꿔 보시거나 <a class="link-more" href="javascript:void(0)" data-act="consult">상담하기 ${ico('arrow')}</a>로 문의해 주세요.</div>`; }

/* ── 검색 ── */
const SYN = {
  '공기청정기':['공기청정','공기청정기','청정기','미세먼지','에어'],'정수기':['정수기','정수','냉온정','직수'],'반려동물':['반려동물','펫','pet','강아지','고양이','반려견','반려묘'],
  '아기':['아기','영유아','baby','아이','신생아','젖병'],'냄새':['냄새','탈취','악취','방향','향기','탈취제'],'해충':['해충','벌레','바퀴','초파리','나방','개미','빈대','모기','진드기','방충'],
  '필터':['필터','헤파','프리필터','교체'],'렌탈':['렌탈','월 렌탈','방문관리','약정'],'정기배송':['정기배송','정기 배송','구독'],'pc방':['pc방','피씨방','피시방'],
  '살균':['살균','소독','살균소독','위생','uv'],'샤워':['샤워','샤워기','샤워필터','샤워헤드'],'비데':['비데','욕실','화장실'],'어르신':['어르신','시니어','senior','부모님'],
  '에어컨':['에어컨','에어컨크리닝','에어컨청소','냉방기'],'매트리스':['매트리스','침대','침구'],'크리닝':['크리닝','클리닝','세척','청소']
};
function norm(s){ return String(s||'').toLowerCase().replace(/\s+/g,' ').trim(); }
function expand(tok){
  const out = new Set([tok]);
  Object.keys(SYN).forEach(k => { if (SYN[k].some(w => norm(w).includes(tok) || tok.includes(norm(w)) && norm(w).length>1) || k === tok) SYN[k].forEach(w => out.add(norm(w))); });
  return Array.from(out);
}
let INDEX = null;
function buildIndex(){
  const extras = {};
  const add = (id, label) => { (extras[id] = extras[id] || []).push(label); };
  (window.INDUSTRIES||[]).forEach(ind => ind.picks.forEach(id => add(id, ind.name + ' ' + ind.en)));
  (window.HOMECARES||[]).forEach(h => h.picks.forEach(id => add(id, h.name + ' ' + h.ko)));
  const idx = [];
  P.forEach(p => {
    let rentalTxt = p.rentalMonthly ? '렌탈 월렌탈 방문관리 약정' : '';
    if (hasOpts(p)) rentalTxt += ' 이달의 판매가 온라인 노출가 현장 할인가 단품 결합 재렌탈 프로모션 ' + rOpts(p).map(o => [o.periodLabel, o.visit, o.variant, o.note, o.monthPrice, o.listPrice, o.onsiteSingle, o.onsiteBundle].filter(x => x != null).join(' ')).join(' ');
    if (p.priceMatrix) rentalTxt += ' 판매가 무이자 할부 규격 ' + p.priceMatrix.cols.join(' ') + ' ' + p.priceMatrix.rows.map(r => r.label).join(' ');
    if (p.servicePrices) rentalTxt += ' 비수기 4분기 특판 옵션 추가금 ' + p.servicePrices.rows.map(r => [r.g1, r.g2, r.g3, r.detail].join(' ')).join(' ');
    const subTxt = p.subscribable ? '정기배송 정기 배송' : '';
    const hay = norm([p.name, p.description, p.features.join(' '), p.spaces, p.targets.join(' '), p.keywords.join(' '), CATNAME[p.category], catLabel(p), rentalTxt, subTxt, p.partner ? '아롬비 제휴 파트너 partner' : '', p.filterInfo, (extras[p.id]||[]).join(' '), p.concerns.join(' ')].join(' | '));
    const fi = fromInfo(p);
    idx.push({ type:'제품', id:p.id, title:p.name, sub:(fi ? fi.text + ' (' + fi.short + ') · ' : '') + p.description, href:'#/product/'+p.id, img:p.image, hay, nameHay:norm(p.name+' '+p.keywords.join(' ')) });
  });
  (window.CONCERNS||[]).forEach(c => idx.push({ type:'케어', id:c.id, title:c.name + ' 케어', sub:c.sub, href:'#/concern/'+c.id, icon:c.icon, hay:norm([c.name,c.sub,c.lead,c.checks.join(' '),c.approach].join(' ')), nameHay:norm(c.name+' '+c.sub) }));
  (window.HOMECARES||[]).forEach(h => idx.push({ type:'케어', id:h.id, title:h.name + ' CARE · ' + h.ko, sub:h.summary, href:'#/home-care/'+h.id, icon:'home', hay:norm([h.name,h.ko,h.summary,h.worries.join(' '),h.care.join(' '),h.buy].join(' ')+(h.id==='pet'?' 반려동물 펫':'')+(h.id==='baby'?' 아기 영유아':'')), nameHay:norm(h.name+' '+h.ko+(h.id==='pet'?' 반려동물 펫':'')+(h.id==='baby'?' 아기 영유아':'')) }));
  [['렌탈 안내','부담은 줄이고 관리는 꾸준히 — 월 렌탈료·계약기간·방문주기를 한눈에','#/rental','렌탈 월렌탈료 계약 약정 방문관리 케어십 필터 교체'],
   ['정기배송','자주 쓰는 생활용품, 배송주기를 정해 두세요','#/subscribe','정기배송 생활용품 소모품 배송주기 구독'],
   ['CARE FINDER','네 가지 질문으로 나에게 맞는 케어 찾기','#/finder','케어 찾기 추천 진단 파인더'],
   ['플래너 소개','세스코 라이프케어 SOL 플래너 최영척','#/planner','플래너 최영척 상담 양산 세스코']
  ].forEach(x => idx.push({ type:'케어', id:x[0], title:x[0], sub:x[1], href:x[2], icon:'compass', hay:norm(x[0]+' '+x[1]+' '+x[3]), nameHay:norm(x[0]+' '+x[3]) }));
  (window.INDUSTRIES||[]).forEach(i => idx.push({ type:'업종', id:i.id, title:i.name + ' 맞춤 케어', sub:i.summary, href:'#/business/'+i.id, icon:'store', img:i.img, hay:norm([i.name,i.en,i.id==='pcroom'?'pc방 피씨방 pc room':'',i.summary,i.worries.join(' '),i.care.join(' ')].join(' ')), nameHay:norm(i.name+' '+i.en+(i.id==='pcroom'?' pc방 피씨방':'')) }));
  (window.GUIDES||[]).forEach(g => idx.push({ type:'가이드', id:g.id, title:g.title, sub:g.excerpt, href:'#/guide/'+g.id, img:g.img, hay:norm([g.title,g.excerpt,g.keywords.join(' '),g.body.map(b=>b[0]+' '+b[1]).join(' ')].join(' ')), nameHay:norm(g.title+' '+g.keywords.join(' ')) }));
  INDEX = idx;
}
function search(q){
  if (!INDEX) buildIndex();
  const toks = norm(q).split(' ').filter(Boolean);
  if (!toks.length) return [];
  const groups = toks.map(expand);
  const res = [];
  INDEX.forEach(it => {
    let score = 0;
    for (const g of groups) {
      let hit = 0;
      for (const w of g) { if (it.nameHay.includes(w)) hit = Math.max(hit, 3); else if (it.hay.includes(w)) hit = Math.max(hit, 1); }
      if (!hit) return; score += hit;
    }
    if (toks.some(t => it.nameHay.includes(t))) score += 2;
    res.push({ ...it, score });
  });
  res.sort((a,b) => b.score - a.score);
  return res;
}

/* ── 공용 조각 ── */
function sectionHead(eyebrow, title, lead, right=''){
  return `<div class="section-head ${right?'row':''}"><div style="display:grid;gap:14px"><span class="eyebrow">${esc(eyebrow)}</span><h2 class="h2">${title}</h2>${lead?`<p class="lead">${lead}</p>`:''}</div>${right}</div>`;
}
function pageHero({eyebrow, title, lead, img:im, crumbs=[], actions=''}){
  return `<section class="page-hero"><div class="bgimg">${img(im,'')}</div><div class="container">
    <nav class="crumbs" aria-label="breadcrumb"><a href="#/">HOME</a>${crumbs.map(c => ` <span>/</span> ${c.href?`<a href="${c.href}">${esc(c.label)}</a>`:esc(c.label)}`).join('')}</nav>
    <span class="eyebrow">${esc(eyebrow)}</span><h1 class="h1">${title}</h1><p class="lead">${lead||''}</p>${actions?`<div class="hero-actions">${actions}</div>`:''}</div></section>`;
}
function consultStrip(title, text, topic){
  return `<div class="cta-strip"><div><h3>${title||'무엇이 필요한지 모르겠다면, 제가 먼저 살펴보겠습니다.'}</h3><p>${text||'견적서보다 처방전을 먼저 씁니다. — 세스코 라이프케어 SOL 플래너 최영척'}</p></div>
  <div class="btn-stack" style="flex:0 0 auto"><button class="btn btn-white" data-act="consult" ${topic?`data-topic="${esc(topic)}"`:''}>${ico('message')} 상담하기</button><a class="btn btn-line-w" href="${C.planner.phoneTel}">${ico('phone')} ${esc(C.planner.phone)}</a></div></div>`;
}
function disclaimer(){ return `<div class="notice">${ico('info')}<div>표시된 가격·월 렌탈료·계약 조건은 세스코몰 등 공식 판매처 게시 정보(<b>${C.priceCheckedAt}</b> 확인)와 플래너 제공 가격표(<b>${C.priceTableAt}</b> 반영)를 기준으로 하며, 프로모션·제휴카드·약정기간·방문주기·옵션에 따라 달라질 수 있습니다. 확인되지 않은 항목은 “상담 시 안내”로 표시하며, 최종 가격과 계약 조건은 공식 판매/계약 기준을 따릅니다.</div></div>`; }
function partnerNotice(){ return `<div class="notice partner">${ico('handshake')}<div><b>PARTNER PRODUCT · 제휴·판매 상품 안내</b><br>아롬비(AROMVI) 샤워필터·관련 부품은 세스코 자체 제품이 아닌 <b>제휴·판매 상품</b>입니다. 제품 사양·품질·배송·교환/환불은 판매처(아롬비) 기준이며, 이 사이트에서는 구매 방법을 상담으로 안내해 드립니다.</div></div>`; }

window.U = { C, P, byId, $, $$, esc, won, ico, img, PH, CATNAME, catLabel, isRentalCat, hasBuy, hasRent, buyText, rentText, rentHtml, rOpts, hasOpts, minMonth, fromInfo, noteLines, RENT_BASIS, RENT_BASIS_SHORT, careShort, badgesFor, consultAttrs, productCard, pgrid, search, sectionHead, pageHero, consultStrip, disclaimer, partnerNotice, norm };
})();
