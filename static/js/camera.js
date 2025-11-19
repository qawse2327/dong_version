/* =========================================================
   공통 요소 (페이지에 없으면 null)
   ========================================================= */
const video = document.getElementById('camera');
const snapCanvas = document.getElementById('snapshot');
const msg = document.getElementById('message');
const shutterBtn = document.getElementById('shutterBtn');
const countdownTimer = document.getElementById('countdownTimer');
const screenOn = document.querySelector(".screen-on");

/* =========================================================
   0) 화면 켜짐 애니메이션 제거 (capture.html에서만 존재)
   ========================================================= */
if (screenOn) {
  screenOn.addEventListener("animationend", () => {
    screenOn.remove();
  });
}

let counting = false;

/* =========================================================
   1) 캡처 기능(capture.html 전용)
   ========================================================= */
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });
    if (video) {
      video.srcObject = stream;
    }
    if (msg) msg.classList.remove("show");
  } catch (e) {
    if (msg) {
      msg.textContent = "카메라 권한을 허용해주세요.";
      msg.classList.add("show");
    }
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function sendToReview() {
  const w = video.videoWidth, h = video.videoHeight;
  snapCanvas.width = w;
  snapCanvas.height = h;

  const ctx = snapCanvas.getContext("2d");

  ctx.save();
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, w, h);
  ctx.restore();

  const imgData = snapCanvas.toDataURL("image/jpeg", 0.92);
  localStorage.setItem("capturedImage", imgData);

  window.location.href = "/review";
}

/* ===== 셔터 이벤트 (capture.html 전용) ===== */
if (shutterBtn) {
  shutterBtn.onclick = async () => {
    if (counting) return;
    counting = true;
    shutterBtn.disabled = true;

    shutterBtn.classList.remove("inner-glow");
    void shutterBtn.offsetWidth;
    shutterBtn.classList.add("inner-glow");

    countdownTimer.classList.add("show");

    await sleep(1000);
    countdownTimer.classList.add("step-1");

    await sleep(1000);
    countdownTimer.classList.add("step-2");

    await sleep(1000);
    countdownTimer.classList.add("step-3");

    shutterBtn.classList.remove("inner-glow");
    void shutterBtn.offsetWidth;
    shutterBtn.classList.add("inner-glow");
    countdownTimer.classList.add("snap");

    await sleep(500);

    sendToReview();

    countdownTimer.classList.remove("show", "step-1", "step-2", "step-3", "snap");
    shutterBtn.disabled = false;
    counting = false;
  };
}

/* ===== 카메라 시작 (capture.html에서만 실행) ===== */
if (video) {
  window.addEventListener("load", startCamera);
}

/* =========================================================
   2) review.html 전용 로직
   ========================================================= */
const reviewImg = document.getElementById("reviewImg");
const retryBtn = document.getElementById("retryBtn");
const nextBtn = document.getElementById("nextBtn");

/* 촬영 이미지 표시 */
if (reviewImg) {
  const stored = localStorage.getItem("capturedImage");
  if (stored) {
    reviewImg.src = stored;       // ← 검은화면 해결됨
  }
}

/* 다시 찍기 */
if (retryBtn) {
  retryBtn.onclick = () => {
    window.location.href = "/capture";
  };
}

/* 다음으로 */
if (nextBtn) {
  nextBtn.onclick = () => {
    window.location.href = "/select";
  };
}
