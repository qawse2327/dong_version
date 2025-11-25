// static/js/review.js

const reviewImg = document.getElementById("reviewImg");
const retryBtn = document.getElementById("retryBtn");
const nextBtn = document.getElementById("nextBtn");

const stored = localStorage.getItem("capturedImage");
if (stored) {
    reviewImg.src = stored;
}

retryBtn.onclick = () => {
    window.location.href = "/capture";
};

nextBtn.onclick = () => {
    window.location.href = "/select";
};
