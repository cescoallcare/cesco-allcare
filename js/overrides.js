/* overrides.js — 상품 데이터 오버라이드(data/price-overrides.json) 적용/차이 계산. 사이트(loader.js)와 관리자(/admin)가 공유합니다.
   파일 형식(version 1):
   { "version":1, "updatedAt":"ISO", "patches":{ "<상품ID>":{ "buyPrice":123000, ... } }, "added":[ {전체 상품 객체} ], "deleted":["<상품ID>"], "hidden":["<상품ID>"] }
   - patches: 기본 데이터(data/products.js) 대비 바뀐 필드만. 값이 null 이면 사이트에 "상담 시 안내"로 표시됩니다.
   - added: 관리자에서 새로 추가한 상품 / deleted: 삭제한 기본 상품 / hidden: 사이트에서 숨긴 상품 */
(function(root){
'use strict';
var clone = function(x){ return JSON.parse(JSON.stringify(x)); };
var same = function deq(a, b){
  if (a === b) return true;
  if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  var ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (var i = 0; i < ka.length; i++) { if (!Object.prototype.hasOwnProperty.call(b, ka[i]) || !deq(a[ka[i]], b[ka[i]])) return false; }
  return true;
};
function emptyOv(){ return { version: 1, updatedAt: null, patches: {}, added: [], deleted: [], hidden: [] }; }
function valid(ov){
  return !!ov && typeof ov === 'object' && ov.version === 1 && (!ov.patches || typeof ov.patches === 'object') &&
    (!ov.added || Array.isArray(ov.added)) && (!ov.deleted || Array.isArray(ov.deleted)) && (!ov.hidden || Array.isArray(ov.hidden));
}
/* base 를 건드리지 않고 새 배열을 돌려줌. opts.keepHidden 이면 숨김 상품을 남기고 hidden:true 를 붙임(관리자용). */
function apply(base, ov, opts){
  opts = opts || {};
  var list = clone(base);
  if (!valid(ov)) return list;
  var del = {}, hid = {};
  (ov.deleted || []).forEach(function(id){ del[id] = 1; });
  (ov.hidden || []).forEach(function(id){ hid[id] = 1; });
  var patches = ov.patches || {};
  list.forEach(function(p){ var pt = patches[p.id]; if (pt) Object.keys(pt).forEach(function(k){ p[k] = pt[k]; }); });
  list = list.filter(function(p){ return !del[p.id]; });
  var have = {}; list.forEach(function(p){ have[p.id] = 1; });
  (ov.added || []).forEach(function(p){ if (p && p.id && !have[p.id]) { list.push(clone(p)); have[p.id] = 1; } });
  if (opts.keepHidden) list.forEach(function(p){ p.hidden = !!hid[p.id]; });
  else list = list.filter(function(p){ return !hid[p.id]; });
  return list;
}
/* base 대비 work(관리자 작업본) 의 차이를 오버라이드 객체로 만든다. */
function diff(base, work){
  var ov = emptyOv();
  var baseMap = {}; base.forEach(function(p){ baseMap[p.id] = p; });
  var workMap = {};
  work.forEach(function(w){
    workMap[w.id] = 1;
    var b = baseMap[w.id];
    if (w.hidden) ov.hidden.push(w.id);
    if (!b) { var c = clone(w); delete c.hidden; ov.added.push(c); return; }
    var pt = {};
    Object.keys(w).forEach(function(k){ if (k === 'hidden' || k === 'deleted') return; if (!same(w[k], b[k])) pt[k] = w[k]; });
    Object.keys(b).forEach(function(k){ if (!(k in w)) pt[k] = null; });
    if (Object.keys(pt).length) ov.patches[w.id] = pt;
  });
  base.forEach(function(b){ if (!workMap[b.id]) ov.deleted.push(b.id); });
  return ov;
}
root.CescoOverrides = { apply: apply, diff: diff, emptyOv: emptyOv, valid: valid, clone: clone, same: same };
})(window);
