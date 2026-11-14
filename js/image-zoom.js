/* 图片灯箱：点击正文图片放大，支持滚轮缩放、拖拽、ESC 关闭。
 * 用事件委托，swup 单页切换后依然有效。 */
(function () {
  if (window.__blogImageZoom) return;
  window.__blogImageZoom = true;

  var CSS = [
    '#img-zoom-mask{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.88);backdrop-filter:blur(3px);cursor:zoom-out}',
    '#img-zoom-mask.open{display:flex}',
    '#img-zoom-mask img{max-width:92vw;max-height:88vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.6);cursor:grab;user-select:none;transition:transform .08s linear}',
    '#img-zoom-mask img.dragging{cursor:grabbing;transition:none}',
    '.zoom-tools{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);display:flex;gap:10px}',
    '.zoom-tools button{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;font-size:17px;line-height:1;cursor:pointer}',
    '.zoom-tools button:hover{background:rgba(255,255,255,.24)}',
    '#img-zoom-hint{position:absolute;top:20px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.65);font-size:12px;letter-spacing:.5px}',
    '.markdown-body img{cursor:zoom-in}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  var mask = null, img = null, scale = 1, tx = 0, ty = 0, dragging = false, sx = 0, sy = 0;

  function apply() {
    if (!img) return;
    img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
  }

  function ensure() {
    if (mask) return;
    mask = document.createElement('div');
    mask.id = 'img-zoom-mask';
    mask.innerHTML = '<div id="img-zoom-hint">滚轮缩放 · 拖拽移动 · ESC 关闭</div><img alt=""><div class="zoom-tools"><button data-z="out" title="缩小">-</button><button data-z="in" title="放大">+</button><button data-z="reset" title="还原">R</button></div>';
    document.body.appendChild(mask);
    img = mask.querySelector('img');

    mask.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-z]');
      if (btn) {
        e.stopPropagation();
        var act = btn.getAttribute('data-z');
        if (act === 'in') scale = Math.min(6, scale * 1.25);
        else if (act === 'out') scale = Math.max(0.3, scale / 1.25);
        else { scale = 1; tx = 0; ty = 0; }
        apply();
        return;
      }
      close();
    });

    img.addEventListener('wheel', function (e) {
      e.preventDefault();
      scale = Math.min(6, Math.max(0.3, scale * (e.deltaY < 0 ? 1.1 : 0.9)));
      apply();
    }, { passive: false });

    img.addEventListener('mousedown', function (e) {
      e.preventDefault();
      dragging = true; sx = e.clientX - tx; sy = e.clientY - ty;
      img.classList.add('dragging');
    });
    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      tx = e.clientX - sx; ty = e.clientY - sy; apply();
    });
    window.addEventListener('mouseup', function () { dragging = false; if (img) img.classList.remove('dragging'); });

    document.addEventListener('keydown', function (e) {
      if (!mask.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === '+' || e.key === '=') { scale = Math.min(6, scale * 1.2); apply(); }
      if (e.key === '-') { scale = Math.max(0.3, scale / 1.2); apply(); }
    });
  }

  function open(src, alt) {
    ensure();
    scale = 1; tx = 0; ty = 0;
    img.src = src;
    img.alt = alt || '';
    apply();
    mask.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!mask) return;
    mask.classList.remove('open');
    document.body.style.overflow = '';
    img.removeAttribute('src');
  }

  // 捕获阶段拦截，避免主题自带的看图组件抢事件
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    if (!t.closest('.markdown-body')) return;
    if (!t.src) return;
    e.preventDefault();
    e.stopPropagation();
    open(t.src, t.alt);
  }, true);
})();
