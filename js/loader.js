/* loader.js — data/price-overrides.json(관리자 페이지에서 게시)을 상품 데이터에 반영한 뒤 사이트 스크립트를 순서대로 로드합니다.
   파일이 없거나 실패해도(예: file:// 로 열기, 네트워크 오류) 기본 데이터(data/products.js)로 그대로 동작합니다. */
(function(){
'use strict';
/* 랜딩페이지(water/, air/)는 window.LOADER_SCRIPTS 로 필요한 스크립트만 지정합니다(<base href="../"> 기준 상대경로). */
var SCRIPTS = window.LOADER_SCRIPTS || ['js/core.js', 'js/pages.js', 'js/app.js', 'js/floating.js'];
function boot(){
  SCRIPTS.forEach(function(src){ var s = document.createElement('script'); s.src = src; s.async = false; document.body.appendChild(s); });
}
function run(){
  var done = false;
  var go = function(){ if (done) return; done = true; boot(); };
  try {
    if (!window.fetch || !window.CescoOverrides || location.protocol === 'file:') return go();
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function(){ if (ctl) ctl.abort(); go(); }, 4000);
    fetch('data/price-overrides.json?v=' + Date.now(), { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(ov){
        if (done) return;
        if (ov && window.CescoOverrides.valid(ov)) {
          var next = window.CescoOverrides.apply(window.CESCO_PRODUCTS, ov);
          window.CESCO_PRODUCTS.splice.apply(window.CESCO_PRODUCTS, [0, window.CESCO_PRODUCTS.length].concat(next));
        }
      })
      .catch(function(){})
      .then(function(){ clearTimeout(timer); go(); });
  } catch (e) { go(); }
}
run();
})();
