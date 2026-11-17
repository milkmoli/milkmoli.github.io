/* hexo-blog-encrypt 兼容层
 *
 * 本站有两个坑，这里一次性兜住，不修改插件源码：
 *  1. 插件脚本是页面内 <script src>，swup 切页时不会执行 → 主动加载一次；
 *  2. 插件只在 DOMContentLoaded 自动 init，容器可能晚于它 → 就绪后补调 init()。
 */
(function () {
  var loading = false;

  function initHbe() {
    if (!window.hexoBlogEncrypt || typeof window.hexoBlogEncrypt.init !== 'function') return false;
    try { window.hexoBlogEncrypt.init(document); } catch (e) {}
    return true;
  }

  // 找页面里插件脚本的地址（加密页会带 <script src="/lib/hbe.xxxx.js">）
  function bundleSrc() {
    var tag = document.querySelector('script[src*="/lib/hbe."]');
    return tag ? tag.getAttribute('src') : null;
  }

  function ensure() {
    if (initHbe()) return true;
    if (loading) return false;
    var src = bundleSrc();
    if (!src) return false;
    loading = true;
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { loading = false; initHbe(); };
    s.onerror = function () { loading = false; };
    document.head.appendChild(s);
    return false;
  }

  // 等脚本就绪（最多 10 秒）
  var tries = 0;
  (function wait() {
    if (ensure()) return;
    if (++tries > 50) return;
    setTimeout(wait, 200);
  })();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ensure);
  else setTimeout(ensure, 0);
  window.addEventListener('load', ensure);

  ['swup:page:view', 'swup:content:replace', 'swup:visit:end', 'swup:page:loaded', 'pjax:complete'].forEach(function (ev) {
    document.addEventListener(ev, function () { setTimeout(ensure, 60); setTimeout(ensure, 600); });
  });

  if (window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (timer) return;
      timer = setTimeout(function () { timer = null; ensure(); }, 100);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
