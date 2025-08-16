/* ===== 纯前端搜索 ===== */
document.addEventListener('DOMContentLoaded', () => {
  const articles = [
    // 以后改这里：每篇文章一行
    { title: '茉莉的小站开张啦', url: 'blog/2025-08/2025-08-14.html', category: '日常', date: '2025-08-14', excerpt: '欢迎来到我的小站……' },
    { title: '关于茉莉的故事', url: 'blog/2025-08/2025-08-15.html',  category: '日常', date: '2025-08-15', excerpt: '' },
    { title: '技术分享：如何搭建个人博客', url: 'blog/2025-08/2025-08-16.html', category: '技术', date: '2025-08-16', excerpt: '用 GitHub Pages 快速搭建个人博客……' }
    { title: '网站维护备忘录', url: 'blog/2025-08/2025-08-17.html', category: '技术', date: '2025-08-17', excerpt: '' }
    { title: '测试界面', url: 'blog/2025-08/2025-08-18.html', category: '技术', date: '2025-08-18', excerpt: '' }
    { title: '', url: 'blog/2025-08/2025-08-19.html', category: '日常', date: '2025-08-19', excerpt: '' }
    { title: '', url: 'blog/2025-08/2025-08-20.html', category: '日常', date: '2025-08-20', excerpt: '' }









    
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

const externalMap = {
  '1':  'https://google.com',

  // 想加更多继续写
};

document.getElementById('search-input')
  .addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;          // 回车才触发
    const num = this.value.trim();
    if (externalMap[num]) {
      e.preventDefault();                   // 阻止默认搜索
      window.location.href = externalMap[num];
    }
  });

// 特殊数字跳转表
const secretMap = {
  '404':  '/not-found-404.html'    // 输入 404 跳到 404 彩蛋
};

// 监听输入
input.addEventListener('input', () => {
  const val = input.value.trim();

  // 1️⃣ 先处理特殊数字
  if (secretMap[val]) {
    window.location.href = secretMap[val];
    return;  // 直接跳转，不再继续搜索
  }

  // 2️⃣ 原有搜索逻辑继续保留
  const kw = val.toLowerCase();
  if (!kw) { results.innerHTML = ''; return; }
  const matched = articles.filter(a =>
    a.title.toLowerCase().includes(kw) ||
    a.excerpt.toLowerCase().includes(kw)
  );
  render(matched);
});
  
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
