/* 文章图片查看器（Fancybox 6）
 * 功能：缩略图列表、放大/缩小、旋转、全屏、下载、幻灯片、键盘左右切换。
 * 每次点击直接 show()，不做实例复用；已打开时忽略新点击。
 */
(function () {
  if (window.__blogLightbox) return;
  window.__blogLightbox = true;

  function srcOf(img) {
    return (img.currentSrc || img.getAttribute('src') || '').trim();
  }

  function isUsable(img) {
    var src = srcOf(img);
    if (!src) return false;
    if (src === '/' || src === location.origin + '/') return false;
    if (/^data:/i.test(src) && !/^data:image\/(png|jpe?g|webp|gif)/i.test(src)) return false;
    if (img.naturalWidth && img.naturalWidth < 150) return false;
    if (img.clientWidth && img.clientWidth < 120) return false;
    return true;
  }

  function contentRoot(img) {
    var sels = ['.markdown-body', '.article-content'];
    for (var i = 0; i < sels.length; i++) {
      var el = img.closest(sels[i]);
      if (el && el.querySelectorAll('img').length) return el;
    }
    return null;
  }

  function open(root, target) {
    if (!window.Fancybox) return;
    var imgs = [].slice.call(root.querySelectorAll('img')).filter(isUsable);
    var index = imgs.indexOf(target);
    if (index < 0) return;
    var items = imgs.map(function (img) {
      return { src: srcOf(img), type: 'image', caption: img.getAttribute('alt') || '' };
    });
    window.Fancybox.show(items, {
      startIndex: index,
      dragToClose: false,
      Carousel: { infinite: true },
      Images: { zoom: true },
      Toolbar: {
        display: {
          left: ['counter'],
          middle: [],
          right: ['zoomIn', 'zoomOut', 'rotateCCW', 'rotateCW', 'flipX', 'thumbs', 'slideshow', 'fullscreen', 'download', 'close']
        }
      }
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    if (t.closest('.fancybox__container')) return;
    var root = contentRoot(t);
    if (!root) return;
    if (!window.Fancybox) return;
    if (!isUsable(t)) return;
    if (document.querySelector('.fancybox__container')) return;
    e.preventDefault();
    e.stopPropagation();
    open(root, t);
  }, true);
})();
