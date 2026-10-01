/* auth.js — 관리자 화면 잠금(클라이언트 측). 비밀번호 평문은 어디에도 없고, 솔트 + PBKDF2-HMAC-SHA256(20만 회) 해시만 들어 있습니다.
   ⚠ 정적 사이트라 이 코드는 누구나 볼 수 있습니다. 화면 잠금 수준일 뿐 진짜 보안이 아니며,
      실제 쓰기 권한은 "GitHub 토큰"이 가집니다. 비밀번호를 바꾸려면 tools/make_admin_hash.py 를 실행해 아래 값을 교체하세요. */
(function(){
'use strict';
var AUTH = { iter: 200000, salt: 'ce9081b59848c20e0be22091047070b0', hash: 'c68e7c5190f0a6d1ce0dc6b485e5d81eba9371239cb0536380f916068c73c580' };
var KEY = 'cescoAdminAuth';
function hex(buf){ return Array.prototype.map.call(new Uint8Array(buf), function(b){ return ('0' + b.toString(16)).slice(-2); }).join(''); }
function unhex(h){ var a = new Uint8Array(h.length / 2); for (var i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16); return a; }
async function digest(id, pw){
  if (!window.crypto || !crypto.subtle) throw new Error('NOCRYPTO');
  var enc = new TextEncoder();
  var key = await crypto.subtle.importKey('raw', enc.encode(id + '\n' + pw), 'PBKDF2', false, ['deriveBits']);
  var bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unhex(AUTH.salt), iterations: AUTH.iter }, key, 256);
  return hex(bits);
}
async function verify(id, pw){
  var h = await digest(String(id || '').trim(), String(pw || ''));
  var d = 0; for (var i = 0; i < h.length; i++) d |= h.charCodeAt(i) ^ AUTH.hash.charCodeAt(i);
  return d === 0 && h.length === AUTH.hash.length;
}
window.AdminAuth = {
  verify: verify,
  isIn: function(){ try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } },
  login: function(){ try { sessionStorage.setItem(KEY, '1'); } catch (e) {} },
  logout: function(){ try { sessionStorage.removeItem(KEY); } catch (e) {} }
};
})();
