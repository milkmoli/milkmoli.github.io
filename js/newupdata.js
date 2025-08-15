// 点击 “LOAD MORE ENTRIES” 跳转
document.addEventListener('DOMContentLoaded', function () {
    var loadBtn = document.querySelector('.load-more-holder');
    if (loadBtn) {
        loadBtn.addEventListener('click', function () {
            window.location.href = '../blogindex.html';
        });
    }
});



// 显示网站已运行天数
document.addEventListener('DOMContentLoaded', function () {
    var launch = new Date('2025-08-14');
    var now    = new Date();
    var days   = Math.floor((now - launch) / (1000 * 60 * 60 * 24));
    var daysEl = document.getElementById('days-run');
    if (daysEl) daysEl.textContent = days;
});



/* ===== blogindex.html 卡片 + 分页 ===== */
document.addEventListener('DOMContentLoaded', function () {
  /* 假数据 30 条，可替换为后端输出 */
  const fakeData = Array.from({ length: 30 }, (_, i) => ({
    title: `文章标题 ${i + 1}`,
    date: `2025-08-${String(i + 1).padStart(2, '0')}`,
    category: ['日常', '技术', '随笔', '秘密'][i % 4],
    excerpt: '这是一段摘要文字，用于展示卡片上的简短内容，超出部分将自动截断……',
    img: `https://picsum.photos/400/180?random=${i}`
  }));

  const pageSize = 9;
  let currentPage = 1;
  const totalPage = Math.ceil(fakeData.length / pageSize);

  function renderPage(page) {
    const container = document.getElementById('blog-grid');
    if (!container) return; // 页面没有元素就退出
    container.innerHTML = '';
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    fakeData.slice(start, end).forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${item.img}" alt="">
        <div class="card-body">
          <div class="card-meta">
            <span>${item.category}</span><span>${item.date}</span>
          </div>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-excerpt">${item.excerpt}</p>
        </div>`;
      container.appendChild(card);
    });
    document.getElementById('page-info') && (document.getElementById('page-info').textContent = `${page} / ${totalPage}`);
    document.getElementById('prev') && (document.getElementById('prev').disabled = page === 1);
    document.getElementById('next') && (document.getElementById('next').disabled = page === totalPage);
  }

  window.changePage = function (delta) {
    currentPage += delta;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPage) currentPage = totalPage;
    renderPage(currentPage);
  };

  renderPage(currentPage);
});
