/* hexo-encrypt client v0.6.0
 * 修复要点：
 *  1. 从文章内联脚本改为全局加载 —— swup/pjax 切换页面不会执行新注入的内联 <script>
 *  2. init() 可重入，靠 data-encrypt-ready 去重
 *  3. 事件统一在 document 上委托，只绑一次
 *  4. MutationObserver + swup 事件兜底，任何方式进入页面都能挂上
 */
(function () {
  'use strict';

  var CACHE_PREFIX = 'hexo_encrypt_';
  var tries = 0;
  var bound = false;

  function byId(id) { return document.getElementById(id); }

  function getData() {
    var meta = byId('encryptMeta');
    if (!meta) return null;
    try {
      var data = JSON.parse(meta.textContent);
      if (!data || !data.content) return null;
      return {
        cipherContent: data.content,
        cipherKeys: data.keys || [],
        maxTries: data.maxTries || 3,
        postId: data.postId || '',
        remember: data.remember || '',
        rememberDays: data.rememberDays || 7
      };
    } catch (e) { return null; }
  }

  function els() {
    return {
      box: byId('encryptBox'),
      input: byId('encPwdInput'),
      btn: byId('unlockBtn'),
      errorMsg: byId('errorMsg'),
      wrapper: byId('inputWrapper'),
      content: byId('decryptedContent')
    };
  }

  function storageFor(remember) {
    return remember === 'session' ? window.sessionStorage : window.localStorage;
  }
  function cacheKey(id) { return CACHE_PREFIX + id; }

  function updateLabel() {
    var e = els();
    if (!e.input || !e.wrapper) return;
    var active = document.activeElement === e.input || e.input.value.length > 0;
    if (active) e.wrapper.classList.add('active');
    else e.wrapper.classList.remove('active');
  }

  function showError(msg) {
    var e = els();
    if (!e.errorMsg) return;
    e.errorMsg.textContent = msg || '密码错误';
    e.errorMsg.classList.add('show');
    if (e.input) { e.input.value = ''; try { e.input.focus(); } catch (err) {} }
  }

  function hideError() {
    var e = els();
    if (e.errorMsg) e.errorMsg.classList.remove('show');
  }

  function showContent(plain) {
    var e = els();
    if (!e.content || !e.box) return;
    e.content.innerHTML = plain +
      '<div class="re-encrypt-wrapper"><button class="re-encrypt-btn" data-encrypt-reset="1">加密</button></div>';
    e.content.style.display = 'block';
    e.box.style.display = 'none';
    if (window.MathJax && window.MathJax.typeset) {
      try { window.MathJax.typeset(); } catch (err) {}
    }
    var d = getData();
    if (d && d.remember) {
      try {
        storageFor(d.remember).setItem(cacheKey(d.postId), JSON.stringify({ content: plain, timestamp: Date.now() }));
      } catch (err) {}
    }
  }

  function loadFromCache() {
    var d = getData();
    if (!d || !d.remember) return false;
    try {
      var storage = storageFor(d.remember);
      var raw = storage.getItem(cacheKey(d.postId));
      if (!raw) return false;
      var cache = JSON.parse(raw);
      if (d.remember !== 'session' && d.rememberDays > 0) {
        if (Date.now() - cache.timestamp > d.rememberDays * 86400000) {
          storage.removeItem(cacheKey(d.postId));
          return false;
        }
      }
      showContent(cache.content);
      return true;
    } catch (err) { return false; }
  }

  function clearCache() {
    var d = getData();
    if (!d) return;
    try { storageFor(d.remember).removeItem(cacheKey(d.postId)); } catch (err) {}
  }

  function lockInput() {
    var e = els();
    if (e.input) e.input.disabled = true;
    if (e.btn) e.btn.disabled = true;
    showError('尝试次数过多，请刷新页面');
  }

  function fail(d) {
    tries += 1;
    if (tries >= d.maxTries) lockInput();
    else showError('密码错误');
  }

  function unlock() {
    var e = els();
    var d = getData();
    if (!e.input || !e.btn || !d) return;
    if (e.input.disabled) return;
    if (typeof window.CryptoJS === 'undefined') { showError('解密库未加载，请刷新页面'); return; }
    var pwd = e.input.value.trim();
    if (!pwd) { showError('请输入密码'); return; }

    var randomKey = null;
    for (var i = 0; i < d.cipherKeys.length; i += 1) {
      try {
        var out = window.CryptoJS.AES.decrypt(d.cipherKeys[i], pwd).toString(window.CryptoJS.enc.Utf8);
        if (out) { randomKey = out; break; }
      } catch (err) {}
    }
    if (!randomKey) { fail(d); return; }

    try {
      var plain = window.CryptoJS.AES.decrypt(d.cipherContent, randomKey).toString(window.CryptoJS.enc.Utf8);
      if (!plain) throw new Error('empty');
      tries = 0;
      hideError();
      showContent(plain);
    } catch (err) { fail(d); }
  }

  function reset() {
    var e = els();
    if (!e.box || !e.content) return;
    e.box.style.display = 'block';
    e.content.style.display = 'none';
    e.content.innerHTML = '';
    if (e.input) { e.input.value = ''; e.input.disabled = false; }
    if (e.btn) e.btn.disabled = false;
    hideError();
    if (e.wrapper) e.wrapper.classList.remove('active');
    clearCache();
    tries = 0;
    if (e.input) { try { e.input.focus(); } catch (err) {} }
  }

  function bindOnce() {
    if (bound) return;
    bound = true;
    document.addEventListener('focusin', function (ev) {
      if (ev.target && ev.target.id === 'encPwdInput') updateLabel();
    });
    document.addEventListener('focusout', function (ev) {
      if (ev.target && ev.target.id === 'encPwdInput') updateLabel();
    });
    document.addEventListener('input', function (ev) {
      if (ev.target && ev.target.id === 'encPwdInput') { hideError(); updateLabel(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.target && ev.target.id === 'encPwdInput' && ev.key === 'Enter') {
        ev.preventDefault();
        unlock();
      }
    });
    document.addEventListener('click', function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      if (t.closest('#unlockBtn')) { unlock(); return; }
      if (t.closest('[data-encrypt-reset]')) { reset(); }
    });
  }

  function init() {
    var box = byId('encryptBox');
    if (!box) return;
    if (box.dataset.encryptReady === '1') { updateLabel(); return; }
    box.dataset.encryptReady = '1';
    bindOnce();
    tries = 0;
    if (!loadFromCache()) {
      var e = els();
      if (e.input) { try { e.input.focus(); } catch (err) {} }
      updateLabel();
    }
  }

  function boot() {
    init();
    var events = ['swup:page:view', 'swup:content:replace', 'swup:page:loaded', 'swup:visit:end', 'pjax:complete', 'turbo:load', 'hexo:page:load'];
    for (var i = 0; i < events.length; i += 1) {
      document.addEventListener(events[i], function () { setTimeout(init, 0); });
    }
    if (window.MutationObserver) {
      var timer = null;
      var observer = new MutationObserver(function () {
        if (timer) return;
        timer = setTimeout(function () { timer = null; init(); }, 60);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    window.hexoEncryptInit = init;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
