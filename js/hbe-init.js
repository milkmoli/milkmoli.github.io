/* hexo-blog-encrypt 补初始化
 *
 * 官方插件在 DOMContentLoaded 时自动 init 一次，但本站的布局/脚本顺序会让它跑在容器插入之前，
 * 表现为「密码框点了没反应」。这里不修改插件源码，只在合适的时机调用它暴露的 init()：
 *   - 轮询等待插件脚本就绪（最多 10 秒）
 *   - 加载完成、swup 切页、DOM 变化时补一次
 */
(function () {
  var inited = 0;

  function initHbe() {
    if (!window.hexoBlogEncrypt || typeof window.hexoBlogEncrypt.init !== 'function') return false;
    try { window.hexoBlogEncrypt.init(document); inited++; } catch (e) {}
    return true;
  }

  // 插件是外链脚本，可能晚于本文件到达：轮询等它就绪
  var tries = 0;
  (function wait() {
    if (initHbe()) return;
    if (++tries > 50) return;
    setTimeout(wait, 200);
  })();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHbe);
  else setTimeout(initHbe, 0);
  window.addEventListener('load', initHbe);

  ['swup:page:view', 'swup:content:replace', 'swup:visit:end', 'swup:page:loaded', 'pjax:complete'].forEach(function (ev) {
    document.addEventListener(ev, function () { setTimeout(initHbe, 60); });
  });

  if (window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (timer) return;
      timer = setTimeout(function () { timer = null; initHbe(); }, 100);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
