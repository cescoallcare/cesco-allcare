/* popup.js — 신제품 출시 팝업 (설정: data/site.js 의 window.POPUP). 메인·랜딩 공통.
   ▸ 브라우저 세션당 1회(첫 방문) 노출 · '오늘 하루 보지 않기' = localStorage 에 오늘 자정까지 숨김
   ▸ 닫기: X · ESC · 배경 클릭 / 버튼: 자세히 보기(상품 상세) · 상담 신청(기존 상담 모달, 관심 상품 자동) · 카톡 문의 */
(function(){
'use strict';
const U = window.U, PO = window.POPUP, C = window.CONFIG;
if (!U || !PO || !PO.enabled) return;
const page = window.LANDING_KEY || 'main';
if (PO.pages && PO.pages.indexOf(page) < 0) return;
const force = /[?&]popup=1\b/.test(location.search);
if (navigator.webdriver && !force) return;                         // 자동 점검 도구에서는 기본 비노출(?popup=1 로 강제)
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);   // KST 날짜
if ((PO.start && today < PO.start) || (PO.end && today > PO.end)) return;
const p = PO.productId ? U.byId[PO.productId] : null;
if (PO.productId && !p) return;                                    // 관리자에서 숨긴 상품이면 팝업도 숨김
const HIDE = 'cescoPopupHide:' + PO.id, SEEN = 'cescoPopupSeen:' + PO.id;
const get = (s, k) => { try { return s.getItem(k); } catch (e) { return null; } };
const set = (s, k, v) => { try { s.setItem(k, v); } catch (e) {} };
if (!force && (Number(get(localStorage, HIDE)) > Date.now() || get(sessionStorage, SEEN))) return;

const { esc, ico, won } = U;
let el = null, lastFocus = null;
function midnight(){ const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); }
function html(){
  const price = p ? (p.buyPrice != null ? won(p.buyPrice) : '상담 시 안내') : '';
  const href = p ? '#/product/' + encodeURIComponent(p.id) : '';
  return `<div class="np-scrim" data-np="close"></div>
  <div class="np-box">
    <button type="button" class="np-x" data-np="close" aria-label="팝업 닫기"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <div class="np-im"><img src="${esc(PO.image)}" alt="${esc(PO.imageAlt || PO.title)}" decoding="async">${PO.badge ? `<span class="np-badge">${esc(PO.badge)}</span>` : ''}</div>
    <div class="np-bd">
      <span class="np-eyebrow">${esc(PO.eyebrow || '신제품 출시')}</span>
      <h2 id="npTitle">${esc(PO.title)}</h2>
      <p id="npText">${esc(PO.text)}</p>
      ${p ? `<div class="np-price"><span>구매가격<small>가격·조건은 변동될 수 있습니다</small></span><b>${esc(price)}</b></div>` : ''}
      ${PO.giftText ? `<div class="np-gift">${PO.giftImage ? `<img src="${esc(PO.giftImage)}" alt="" decoding="async">` : ''}<span>${ico('gift')} ${esc(PO.giftText)}</span></div>` : ''}
      <div class="np-btns">
        ${p ? `<a class="btn btn-primary" href="${href}" data-np="go">자세히 보기</a>` : ''}
        <button type="button" class="btn btn-navy" data-act="consult" ${p ? `data-product="${esc(p.id)}"` : ''} data-topic="${esc(PO.consultTopic || '')}" data-np="go">상담 신청</button>
        <a class="btn btn-ghost np-kakao" href="${esc(C.kakaoUrl)}" target="_blank" rel="noopener" data-np="go">${ico('message')} 카톡 문의</a>
      </div>
    </div>
    <div class="np-foot"><button type="button" data-np="today">오늘 하루 보지 않기</button><button type="button" data-np="close">닫기</button></div>
  </div>`;
}
function focusables(){ return Array.prototype.slice.call(el.querySelectorAll('a[href],button:not([disabled])')); }
function onKey(e){
  if (!el) return;
  if (e.key === 'Escape') { e.preventDefault(); close(); return; }
  if (e.key === 'Tab') {
    const f = focusables(); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }
}
function close(restore){
  if (!el) return;
  el.remove(); el = null;
  document.body.classList.remove('np-open');
  document.removeEventListener('keydown', onKey, true);
  if (restore !== false && lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
}
function open(){
  if (el || document.querySelector('#consultModal.open')) return;
  set(sessionStorage, SEEN, '1');
  lastFocus = document.activeElement;
  el = document.createElement('div');
  el.className = 'np'; el.id = 'newPop';
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'npTitle'); el.setAttribute('aria-describedby', 'npText');
  el.innerHTML = html();
  el.addEventListener('click', e => {
    const t = e.target.closest('[data-np]'); if (!t) return;
    const a = t.dataset.np;
    if (a === 'today') { set(localStorage, HIDE, String(midnight())); close(); }
    else if (a === 'close') close();
    else if (a === 'go') close(false);     // 이동·상담 모달은 원래 동작(링크/문서 클릭 위임)으로 이어짐
  });
  document.body.appendChild(el);
  document.body.classList.add('np-open');
  document.addEventListener('keydown', onKey, true);
  requestAnimationFrame(() => { el && el.classList.add('in'); const b = el && el.querySelector('.np-btns .btn'); if (b) b.focus({ preventScroll: true }); });
}
setTimeout(open, PO.delayMs == null ? 1000 : PO.delayMs);
window.NewPopup = { open, close };
})();
