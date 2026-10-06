/* inquiries.js — 관리자 "상담 신청 목록" 탭
   Apps Script 웹 앱(tools/apps-script/Code.gs)의 doGet 으로 목록 조회·상태 변경을 합니다.
   ▸ 웹 앱 URL: data/site.js 의 CONFIG.formEndpoint (이 브라우저에서만 다른 주소를 쓰려면 아래 설정 칸에 입력 → localStorage)
   ▸ ADMIN_KEY: 관리자가 이 화면에서 한 번 입력 → 이 브라우저 localStorage 에만 저장(코드·저장소에 저장하지 않음) */
(function(){
'use strict';
var LS_EP = 'cescoAdminFormEndpoint', LS_KEY = 'cescoAdminFormKey';
var STATUSES = ['신규', '연락함', '상담완료', '보류'];
var $ = function(s, r){ return (r || document).querySelector(s); };
var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(m){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); };
var ls = { get: function(k){ try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }, set: function(k, v){ try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} } };
var items = [], loaded = false, busy = false;

function siteEp(){ return (window.CONFIG && window.CONFIG.formEndpoint) || ''; }
function ep(){ return ls.get(LS_EP) || siteEp(); }
function key(){ return ls.get(LS_KEY); }
function ready(){ return /^https?:\/\//.test(ep()) && !!key(); }
function toast(msg){ var t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(function(){ t.classList.remove('show'); }, 3200); }

/* GET 호출: fetch(JSON) → 실패 시 JSONP 로 한 번 더 (Apps Script 리디렉션·CORS 환경 차이 대비) */
function call(params){
  var url = ep() + (ep().indexOf('?') < 0 ? '?' : '&') + Object.keys(params).map(function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
  return fetch(url, { method: 'GET', cache: 'no-store', redirect: 'follow' })
    .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .catch(function(){ return jsonp(url); });
}
function jsonp(url){
  return new Promise(function(res, rej){
    var cb = '__inq' + Date.now() + Math.floor(Math.random() * 1000), s = document.createElement('script'), done = false;
    var fin = function(){ done = true; try { delete window[cb]; } catch (e) { window[cb] = undefined; } s.remove(); };
    window[cb] = function(d){ fin(); res(d); };
    s.onerror = function(){ if (!done) { fin(); rej(new Error('NETWORK')); } };
    setTimeout(function(){ if (!done) { fin(); rej(new Error('TIMEOUT')); } }, 15000);
    s.src = url + '&callback=' + cb; document.head.appendChild(s);
  });
}
var ERR = { UNAUTHORIZED: 'ADMIN_KEY가 맞지 않습니다.', ADMIN_KEY_NOT_SET: 'Apps Script의 스크립트 속성에 ADMIN_KEY가 아직 없습니다.', INVALID_STATUS: '잘못된 상태 값입니다.', INVALID_ROW: '행을 찾을 수 없습니다. 새로고침 후 다시 시도하세요.', ROW_MISMATCH: '시트 행이 바뀌었습니다. 새로고침 후 다시 시도하세요.' };

function badge(){
  var n = items.filter(function(i){ return !i.status || i.status === '신규'; }).length, b = $('#inqBadge');
  if (!b) return; b.textContent = n; b.hidden = !loaded || !n;
}
function setupHtml(){
  return '<div class="card"><h2>연결 설정</h2>' +
    (ready() ? '' : '<div class="warn">상담 신청 목록을 보려면 <b>Apps Script 웹 앱 URL</b>과 <b>ADMIN_KEY</b>가 필요합니다. 설치 방법은 작업 폴더의 <code>tools/apps-script/README.md</code>(Apps Script 설치 가이드)를 참고하세요.<ol class="steps" style="margin-top:8px"><li>구글 시트에 Apps Script(Code.gs) 붙여넣기 → 스크립트 속성에 <code>ADMIN_KEY</code> 추가 → 웹 앱으로 배포</li><li>배포 URL(<code>https://script.google.com/macros/s/…/exec</code>)을 <code>data/site.js</code>의 <code>formEndpoint</code>에 넣고 게시 (그래야 사이트 상담 폼이 시트로 전송됩니다)</li><li>아래에 같은 URL과 ADMIN_KEY를 입력 → 저장</li></ol></div>') +
    '<label class="fld">Apps Script 웹 앱 URL <small style="font-weight:400;color:var(--muted)">' + (siteEp() ? '사이트 설정(data/site.js) 값: <code>' + esc(siteEp()) + '</code> — 비워 두면 이 값을 사용' : '사이트 설정(data/site.js)의 formEndpoint가 비어 있습니다') + '</small>' +
    '<input id="inqEp" type="url" placeholder="https://script.google.com/macros/s/…/exec" value="' + esc(ls.get(LS_EP)) + '" spellcheck="false" autocomplete="off"></label>' +
    '<label class="fld">ADMIN_KEY <div class="tok-row"><input id="inqKey" type="password" placeholder="스크립트 속성에 넣은 ADMIN_KEY" value="' + esc(key()) + '" autocomplete="off" spellcheck="false"><button class="btn ghost sm" id="inqKeyShow" type="button">보기</button></div></label>' +
    '<div class="row-btn"><button class="btn primary sm" id="inqSave" type="button">저장</button><button class="btn ghost sm" id="inqTest" type="button">연결 테스트</button><button class="btn ghost sm" id="inqClear" type="button">저장값 삭제</button><span class="tok-state" id="inqState"></span></div>' +
    '<div class="note-sm">URL·ADMIN_KEY는 <b>이 브라우저(localStorage)에만</b> 저장됩니다. 공용 PC에서는 사용 후 "저장값 삭제"를 누르세요.</div></div>';
}
function listHtml(){
  var q = ($('#inqQ') && $('#inqQ').value || '').trim().toLowerCase(), st = $('#inqSt') ? $('#inqSt').value : 'all';
  var rows = items.filter(function(i){
    if (st !== 'all' && (i.status || '신규') !== st) return false;
    if (q && [i.name, i.phone, i.category, i.product, i.region, i.message, i.page, i.utm].join(' ').toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  var tel = function(p){ return String(p || '').replace(/[^\d+]/g, ''); };
  return '<div class="count">' + rows.length + '건 표시 · 전체 ' + items.length + '건 · 신규 ' + items.filter(function(i){ return !i.status || i.status === '신규'; }).length + '건</div>' +
    (rows.length ? '<div class="table-wrap"><table class="grid inq-grid"><thead><tr><th>제출시각(KST)</th><th>상태</th><th>이름</th><th>연락처</th><th>관심 카테고리 / 상품</th><th>지역</th><th>희망 연락 시간</th><th>메시지</th><th>유입</th></tr></thead><tbody>' +
    rows.map(function(i){
      return '<tr class="st-' + esc(i.status || '신규') + '"><td data-label="제출시각">' + esc(i.at) + '<br><small class="muted">' + esc(i.id) + '</small></td>' +
        '<td data-label="상태"><select data-row="' + i.row + '" data-id="' + esc(i.id) + '" class="inq-st" aria-label="상태 변경">' + STATUSES.map(function(s){ return '<option' + ((i.status || '신규') === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td>' +
        '<td data-label="이름"><b>' + esc(i.name) + '</b><br><small class="muted">' + esc(i.kind) + '</small></td>' +
        '<td data-label="연락처">' + esc(i.phone) + '<div class="inq-act"><a class="btn ghost sm" href="tel:' + esc(tel(i.phone)) + '">전화</a><a class="btn ghost sm" href="sms:' + esc(tel(i.phone)) + '">문자</a></div></td>' +
        '<td data-label="관심">' + esc(i.category) + (i.product ? '<br><small>' + esc(i.product) + '</small>' : '') + '</td>' +
        '<td data-label="지역">' + esc(i.region) + '</td><td data-label="희망 시간">' + esc(i.time) + '</td>' +
        '<td data-label="메시지" data-full class="inq-msg">' + esc(i.message) + '</td>' +
        '<td data-label="유입">' + esc(i.page) + (i.utm ? '<br><small class="muted">' + esc(i.utm) + '</small>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>' : '<div class="empty">' + (loaded ? '조건에 맞는 신청이 없습니다.' : '아직 불러오지 않았습니다.') + '</div>');
}
function render(){
  var root = $('#tab-inquiries'); if (!root) return;
  root.innerHTML = setupHtml() + (ready() ? '<div class="filters" style="position:static"><input id="inqQ" type="search" placeholder="이름·연락처·지역·메시지 검색" aria-label="검색"><select id="inqSt" aria-label="상태"><option value="all">전체 상태</option>' + STATUSES.map(function(s){ return '<option>' + s + '</option>'; }).join('') + '</select><button class="btn primary sm" id="inqLoad" type="button">새로고침</button><button class="btn ghost sm" id="inqCsv" type="button">CSV 내보내기</button></div><div id="inqList">' + listHtml() + '</div>' : '');
  badge();
}
function renderList(){ var l = $('#inqList'); if (l) l.innerHTML = listHtml(); badge(); }
function load(silent){
  if (!ready() || busy) return Promise.resolve();
  busy = true; var b = $('#inqLoad'); if (b) { b.disabled = true; b.textContent = '불러오는 중…'; }
  return call({ action: 'list', key: key(), limit: 500 }).then(function(d){
    if (!d || !d.ok) throw new Error((d && ERR[d.error]) || (d && d.error) || '응답 오류');
    items = d.items || []; loaded = true; renderList(); if (!silent) toast('상담 신청 ' + items.length + '건을 불러왔습니다.');
  }).catch(function(e){ if (!silent) toast('불러오기 실패: ' + e.message); var s = $('#inqState'); if (s) s.textContent = '불러오기 실패: ' + e.message; })
    .then(function(){ busy = false; var b2 = $('#inqLoad'); if (b2) { b2.disabled = false; b2.textContent = '새로고침'; } });
}
function csv(){
  var cols = [['id', '접수번호'], ['at', '제출시각(KST)'], ['status', '상태'], ['name', '이름'], ['phone', '연락처'], ['kind', '장소'], ['category', '관심 카테고리'], ['product', '관심 상품'], ['region', '지역'], ['time', '희망 연락 시간'], ['message', '메시지'], ['page', '유입 페이지'], ['utm', 'UTM'], ['url', '유입 URL'], ['referrer', '리퍼러'], ['agree', '개인정보 동의'], ['updatedAt', '상태 변경 시각']];
  var cell = function(v){ v = v == null ? '' : String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  var txt = '\uFEFF' + cols.map(function(c){ return c[1]; }).join(',') + '\r\n' + items.map(function(i){ return cols.map(function(c){ return cell(i[c[0]]); }).join(','); }).join('\r\n');
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
  var dt = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '_');   // KST
  a.download = '상담신청_' + dt + '.csv'; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
document.addEventListener('click', function(e){
  var t = e.target; if (!t || !t.closest || !t.closest('#tab-inquiries')) return;
  if (t.id === 'inqSave') { ls.set(LS_EP, $('#inqEp').value.trim()); ls.set(LS_KEY, $('#inqKey').value.trim()); render(); if (ready()) load(); else toast('URL과 ADMIN_KEY를 모두 입력하세요.'); }
  else if (t.id === 'inqClear') { if (!confirm('이 브라우저에 저장된 URL·ADMIN_KEY를 삭제할까요?')) return; ls.set(LS_EP, ''); ls.set(LS_KEY, ''); items = []; loaded = false; render(); }
  else if (t.id === 'inqKeyShow') { var k = $('#inqKey'); k.type = k.type === 'password' ? 'text' : 'password'; t.textContent = k.type === 'password' ? '보기' : '숨기기'; }
  else if (t.id === 'inqTest') { var s = $('#inqState'); s.textContent = '확인 중…'; var url0 = ($('#inqEp').value.trim() || siteEp()), k0 = $('#inqKey').value.trim();
    if (!/^https?:\/\//.test(url0)) { s.textContent = 'URL을 입력하세요.'; return; }
    var save = ls.get(LS_EP), saveK = ls.get(LS_KEY); ls.set(LS_EP, url0); ls.set(LS_KEY, k0);
    call({ action: 'list', key: k0, limit: 1 }).then(function(d){ s.textContent = d && d.ok ? '✓ 연결됨 (신규 ' + d.newCount + '건)' : '✗ ' + ((d && ERR[d.error]) || (d && d.error) || '응답 오류'); })
      .catch(function(err){ s.textContent = '✗ 연결 실패: ' + err.message; }).then(function(){ ls.set(LS_EP, save); ls.set(LS_KEY, saveK); }); }
  else if (t.id === 'inqLoad') load();
  else if (t.id === 'inqCsv') { if (!items.length) { toast('내보낼 신청이 없습니다.'); return; } csv(); }
});
document.addEventListener('change', function(e){
  var t = e.target; if (!t || !t.closest || !t.closest('#tab-inquiries')) return;
  if (t.id === 'inqSt') renderList();
  if (t.classList.contains('inq-st')) {
    var row = +t.dataset.row, id = t.dataset.id, st = t.value, it = items.filter(function(i){ return i.row === row; })[0], prev = it ? it.status : '';
    t.disabled = true;
    call({ action: 'update', key: key(), row: row, id: id, status: st }).then(function(d){
      if (!d || !d.ok) throw new Error((d && ERR[d.error]) || (d && d.error) || '응답 오류');
      if (it) { it.status = st; it.updatedAt = d.updatedAt; } renderList(); toast('상태를 "' + st + '"(으)로 바꿨습니다.');
    }).catch(function(err){ t.value = prev || '신규'; t.disabled = false; toast('상태 변경 실패: ' + err.message); });
  }
});
document.addEventListener('input', function(e){ if (e.target && e.target.id === 'inqQ') renderList(); });

window.AdminInquiries = {
  start: function(){ render(); if (ready()) load(true); },   // 로그인 후: 조용히 불러와 새 신청 뱃지 표시
  show: function(){ render(); if (ready() && !loaded) load(); }
};
})();
