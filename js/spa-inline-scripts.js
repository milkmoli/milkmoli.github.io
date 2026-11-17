/* SPA 内联脚本修复
 *
 * 主题开了 single_page（swup），切页时新内容里的 <script> 不会被执行；
 * 即使执行，脚本里注册的 DOMContentLoaded 也早已触发过，回调永远不会跑。
 *
 * 这里做两件事：
 *   1. 页面已加载完成后再注册的 DOMContentLoaded 回调，立即异步执行；
 *   2. 把内容区里「还没执行过」的 script 重新插入一遍（浏览器会执行它）。
 * 这样统计图、以及其他依赖内联脚本的功能，切页后都能正常工作。
 */
(function () {
  if (window.__spaInlineFix) return;
  window.__spaInlineFix = true;

  var origAdd = document.addEventListener.bind(document);
  document.addEventListener = function (type, fn, opts) {
    if (type === 'DOMContentLoaded' && document.readyState !== 'loading') {
      setTimeout(function () { try { fn(new Event('DOMContentLoaded')); } catch (e) {} }, 0);
      return;
    }
    return origAdd(type, fn, opts);
  };

  function contentRoot() {
    return document.getElementById('swup') || document.body;
  }

  function runInlineScripts(root) {
    var host = root || contentRoot();
    if (!host || !host.querySelectorAll) return 0;
    var scripts = [].slice.call(host.querySelectorAll('script'));
    var ran = 0;
    scripts.forEach(function (old) {
      if (!old.parentNode) return;
      if (old.getAttribute('data-executed') === '1') return;
      old.setAttribute('data-executed', '1');
      var s = document.createElement('script');
      if (old.src) s.src = old.src;
      else s.textContent = old.textContent;
      try { old.parentNode.replaceChild(s, old); ran++; } catch (e) {}
    });
    return ran;
  }

  window.__runInlineScripts = runInlineScripts;

  /* 图表脚本（hexo-graph 等注入在 body 末尾的脚本）不在内容区里，
     切页后需要单独补跑：只在目标容器存在且还没渲染时执行。 */
  var chartScripts = [];
  function collectChartScripts() {
    chartScripts = [].slice.call(document.querySelectorAll('body script:not([src])'))
      .filter(function (s) { return (s.textContent || '').indexOf('echarts.init') >= 0; })
      .map(function (s) { return s.textContent; });
  }
  function chartTargets(code) {
    var ids = [];
    var re = /getElementById\(['"]([^'"]+)['"]\)/g;
    var m;
    while ((m = re.exec(code))) ids.push(m[1]);
    return ids;
  }
  function runChartScripts() {
    if (!chartScripts.length) return 0;
    var ran = 0;
    chartScripts.forEach(function (code) {
      var ids = chartTargets(code);
      var needs = ids.some(function (id) {
        var dom = document.getElementById(id);
        return dom && !dom.querySelector('canvas') && !dom.getAttribute('_echarts_instance_');
      });
      if (!needs) return;
      var s = document.createElement('script');
      s.textContent = code;
      document.body.appendChild(s);
      ran++;
    });
    return ran;
  }
  window.__runChartScripts = runChartScripts;

  function boot() {
    // 首屏的脚本已经由浏览器执行过，打个标记避免重复执行
    [].slice.call(contentRoot().querySelectorAll('script')).forEach(function (s) {
      s.setAttribute('data-executed', '1');
    });
    collectChartScripts();
    var events = ['swup:page:view', 'swup:content:replace', 'swup:visit:end', 'swup:page:loaded'];
    events.forEach(function (ev) {
      document.addEventListener(ev, function () {
        setTimeout(function () { runInlineScripts(); runChartScripts(); }, 60);
      });
    });
    if (window.MutationObserver) {
      var timer = null;
      new MutationObserver(function () {
        if (timer) return;
        timer = setTimeout(function () { timer = null; runInlineScripts(); runChartScripts(); }, 80);
      }).observe(contentRoot(), { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') origAdd('DOMContentLoaded', boot);
  else boot();
})();
