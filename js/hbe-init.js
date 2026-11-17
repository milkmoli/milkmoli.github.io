/* hexo-blog-encrypt 兼容层
 *
 * 本站三个坑，统一在这里兜住，不改插件源码：
 *  1. 插件脚本写在页面内容里，swup 切页不执行 → 检测到加密容器就主动加载；
 *  2. 插件只在 DOMContentLoaded 自动 init，时机常早于容器插入 → 定时轮询补 init；
 *  3. 页面内可能同时存在新旧两个容器副本 → 逐个检查，未初始化的都补上。
 */
(function () {
  var loadingSrc = {};

  function initOne(el) {
    if (!el || el.__hbeInit) return false;
    try { window.hexoBlogEncrypt.init(el); return true; } catch (e) { return false; }
    }

  function containers() {
    return [].slice.call(document.querySelectorAll('#hexo-blog-encrypt, .hbe-container, [data-hbe-format]'));
  }

  function bundleSrc() {
    var tag = document.querySelector('script[src*="/lib/hbe."]');
    return tag ? tag.getAttribute('src') : null;
  }

  function loadBundle() {
    var src = bundleSrc();
    if (!src || loadingSrc[src]) return;
    loadingSrc[src] = true;
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { tick(); };
    document.head.appendChild(s);
  }

  function tick() {
    var list = containers();
    if (!list.length) return;
    if (!window.hexoBlogEncrypt || typeof window.hexoBlogEncrypt.init !== 'function') { loadBundle(); return; }
    list.forEach(initOne);
  }

  // 主循环：每 300ms 检查一次，持续 60 秒
  var ticks = 0;
  var timer = setInterval(function () {
    tick();
    if (++ticks > 200) clearInterval(timer);
  }, 300);

  ['swup:page:view', 'swup:content:replace', 'swup:visit:end', 'swup:page:loaded', 'pjax:complete'].forEach(function (ev) {
    document.addEventListener(ev, function () { setTimeout(tick, 80); setTimeout(tick, 500); });
  });

  if (window.MutationObserver) {
    var m = null;
    new MutationObserver(function () {
      if (m) return;
      m = setTimeout(function () { m = null; tick(); }, 100);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
  window.addEventListener('load', tick);
})();
