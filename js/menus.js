/* menus.js — 상단 6개 메뉴 화면 (설정: data/menus.js window.MENUS). pages.js 다음, app.js 앞에 로드 */
(function(){
'use strict';
const U = window.U, PG = window.PAGES, MENUS = window.MENUS || [], GR = window.GROUPING || { groups: [] };
const { P, byId, esc, ico, img, won, hasOpts, minMonth, isLegacyRent, buyText, badgesFor, pgrid, pageHero, sectionHead, consultStrip, disclaimer, partnerNotice, groupOf, C } = U;
const GFAM = {}; GR.groups.forEach(g => { GFAM[g.id] = g.family; });
const live = p => p && !p.soldOut;
const has = (arr, v) => (arr || []).includes(v);
function hit(p, r){
  if (!r) return false;
  const name = p.name || '', kw = (p.keywords || []).join(' '), secs = p.sections || [];
  return (r.grp || []).some(id => { const g = groupOf(p, GFAM[id]); return g && g.id === id; }) ||
    (r.names || []).some(w => name.includes(w)) || (r.keywords || []).some(w => kw.includes(w)) ||
    has(r.ids, p.id) || has(r.cat, p.category) || has(r.section0, secs[0]) || has(r.types, p.type) ||
    (r.concerns || []).some(c => has(p.concerns, c)) || (r.places || []).some(c => has(p.places, c));
}
function must(p, a){
  if (!a) return true;
  if (a.audienceNot && a.audienceNot.includes(p.audience)) return false;
  if (a.places && !(a.places || []).some(c => has(p.places, c))) return false;
  if (a.cat && !a.cat.includes(p.category)) return false;
  return true;
}
const inGroup = (p, g) => hit(p, g.match) && must(p, g.and) && !hit(p, g.not);
/* 메뉴 → [{g, items}] (한 메뉴 안에서는 처음 맞는 소분류 하나) */
function menuGroups(m){
  const map = {}; (m.groups || []).forEach(g => { map[g.id] = []; });
  P.forEach(p => { const g = (m.groups || []).find(x => inGroup(p, x)); if (g) map[g.id].push(p); });
  return (m.groups || []).map(g => {
    let items = map[g.id];
    if (g.first) items = items.filter(p => hit(p, g.first)).concat(items.filter(p => !hit(p, g.first)));
    return { g, items };
  });
}
const menuOf = key => MENUS.find(m => m.key === key);
/* 상품 → 대표 메뉴 키(nav 하이라이트) */
function navKeyOf(p){
  if (!p) return '';
  for (const k of ['air', 'water', 'perfume', 'supplies']) { const m = menuOf(k); if (m && m.groups.some(g => inGroup(p, g))) return k; }
  return p.audience === 'biz' ? 'business' : 'homecare';
}
const priceOf = p => {
  if (hasOpts(p) && minMonth(p) != null) return { k: '월 렌탈료', v: '월 ' + won(minMonth(p)) + '부터 시작', cls: 'rent' };
  if (isLegacyRent(p)) return { k: '월 렌탈료', v: '상담 시 안내', cls: 'ask' };
  return { k: '구매가격', v: buyText(p), cls: p.buyPrice != null ? '' : 'ask' };
};
const kakao = (cls, label) => `<a class="${cls}" href="${esc(C.kakaoUrl)}" data-act="kakao" target="_blank" rel="noopener">${ico('message')} ${label || '카톡 문의'}</a>`;
const chips = (m, list) => list.length > 1 ? `<div class="mn-chips" role="navigation" aria-label="${esc(m.label)} 소분류">${list.map(x => `<button type="button" class="chip" data-act="mnScroll" data-target="${esc(x.id)}">${esc(x.label)}${x.n != null ? ` <small>${x.n}</small>` : ''}</button>`).join('')}</div>` : '';

function groupBlock(m, x){
  const id = `mg-${m.key}-${x.g.id}`;
  if (!x.items.length) {
    if (x.g.empty !== 'consult') return '';
    return `<div class="grp mn-grp" id="${id}"><h3 class="grp-h">${esc(x.g.label)}<small>상담 시 안내</small></h3>
      <div class="mn-empty">${ico('info')}<div><b>${esc(x.g.label)}</b><p>${esc(x.g.desc || '상담 시 안내해 드립니다.')}</p></div>
      <div class="btn-stack"><button type="button" class="btn btn-primary" data-act="consult" data-topic="${esc(m.topic)}" data-msg="${esc(x.g.label)} 문의">${ico('message')} 상담 신청</button>${kakao('btn btn-ghost')}</div></div></div>`;
  }
  return `<div class="grp mn-grp" id="${id}"><h3 class="grp-h">${esc(x.g.label)}<small>${x.items.length}개</small></h3>${x.g.desc ? `<p class="grp-d">${esc(x.g.desc)}</p>` : ''}
    ${x.g.partner && x.items.some(p => p.partner) ? `<div style="margin:0 0 18px">${partnerNotice()}</div>` : ''}${pgrid(x.items)}</div>`;
}
function pickCard(m, k){
  const items = k.ids.map(id => byId[id]).filter(live).slice(0, 4);
  if (!items.length) return '';
  return `<article class="pk-card" id="pk-${esc(m.key)}-${esc(k.id)}">
    <div class="pk-im">${img(k.img, k.label)}<span class="pk-tag">SPECIAL PICK</span></div>
    <div class="pk-bd"><h3>${esc(k.label)}</h3><p class="pk-w">${ico('info')} ${esc(k.worry)}</p>
      <ul class="pk-list">${items.map(p => { const pr = priceOf(p); return `<li><a href="#/product/${encodeURIComponent(p.id)}">${img(p.image, p.name)}<span class="nm">${esc(p.name)}</span><span class="pr ${pr.cls}">${esc(pr.v)}</span></a></li>`; }).join('')}</ul>
      <div class="pk-act"><button type="button" class="btn btn-primary" data-act="consult" data-topic="${esc(m.topic)}" data-msg="${esc(m.picksTitle + ' — ' + k.label)} 상담">${ico('message')} 상담 신청</button>${kakao('btn btn-kakao')}</div></div></article>`;
}
function menuPage(key, qs){
  const m = menuOf(key); if (!m) return PG.notFound();
  const gs = menuGroups(m);
  const shown = gs.filter(x => x.items.length || x.g.empty === 'consult');
  const total = new Set(gs.flatMap(x => x.items.map(p => p.id)).concat((m.picks || []).flatMap(k => k.ids.filter(id => live(byId[id]))))).size;
  const acts = `<button class="btn btn-primary btn-lg" data-act="consult" data-topic="${esc(m.topic)}">${ico('message')} 상담 신청</button>${m.landing ? `<a class="btn btn-white btn-lg" href="${esc(m.landing.href)}">${esc(m.landing.label)} ${ico('arrow')}</a>` : ''}`;
  const picks = (m.picks || []).map(k => pickCard(m, k)).filter(Boolean);
  const chipList = (picks.length ? [{ id: `mp-${m.key}`, label: m.picksTitle }] : []).concat(shown.map(x => ({ id: `mg-${m.key}-${x.g.id}`, label: x.g.label, n: x.items.length || null })));
  return pageHero({ eyebrow: m.en + ' · ' + m.label, title: m.title, lead: m.lead, img: m.img, crumbs: [{ label: m.label }], actions: acts }) + `
  <section class="section mn-sec" style="padding-top:40px"><div class="container">
    ${chips(m, chipList)}
    ${picks.length ? `<div id="mp-${m.key}" class="mn-picks">${sectionHead('SPECIAL PICK', esc(m.picksTitle), '상황에 맞는 추천 제품을 먼저 살펴보고, 상담으로 우리 공간에 맞게 조정해 보세요.')}<div class="pk-grid">${picks.join('')}</div></div>` : ''}
    ${m.groupsTitle ? `<div style="margin-top:${picks.length ? 72 : 0}px">${sectionHead('BY PRODUCT', esc(m.groupsTitle), '')}</div>` : ''}
    ${shown.map(x => groupBlock(m, x)).join('')}
    <div style="margin-top:44px">${disclaimer()}</div>
    <div style="margin-top:28px">${consultStrip('', '', m.topic)}</div>
  </div></section>`;
}
/* 소분류/PICK 스크롤 */
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-act="mnScroll"]'); if (!t) return;
  const el = document.getElementById(t.dataset.target); if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72) - 20;
  window.scrollTo({ top: y, behavior: 'smooth' });
});
/* 옛 #/home-care/<id>, #/business/<id> → 해당 PICK 으로 이동할 때 쓰는 매핑 */
function legacyPick(key, oldId){
  const m = menuOf(key); if (!m || !m.picks) return null;
  const k = m.picks.find(x => [].concat(x.legacy || []).includes(oldId)); return k ? `pk-${m.key}-${k.id}` : null;
}
Object.assign(PG, { menuPage, menuGroups, navKeyOf, legacyPick, menuOf });
window.MENU_API = { menuGroups, navKeyOf, inGroup };
})();
