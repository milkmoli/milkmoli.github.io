/* ===== 纯前端搜索 ===== */
document.addEventListener('DOMContentLoaded', () => {
  const articles = [
    // 以后改这里：每篇文章一行
    { title: '茉莉的小站开张啦', url: 'index.html', category: '日常', date: '2025-08-15', excerpt: '欢迎来到我的小站……' },
    { title: '关于茉莉的故事', url: 'about.html',  category: '随笔', date: '2025-08-14', excerpt: '我叫茉莉，一个爱折腾的……' },
    { title: '技术分享：如何搭建个人博客', url: 'blog-tech.html', category: '技术', date: '2025-08-13', excerpt: '用 GitHub Pages 快速搭博客……' }











    
    // …更多文章
  ];

  const input   = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  function render(list) {
    results.innerHTML = '';
    if (!list.length) {
      results.innerHTML = '<li>没有找到相关文章</li>';
      return;
    }
    list.forEach(a => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${a.url}">
          <strong>${a.title}</strong><br>
          <small>${a.date} · ${a.category}</small><br>
          ${a.excerpt}
        </a>`;
      results.appendChild(li);
    });
  }

  input.addEventListener('input', () => {
    const kw = input.value.trim().toLowerCase();
    if (!kw) { results.innerHTML = ''; return; }

    const matched = articles.filter(a =>
      a.title.toLowerCase().includes(kw) ||
      a.excerpt.toLowerCase().includes(kw)
    );
    render(matched);
  });
});
