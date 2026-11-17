/* 文章图片查看器（Viewer.js）
 * 替换之前的简易灯箱：支持双指缩放、滑动切换、旋转、全屏、缩略图列表。
 * 用「按需创建 + SPA 切页后重建」的方式，避免 swup 换页后失效。
 */
(function () {
  if (window.__blogViewer) return;
  window.__blogViewer = true;

  var viewer = null;
  var currentRoot = null;

  var OPTIONS = {
    navbar: false,
    title: function (image) { return image.alt || ''; },
    toolbar: {
      zoomIn: 1, zoomOut: 1, oneToOne: 1, reset: 1,
      rotateLeft: 1, rotateRight: 1,
      flipHorizontal: 0, flipVertical: 0,
      prev: 1, next: 1, play: 0, fullscreen: 1
    },
    keyboard: true,
    loop: true,
    movable: true,
    zoomable: true,
    scalable: true,
    rotatable: true,
    tooltip: true,
    fullscreen: true,
    transition: true,
    backdrop: true,
    zoomRatio: 0.1,
    minZoomRatio: 0.2,
    maxZoomRatio: 8,
    slideOnTouch: true,
    zoomOnTouch: true,
    zoomOnWheel: true,
    toggleOnDblclick: true
  };

  function contentRoot() {
    return document.querySelector('.markdown-body');
  }

  function ensureViewer(root) {
    if (!window.Viewer || !root) return null;
    if (viewer && currentRoot === root) { try { viewer.update(); } catch (e) {} return viewer; }
    if (viewer) { try { viewer.destroy(); } catch (e) {} viewer = null; }
    currentRoot = root;
    viewer = new window.Viewer(root, OPTIONS);
    return viewer;
  }

  // 捕获阶段接管：避免主题自带的看图组件抢事件
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    var root = t.closest('.markdown-body');
    if (!root) return;
    // Viewer.js 还没加载完（网络慢）时不要拦截，退回到主题自带的行为
    if (!window.Viewer) return;
    e.preventDefault();
    e.stopPropagation();
    var v = ensureViewer(root);
    if (!v) return;
    var index = [].slice.call(root.querySelectorAll('img')).indexOf(t);
    if (index < 0) return;
    v.view(index);
  }, true);

  // SPA 切页：内容换了要重建实例
  function refresh() {
    var root = contentRoot();
    if (!root) return;
    if (root !== currentRoot) {
      if (viewer) { try { viewer.destroy(); } catch (e) {} viewer = null; currentRoot = null; }
    }
  }
  ['swup:page:view', 'swup:content:replace', 'swup:visit:end', 'swup:page:loaded'].forEach(function (ev) {
    document.addEventListener(ev, function () { setTimeout(refresh, 80); });
  });

  // 解密后的内容、懒加载图片等动态插入时也能纳入
  if (window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (timer) return;
      timer = setTimeout(function () { timer = null; if (viewer) { try { viewer.update(); } catch (e) {} } }, 200);
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
