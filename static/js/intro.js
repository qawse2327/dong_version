/* =========================================================
   welcome.html  전용 코드
   ========================================================= */
if (document.body.classList.contains("page-welcome")) {
    document.body.addEventListener("click", () => {
        window.location.href = "/start";
    });
}

/* =========================================================
   index.html  전용 코드
   ========================================================= */
if (document.body.classList.contains("page-index")) {
    window.addEventListener("DOMContentLoaded", () => {
        document.body.addEventListener("click", () => {
            window.location.href = "/capture";
        });
    });
}
