// static/js/capture.js

const video = document.getElementById('camera');
const snapCanvas = document.getElementById('snapshot');
const msg = document.getElementById('message');
const shutterBtn = document.getElementById('shutterBtn');
const countdownTimer = document.getElementById('countdownTimer');
const screenOn = document.querySelector(".screen-on");

let counting = false;

/* ★ 화면 켜짐 애니메이션 끝나면 요소 제거 */
screenOn.addEventListener("animationend", () => {
  screenOn.remove();
});

async function startCamera(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:"user" },
      audio:false
    });
    video.srcObject = stream;
    msg.classList.remove("show");
  }catch(e){
    msg.textContent = "카메라 권한을 허용해주세요.";
    msg.classList.add("show");
  }
}

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

function sendToReview(){
  const w = video.videoWidth, h = video.videoHeight;
  snapCanvas.width = w;
  snapCanvas.height = h;

  const ctx = snapCanvas.getContext("2d");

  ctx.save();
  ctx.translate(w,0);
  ctx.scale(-1,1);
  ctx.drawImage(video,0,0,w,h);
  ctx.restore();

  const imgData = snapCanvas.toDataURL("image/jpeg", 0.92);
  localStorage.setItem("capturedImage", imgData);

  window.location.href = "/review";
}

shutterBtn.onclick = async () => {
  if(counting) return;
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

window.addEventListener("load", startCamera);
