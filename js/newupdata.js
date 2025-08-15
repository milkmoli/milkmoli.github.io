// 点击 “LOAD MORE ENTRIES” 跳转
document.addEventListener('DOMContentLoaded', function () {
    var loadBtn = document.querySelector('.load-more-holder');
    if (loadBtn) {
        loadBtn.addEventListener('click', function () {
            window.location.href = 'blog/blogindex.html';
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
