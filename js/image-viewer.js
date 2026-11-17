/* 文章图片查看器（GLightbox）
 * 单实例复用：只创建一个 lightbox，切换图集时 setElements，避免重复实例叠加。
 * 过滤无效图片（空地址、/、data 占位符），否则点坏了会跳到站点根目录。
 */
(function () {
  if (window.__blogLightbox) return;
  window.__blogLightbox = true;

  var lightbox = null;

  function srcOf(img) {
    return (img.currentSrc || img.getAttribute('src') || '').trim();
  }

  function isUsable(img) {
    var src = srcOf(img);
    if (!src) return false;
    if (src === '/' || src === location.origin + '/') return false;
    if (/^data:/i.test(src) && !/^data:image\/(png|jpe?g|webp|gif)/i.test(src)) return false;
    // 头像、图标之类的小图不进图集
    if (img.naturalWidth && img.naturalWidth < 150) return false;
    if (img.clientWidth && img.clientWidth < 120) return false;
    return true;
  }

  function usableImages(root) {
    return [].slice.call(root.querySelectorAll('img')).filter(isUsable);
  }

  // 正文容器在不同页面上不一样，从被点的图往上找第一个「真的有图」的容器
  // 只用正文容器：封面、头像、底部推荐阅读的缩略图都不算
  var ROOTS = ['.markdown-body', '.article-content'];
  function findRoot(img) {
    for (var i = 0; i < ROOTS.length; i++) {
      var el = img.closest(ROOTS[i]);
      if (el && el.querySelectorAll('img').length) return el;
    }
    return null;
  }

  function instance() {
    if (!lightbox) {
      lightbox = window.GLightbox({
        touchNavigation: true,
        loop: true,
        zoomable: true,
        draggable: true,
        openEffect: 'fade',
        closeEffect: 'fade',
        slideEffect: 'slide'
      });
    }
    return lightbox;
  }

  function open(root, target) {
    if (!window.GLightbox) return;
    var imgs = usableImages(root);
    var index = imgs.indexOf(target);
    if (index < 0) return;
    var elements = imgs.map(function (img) {
      return { href: srcOf(img), type: 'image', description: img.getAttribute('alt') || '' };
    });
    var lb = instance();
    lb.setElements(elements);
    lb.openAt(index);
  }

  // 捕获阶段接管，压住主题自带的看图组件
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    if (t.closest('.glightbox-container')) return;
    var root = findRoot(t);
    if (!root) return;
    if (!window.GLightbox) return;
    if (!isUsable(t)) return;
    // 浮层已经打开时，忽略页面上的新点击，避免反复开关
    if (document.body.classList.contains('glightbox-open')) return;
    e.preventDefault();
    e.stopPropagation();
    open(root, t);
  }, true);
})();
