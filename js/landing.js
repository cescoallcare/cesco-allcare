/* landing.js — 단독 랜딩페이지(water/, air/) 렌더러.
   ▸ 상품·가격은 메인 사이트와 같은 데이터(data/products.js + data/price-overrides.json)와 같은 함수(U.productCard, U.rentHtml …)를 씁니다.
     관리자에서 숨김/가격 수정한 내용이 그대로 반영됩니다.
   ▸ 페이지 문구는 아래 LANDINGS 에서 수정합니다. 상품 그룹은 data/site.js 의 GROUPING 규칙을 따릅니다. */
(function(){
'use strict';
const U = window.U;
const { C, P, byId, $, esc, won, ico, img, hasOpts, minMonth, isRent, isLegacyRent, buyText, rentHtml, catLabel, badgesFor, productCard, groupProducts, partnerNotice } = U;
const KEY = window.LANDING_KEY;

const LANDINGS = {
  water: {
    eyebrow: 'WATER CARE · 워터케어',
    title: '매일 마시고 씻는 물,<br><em>정말 안심하고 계신가요?</em>',
    sub: '정수기 필터는 언제 바꿨는지, 샤워기 물때와 비데 위생은 괜찮은지. 우리 집 물 사용 습관부터 함께 살펴보고, 꼭 맞는 워터케어를 처방해 드립니다.',
    hero: 'assets/img/water-pour.webp', heroAlt: '컵에 물을 따르는 모습',
    topic: '물 케어 (정수기·샤워·비데)',
    highlight: { group: 'water-purifier', label: '정수기' },
    worries: [
      ['droplet', '정수기 관리, 제때 되고 있을까요?', '필터 교체 시기를 놓치거나 내부 위생이 마음에 걸리신다면.'],
      ['sparkle', '샤워기 물때와 수돗물 냄새', '피부·두피가 예민한 가족이 있어 샤워 물이 신경 쓰이신다면.'],
      ['shield', '비데 노즐 위생이 걱정될 때', '매일 쓰는 비데, 세척과 살균 관리가 어려우셨다면.'],
      ['home', '주방이 좁아 둘 곳이 마땅치 않아요', '1인 가구나 작은 주방이라 슬림한 제품을 찾고 계신다면.']
    ],
    causes: [
      ['필터·내부 관리의 공백', '정해진 주기에 방문해 필터 교체와 살균 관리를 진행합니다. 직접 챙기지 않아도 관리가 이어집니다.'],
      ['우리 집과 맞지 않는 제품 선택', '가족 수·사용량·주방 크기를 먼저 듣고 냉온정·직수형·슬림형 중 알맞은 방식을 제안합니다.'],
      ['욕실 물때와 노즐 오염', '방수·살균 기능 비데와 필터 샤워기로 욕실의 물 위생까지 함께 챙깁니다.']
    ],
    picksTitle: '슬림하게, 꾸준하게. 대표 정수기',
    picks: ['G2000001384', 'G2000000556', 'G2000001383', 'G2000001504'],
    pickTags: { G2000001384: '주력 추천', G2000000556: '냉온정 인기', G2000001383: '데스크탑', G2000001504: '1인 가구' },
    groups: [
      ['water-purifier', '정수기', '주력 슬림 계열을 먼저, 공간과 사용량에 맞춰 고르실 수 있게 정리했습니다.'],
      ['water-bidet', '비데', '방수·살균 기능과 정기 방문 관리로 욕실 위생을 지킵니다.'],
      ['water-shower', '샤워기', '아롬비(AROMVI) 필터 샤워기 · 제휴·판매 상품입니다.']
    ]
  },
  air: {
    eyebrow: 'AIR CARE · 에어케어',
    title: '창문을 열기도, 닫기도<br><em>망설여지는 날이 많아졌다면</em>',
    sub: '미세먼지, 반려동물 털, 오래 남는 생활 냄새, 공기 중 세균 걱정까지. 공간의 크기와 생활 패턴을 먼저 살핀 뒤, 꼭 필요한 에어케어를 처방해 드립니다.',
    hero: 'assets/img/living-soft.webp', heroAlt: '햇살이 드는 밝은 거실',
    topic: '공기 케어',
    highlight: { id: 'G2000000429', label: '공기살균기 센스미' },
    worries: [
      ['wind', '미세먼지·황사 소식이 잦아질 때', '환기는 해야 하는데 바깥 공기가 걱정되신다면.'],
      ['heart', '아이·어르신·반려동물과 함께라서', '가족이 오래 머무는 공간의 공기가 더 신경 쓰이신다면.'],
      ['flower', '생활 냄새가 오래 남을 때', '음식·반려동물·습기 냄새로 공간의 인상이 아쉬우셨다면.'],
      ['store', '화장실·매장 위생이 신경 쓰일 때', '손님이 드나드는 공간의 공기와 손 위생까지 챙기고 싶으시다면.']
    ],
    causes: [
      ['실내에 쌓이는 미세먼지·생활먼지', '평수에 맞는 공기청정기와 정기 필터 관리로 깨끗한 공기를 꾸준히 유지합니다.'],
      ['공기 중 떠다니는 세균·바이러스 걱정', 'UV 공기살균기로 사람이 머무는 공간의 공기를 살균합니다.'],
      ['오래 남는 냄새와 답답한 분위기', '에어제닉·에어퍼퓸 같은 향기 제품으로 공간의 첫인상을 바꿉니다.'],
      ['손 씻은 뒤의 위생', '핸드드라이어로 화장실·매장의 손 위생을 깔끔하게 마무리합니다.']
    ],
    picksTitle: '공간에 맞춰 고르는 대표 에어케어',
    picks: ['G2000001210', 'G2000001213', 'G2000000429'],
    pickTags: { G2000001210: '판테온 · 트루살균', G2000001213: '판테온 · 트루에어', G2000000429: '센스미 · 모션인식 UV' },
    groups: [
      ['air-purifier', '공기청정기', '판테온을 중심으로 공간 크기에 맞는 공기청정기를 모았습니다.'],
      ['air-sterilizer', '공기살균기', '센스미 — 사람의 움직임을 인식해 미리 살균하는 UV 공기살균기.'],
      ['air-scent', '향기 제품', '에어제닉·에어퍼퓸 등 공간의 향과 분위기를 바꾸는 제품입니다.'],
      ['air-handdryer', '핸드드라이어', '화장실·매장의 손 위생을 위한 제품입니다.'],
      ['air-bodydryer', '바디드라이어', '']
    ]
  }
};
const L = LANDINGS[KEY];
const root = $('#lp');
if (!L || !root) return;

const pl = C.planner;
const monthText = p => hasOpts(p) && minMonth(p) != null ? '월 ' + won(minMonth(p)) + '부터 시작' : null;
const priceHtml = p => {
  if (hasOpts(p) && minMonth(p) != null) return { k: '월 렌탈료', v: rentHtml(p), cls: 'rent' };
  if (isLegacyRent(p)) return { k: '월 렌탈료', v: '상담 시 안내', cls: 'ask' };
  return { k: '구매가격', v: esc(buyText(p)), cls: p.buyPrice != null ? 'price' : 'ask' };
};
const href = p => '#/product/' + encodeURIComponent(p.id);   // <base href="../"> → 메인 사이트 상품 상세
const consultBtn = (label, cls, extra) => `<button type="button" class="${cls}" data-act="consult" data-topic="${esc(L.topic)}" ${extra || ''}>${ico('message')} ${label}</button>`;
const telBtn = cls => `<a class="${cls}" href="${pl.phoneTel}">${ico('phone')} ${esc(pl.phone)}</a>`;
const kakaoBtn = cls => `<a class="${cls}" href="${esc(C.kakaoUrl)}" target="_blank" rel="noopener">${ico('message')} 카카오톡 상담</a>`;

/* 그룹별 상품 (메인 사이트와 같은 GROUPING 규칙) */
const fam = KEY;
const pool = P.filter(p => { const g = U.groupOf(p, fam); return g && !g.etc && L.groups.some(x => x[0] === g.id); });
const grouped = groupProducts(pool, fam);
const groupsHtml = L.groups.map(([gid, label, desc]) => {
  const x = grouped.find(y => y.g.id === gid);
  if (!x || !x.items.length) return '';   // 상품이 없는 그룹(예: 바디드라이어)은 숨김
  return `<div class="lp-grp" id="g-${esc(gid)}">
    <div class="lp-grp-h"><h3>${esc(label)}<small>${x.items.length}개</small></h3>${desc ? `<p>${esc(desc)}</p>` : ''}</div>
    ${gid === 'water-shower' ? `<div style="margin:0 0 18px">${partnerNotice()}</div>` : ''}
    <div class="pgrid">${x.items.map(p => productCard(p)).join('')}</div></div>`;
}).join('');
const groupChips = L.groups.filter(([gid]) => (grouped.find(y => y.g.id === gid) || { items: [] }).items.length)
  .map(([gid, label]) => `<button type="button" class="chip" data-act="lpScroll" data-target="g-${esc(gid)}">${esc(label)}</button>`).join('');

/* 대표 추천 */
const picks = L.picks.map(id => byId[id]).filter(Boolean);
const pickCard = p => { const pr = priceHtml(p); return `<article class="lp-pick">
  <a class="im" href="${href(p)}" aria-label="${esc(p.name)} 자세히 보기">${img(p.image, p.name)}<span class="badges">${badgesFor(p)}</span></a>
  <div class="bd"><span class="tag">${esc(L.pickTags[p.id] || '추천')}</span><div class="pcard-cat">${esc(catLabel(p))}</div>
    <h3><a href="${href(p)}">${esc(p.name)}</a></h3><p>${esc(p.description || '')}</p>
    <div class="pr"><span class="k">${pr.k}</span><span class="v ${pr.cls}">${pr.v}</span></div>
    <div class="act"><a class="btn btn-ghost" href="${href(p)}">자세히 보기</a><button type="button" class="btn btn-primary" data-act="consult" data-product="${esc(p.id)}" data-topic="${esc(L.topic)}">상담 신청</button></div></div></article>`; };

/* 히어로 하이라이트 (가격은 공통 함수 기준) */
let hl = '';
if (L.highlight.id && byId[L.highlight.id] && monthText(byId[L.highlight.id])) hl = `${esc(L.highlight.label)} <b>${esc(monthText(byId[L.highlight.id]))}</b>`;
if (L.highlight.group) { const x = grouped.find(y => y.g.id === L.highlight.group); const ms = x ? x.items.filter(p => hasOpts(p) && minMonth(p) != null) : [];
  if (ms.length) { const m = Math.min(...ms.map(minMonth)); hl = `${esc(L.highlight.label)} <b>월 ${won(m)}부터 시작</b>`; } }

root.innerHTML = `
<section class="lp-hero">
  <div class="bg">${img(L.hero, L.heroAlt, 'loading="eager" fetchpriority="high"')}</div>
  <div class="container lp-hero-grid">
    <div class="copy">
      <span class="eyebrow on-dark">${esc(L.eyebrow)}</span>
      <h1 class="h1">${L.title}</h1>
      <p class="sub">${esc(L.sub)}</p>
      <div class="cta">${consultBtn('상담 신청', 'btn btn-primary btn-lg')}${telBtn('btn btn-white btn-lg')}${kakaoBtn('btn btn-line-w btn-lg')}</div>
      ${hl ? `<p class="hl">${ico('tag')} ${hl}</p>` : ''}
    </div>
    <aside class="sig" aria-label="플래너 한마디">
      <span class="hc-badge">${ico('shield')} ${esc(pl.title)}</span>
      <p class="q">“${esc(pl.slogan)}”</p>
      <p class="s">제품부터 권하지 않습니다. 공간과 생활을 먼저 듣고, 꼭 필요한 케어만 처방해 드립니다.</p>
    </aside>
  </div>
</section>

<section class="section lp-sec" id="worry"><div class="container">
  <div class="section-head"><span class="eyebrow">WHAT MATTERS</span><h2 class="h2">이런 고민, 혹시 있으신가요?</h2><p class="lead">하나라도 해당된다면 지금이 점검하기 좋은 때입니다.</p></div>
  <div class="lp-worry">${L.worries.map(w => `<div class="card"><span class="ic">${ico(w[0])}</span><h3>${esc(w[1])}</h3><p>${esc(w[2])}</p></div>`).join('')}</div>
</div></section>

<section class="section gray lp-sec" id="care"><div class="container">
  <div class="section-head"><span class="eyebrow">CAUSE &amp; CARE</span><h2 class="h2">원인을 알면,<br>케어가 달라집니다</h2><p class="lead">고민의 원인을 먼저 짚고, 그에 맞는 케어 방법을 안내해 드립니다.</p></div>
  <div class="lp-cause">${L.causes.map((c, i) => `<div class="row"><div class="c"><span class="n">${String(i + 1).padStart(2, '0')}</span><small>원인</small><b>${esc(c[0])}</b></div><span class="arr" aria-hidden="true">${ico('arrow')}</span><div class="s"><small>케어 방법</small><p>${esc(c[1])}</p></div></div>`).join('')}</div>
  <div class="lp-steps">
    <div class="st"><span class="si">${ico('compass')}</span><b>1. 공간·생활 상담</b><p>평수, 함께 사는 가족, 사용 습관을 먼저 듣습니다.</p></div>
    <div class="st"><span class="si">${ico('clipboard')}</span><b>2. 맞춤 처방</b><p>제품·의무사용기간·방문주기를 부담 없는 조합으로 제안합니다.</p></div>
    <div class="st"><span class="si">${ico('refresh')}</span><b>3. 꾸준한 관리</b><p>정해진 주기에 방문해 관리하고, 필요할 때 다시 점검합니다.</p></div>
  </div>
</div></section>

<section class="section lp-sec" id="products"><div class="container">
  <div class="section-head"><span class="eyebrow">RECOMMENDED</span><h2 class="h2">${esc(L.picksTitle)}</h2><p class="lead">렌탈 상품은 월 렌탈료로 안내해 드립니다. 카드를 누르면 옵션별 가격과 상세 정보를 보실 수 있습니다.</p></div>
  ${picks.length ? `<div class="lp-picks n${picks.length}">${picks.map(pickCard).join('')}</div>` : ''}
  <div class="lp-chips"><span class="label">제품 그룹</span>${groupChips}</div>
  ${groupsHtml}
</div></section>

<section class="section sky lp-sec" id="planner"><div class="container lp-planner">
  <div class="pi"><img src="assets/logo/logo-header.png" alt="CESCO Life Care"></div>
  <div class="tx"><span class="eyebrow">PLANNER</span><h2 class="h2" style="font-size:clamp(26px,3vw,38px)">${esc(pl.title)}</h2>
    <p class="lead">견적서보다 처방전을 먼저 씁니다. 공간을 먼저 살펴보고, 우리 집과 우리 가게에 꼭 필요한 케어만 정중하게 안내해 드립니다.</p>
    <ul class="pts"><li>${ico('check')} 공간·가족·생활 패턴을 먼저 듣는 상담</li><li>${ico('check')} 렌탈·구매 중 부담 없는 방식으로 제안</li><li>${ico('check')} 설치 후에도 이어지는 관리 안내</li></ul></div>
</div></section>

<section class="section lp-sec" id="consult"><div class="container">
  <div class="lp-cta">
    <div><span class="eyebrow on-dark">CONSULTATION</span><h2>무엇부터 시작해야 할지 모르겠다면,<br>편하게 물어봐 주세요.</h2><p>“${esc(pl.slogan)}” — ${esc(pl.title)}</p></div>
    <div class="btns">${consultBtn('상담 신청하기', 'btn btn-white btn-lg')}${telBtn('btn btn-line-w btn-lg')}${kakaoBtn('btn btn-line-w btn-lg')}</div>
  </div>
</div></section>`;

$('#lpFoot').innerHTML = `<div class="container">
  <div class="top"><a href="./"><img src="assets/logo/logo-white.png" alt="CESCO Lifecare"></a><div class="ct"><a href="${pl.phoneTel}">${ico('phone')} ${esc(pl.phone)}</a><a href="${esc(C.kakaoUrl)}" target="_blank" rel="noopener">${ico('message')} 카카오톡 상담</a><a href="./">${ico('home')} 세스코 올케어 메인</a></div></div>
  <div class="legal"><p>본 사이트는 세스코 라이프케어 플래너의 상품 안내 및 상담을 위한 페이지입니다.</p>
  <p>표시된 가격·월 렌탈료·계약 조건은 프로모션·의무사용기간·방문주기·옵션에 따라 달라질 수 있으며, 최종 가격과 계약 조건은 상담 시 확인해 주세요. 가격·조건은 변동될 수 있습니다.</p>
  <p>아롬비(AROMVI) 제품은 PARTNER PRODUCT · 제휴·판매 상품입니다.</p></div></div>`;

$('#lpBar').innerHTML = `<a href="${pl.phoneTel}">${ico('phone')}<span>전화</span></a><a href="${esc(C.kakaoUrl)}" target="_blank" rel="noopener">${ico('message')}<span>카카오톡</span></a><button type="button" class="go" data-act="consult" data-topic="${esc(L.topic)}">${ico('clipboard')}<span>상담 신청</span></button>`;
$('#lpTel').href = pl.phoneTel; $('#lpTel').innerHTML = ico('phone') + '<span>' + esc(pl.phone) + '</span>';
$('#lpConsultBtn').dataset.topic = L.topic;
$('#btnConsultX').innerHTML = ico('x');

/* ── 상담 모달 (메인 사이트와 같은 폼·저장 방식) ── */
const LS_KEY = 'cescoInquiries';
let ctx = null;
function openConsult(o){
  ctx = o || {};
  const p = ctx.product ? byId[ctx.product] : null;
  const topic = ctx.topic || L.topic, topics = window.TOPICS || [topic];
  $('#consultBody').innerHTML = `<div id="cmForm">
    <span class="eyebrow">CONSULTATION</span>
    <h2 id="cmTitle" class="h3" style="margin:10px 0 6px;font-size:26px">맞춤 상담 신청</h2>
    <p class="muted" style="margin-bottom:20px;font-size:14.5px">${esc(pl.title)}가 확인 후 연락드립니다.<br><b style="color:var(--navy)">“${esc(pl.slogan)}”</b></p>
    ${p ? `<div class="pchip">${img(p.image, p.name)}<div><small class="muted">문의 제품</small><br><b>${esc(p.name)}</b></div></div>` : ''}
    <form id="cmF" novalidate>
      <div class="field"><label for="cmName">이름 <i>*</i></label><input class="input" id="cmName" name="name" autocomplete="name" placeholder="홍길동"><span class="err">이름을 입력해 주세요.</span></div>
      <div class="field"><label for="cmPhone">연락처 <i>*</i></label><input class="input" id="cmPhone" name="phone" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000"><span class="err">올바른 연락처를 입력해 주세요.</span></div>
      <div class="field"><label>장소</label><div class="seg"><label><input type="radio" name="kind" value="가정" checked><span>가정</span></label><label><input type="radio" name="kind" value="사업장"><span>사업장</span></label></div></div>
      <div class="field"><label for="cmTopic">상담 주제</label><select class="input" id="cmTopic" name="topic">${topics.map(t => `<option ${t === topic ? 'selected' : ''}>${esc(t)}</option>`).join('')}${topics.includes(topic) ? '' : `<option selected>${esc(topic)}</option>`}</select></div>
      <div class="field"><label for="cmTime">연락 가능 시간</label><select class="input" id="cmTime" name="time"><option>언제든 괜찮습니다</option><option>오전 (9~12시)</option><option>오후 (12~18시)</option><option>저녁 (18시 이후)</option></select></div>
      <div class="field"><label for="cmMsg">문의 내용</label><textarea class="input" id="cmMsg" name="message" placeholder="공간 크기, 함께 사는 분, 마음 쓰이는 점 등을 편하게 적어 주세요."></textarea></div>
      <label class="check"><input type="checkbox" id="cmAgree"><span>상담을 위해 이름·연락처를 수집·이용하는 것에 동의합니다. (상담 목적 외에는 사용하지 않습니다) <i style="color:var(--red);font-style:normal">*</i></span></label>
      <div class="field" id="agreeField" style="margin:6px 0 0"><span class="err">개인정보 수집·이용에 동의해 주세요.</span></div>
      <button class="btn btn-primary btn-lg btn-block" type="submit" style="margin-top:14px">상담 신청하기</button>
    </form></div>`;
  $('#consultModal').classList.add('open'); document.body.style.overflow = 'hidden';
  setTimeout(() => $('#cmName') && $('#cmName').focus(), 60);
  $('#cmF').addEventListener('submit', submitForm);
}
function closeConsult(){ $('#consultModal').classList.remove('open'); document.body.style.overflow = ''; }
async function submitInquiry(rec){
  const list = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); list.push(rec); localStorage.setItem(LS_KEY, JSON.stringify(list));
  return true;   // 백엔드 연동 시 js/app.js 의 submitInquiry 와 함께 C.formEndpoint 로 전송하도록 확장
}
async function submitForm(e){
  e.preventDefault();
  const f = e.target, name = f.name.value.trim(), phone = f.phone.value.trim();
  const okName = name.length >= 2, okPhone = /^[0-9+\-\s()]{9,15}$/.test(phone) && phone.replace(/\D/g, '').length >= 9, agree = $('#cmAgree').checked;
  f.name.closest('.field').classList.toggle('bad', !okName); f.phone.closest('.field').classList.toggle('bad', !okPhone); $('#agreeField').classList.toggle('bad', !agree);
  if (!okName || !okPhone || !agree) { const bad = document.querySelector('.field.bad input'); if (bad) bad.focus(); return; }
  const p = ctx && ctx.product ? byId[ctx.product] : null;
  const rec = { id: 'INQ-' + Date.now(), createdAt: new Date().toISOString(), name, phone, kind: f.kind.value, topic: f.topic.value, time: f.time.value, message: f.message.value.trim(),
                product: p ? { id: p.id, name: p.name } : null, page: location.pathname };
  await submitInquiry(rec);
  $('#consultBody').innerHTML = `<div class="done-view"><span class="okc">${ico('check')}</span><h2 class="h3" style="font-size:26px">상담 신청이 접수되었습니다</h2>
    <p class="muted">${esc(name)}님, 확인 후 입력하신 연락처로 연락드리겠습니다.<br>급하신 경우에는 바로 전화 주세요.</p>
    <div style="background:var(--gray);border-radius:16px;padding:14px;font-size:14px;text-align:left">접수번호 <b>${esc(rec.id)}</b><br>주제 ${esc(rec.topic)}${p ? '<br>제품 ' + esc(p.name) : ''}</div>
    <p style="font-size:12.5px;color:var(--muted)">※ 접수 내용은 현재 이 기기의 브라우저에만 저장됩니다. 빠른 상담이 필요하시면 전화나 카카오톡으로 문의해 주세요.</p>
    <a class="btn btn-navy btn-lg btn-block" href="${pl.phoneTel}">${ico('phone')} ${esc(pl.phone)} 전화하기</a>
    <button class="btn btn-ghost btn-lg btn-block" data-act="closeConsult">닫기</button></div>`;
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const d = el.dataset;
  if (d.act === 'consult') { e.preventDefault(); openConsult({ product: d.product, topic: d.topic }); }
  else if (d.act === 'closeConsult') closeConsult();
  else if (d.act === 'lpScroll') { e.preventDefault(); const t = document.getElementById(d.target); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeConsult(); });
const head = $('#lpHead'); const onScroll = () => head.classList.toggle('scrolled', scrollY > 8); addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
