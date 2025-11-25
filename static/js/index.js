// static/js/index.js

// 🔥 Try-On 흐름 완전 초기화
localStorage.clear();

window.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", () => {
        window.location.href = "/capture";
    });
});
