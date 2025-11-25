// static/js/select.js

/* 🔥 페이지 들어올 때마다 완전 초기화 */
localStorage.removeItem("tryonData");

document.addEventListener("DOMContentLoaded", () => {
    const savedImage = localStorage.getItem("capturedImage");

    if (savedImage) {
        document.querySelector(".top-photo-area").style.backgroundImage = `url('${savedImage}')`;
    } else {
        alert("사진이 없습니다. 다시 촬영해주세요.");
        window.location.href = "/capture";
        return;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const imgs = [...document.querySelectorAll('.clothes-img')];
    const scrollAreas = document.querySelectorAll('.horizontal-scroll');

    function centerScrollArea(area) {
        area.scrollLeft = (area.scrollWidth - area.clientWidth) / 2;
    }

    scrollAreas.forEach(area => {
        setTimeout(() => centerScrollArea(area), 50);
    });

    window.addEventListener('resize', () => {
        scrollAreas.forEach(area => centerScrollArea(area));
    });

    function computeBottomCenter(){
        return {
            x: window.innerWidth / 2,
            y: window.innerHeight + 200
        };
    }
    function px(v){ return `${v}px`; }

    function prepareDeal(){
        const C = computeBottomCenter();

        imgs.forEach(img=>{
            const r = img.getBoundingClientRect();
            const dx = C.x - (r.left + r.width/2);
            const dy = C.y - (r.top + r.height/2);
            const rot = Math.random()*40 - 20;

            img.style.transform = `translate(${px(dx)},${px(dy)}) rotate(${rot}deg) scale(.92)`;
            img.style.opacity = 0;

            img.classList.add('deal-from-center');
            img.classList.remove('dealt');
        });
    }

    function runDeal(){
        imgs.forEach((img,i)=>{
            const delay = i*80 + (Math.random()*60 - 30);
            setTimeout(()=>{
                img.style.transition = 'transform 700ms var(--ease), opacity 300ms linear';
                img.style.transform = '';
                img.style.opacity = 1;
                setTimeout(()=> img.classList.add('dealt'), 10);
            }, delay);
        });
    }

    function startDeal(){
        prepareDeal();
        requestAnimationFrame(runDeal);
    }

    /* 모달 */
    let isModalOpen = false;
    let currentModal = null;

    function openModal(img, type, name){
        if (isModalOpen && currentModal) {
            currentModal.remove();
            isModalOpen = false;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        currentModal = overlay;
        isModalOpen = true;

        overlay.innerHTML = `
            <div class="modal-box">
                <img src="${img.src}" class="modal-img">
                <div class="modal-buttons">
                    <button class="modal-btn cancel-btn">취소</button>
                    <button class="modal-btn select-btn">선택</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('.cancel-btn').onclick = () => {
            overlay.remove();
            isModalOpen = false;
            currentModal = null;
        };
        
        overlay.querySelector('.select-btn').onclick = () => {
            imgs.filter(x=> x.dataset.type === type)
                .forEach(el=> el.classList.remove('selected'));
            img.classList.add('selected');
            
            overlay.remove();
            isModalOpen = false;
            currentModal = null;
        };
    }

    imgs.forEach(img=>{
        img.addEventListener('click', ()=>{
            img.style.animation = 'pop .32s var(--ease) forwards';
            setTimeout(()=> img.style.animation='', 350);

            openModal(img, img.dataset.type, img.dataset.name);
        });
    });

    startDeal();
});

/* 🔥 TRY-ON 버튼 */
document.addEventListener('DOMContentLoaded', () => {
    const tryonBtn = document.getElementById('tryonBtn');
    
    tryonBtn.addEventListener('click', async () => {
        const selectedTop = document.querySelector('.clothes-img[data-type="top"].selected');
        const selectedBottom = document.querySelector('.clothes-img[data-type="bottom"].selected');
        
        if (!selectedTop && !selectedBottom) {
            alert("상의 또는 하의를 선택해주세요.");
            return;
        }

        function clean(src) {
            if (!src) return null;
            const idx = src.indexOf("/static/");
            return idx !== -1 ? src.substring(idx) : src;
        }

        const topSrc = clean(selectedTop?.getAttribute('src'));
        const bottomSrc = clean(selectedBottom?.getAttribute('src'));

        let mode = "top";
        if (topSrc && bottomSrc) mode = "both";
        else if (bottomSrc) mode = "bottom";

        tryonBtn.disabled = true;
        tryonBtn.textContent = "처리 중...";

        /* 🔥🔥 tryonData 저장 — loading.html이 찾는 핵심 */
        const payload = { top: topSrc, bottom: bottomSrc, mode };
        localStorage.setItem("tryonData", JSON.stringify(payload));

        const loadingUrl =
          `/loading?top=${encodeURIComponent(topSrc || '')}&bottom=${encodeURIComponent(bottomSrc || '')}&mode=${mode}`;

        window.location.href = loadingUrl;
    });
});
