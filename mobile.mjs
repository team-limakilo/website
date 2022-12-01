const body = document.body;
const nav = document.querySelector("nav");
const menu = document.querySelector(".menu");
const shade = document.querySelector(".shade");
const fullscreen = document.querySelector(".fullscreen");

/** @type {{ x: number, y: number, time: number }?} */
let touchStart = null;

/** @type {{ x: number, y: number, time: number }[]} */
let touchTrail = [];

const MODE_NONE = 0;
const MODE_CLOSE = 1;
const MODE_SCROLL = 2;
let touchMode = MODE_NONE;
let touchingNav = false;

/** @param {Event} event */
function closeMenu(event) {
    body.classList.remove("menu-open");
    event?.preventDefault();
}

/** @param {Event} event */
function toggleMenu(event) {
    body.classList.toggle("menu-open");
    event?.preventDefault();
}

function menuIsOpen() {
    return body.classList.contains("menu-open");
}

/**
 * @argument {TouchEvent} event
 */
function registerTouch(event) {
    const touch = event.touches[0] || event.changedTouches[0];
    while (touchTrail.length > 0 && event.timeStamp - touchTrail[0].time > 100) {
        touchTrail.shift();
    }
    touchTrail.push({ x: touch.clientX, y: touch.clientY, time: event.timeStamp });
    return touchTrail[touchTrail.length - 1];
}

menu.addEventListener("click", toggleMenu);
shade.addEventListener("click", closeMenu);
body.addEventListener("x-close-menu", closeMenu);

body.addEventListener("touchstart", (event) => {
    if (menuIsOpen()) {
        touchStart = registerTouch(event);
        touchMode = MODE_NONE;
        if (!event.target.closest("nav")) {
            touchMode = MODE_CLOSE;
        }
    }
});

body.addEventListener("touchmove", (event) => {
    if (menuIsOpen() && touchMode !== MODE_SCROLL) {
        const touch = registerTouch(event);
        if (touchMode === MODE_NONE) {
            const totalX = Math.abs(touch.x - touchStart.x);
            const totalY = Math.abs(touch.y - touchStart.y);
            if (totalY > 0 && totalY >= totalX) {
                touchMode = MODE_SCROLL;
                return;
            } else if (totalX > 0) {
                touchMode = MODE_CLOSE;
            }
        }
        if (touchMode === MODE_CLOSE) {
            const offset = Math.min(touch.x - touchStart.x, 0);
            nav.style.transition = "none";
            nav.style.left = offset + "px";
        }
        event.preventDefault();
    }
}, {
    passive: false
});

body.addEventListener("touchend", (event) => {
    if (menuIsOpen() && touchMode === MODE_CLOSE) {
        let velocity = 0;
        const lastTouch = registerTouch(event);
        if (touchTrail.length > 0) {
            const distanceMoved = lastTouch.x - touchTrail[0].x;
            const timeDiff = lastTouch.time - touchTrail[0].time;
            velocity = timeDiff > 0 ? distanceMoved / timeDiff : 0;
        }
        nav.style.transition = "";
        nav.style.left = "";
        const PREDICT_MS = 200;
        const offset = lastTouch.x - touchStart.x;
        const predictedOffset = Math.abs(offset + velocity * PREDICT_MS);
        const predictedTouch = lastTouch.x + velocity * PREDICT_MS;
        const borderHit = predictedTouch < -body.clientWidth / 10;
        const halfHidden = predictedOffset > body.clientWidth / 2;
        if (velocity <= 0 && (borderHit || halfHidden)) {
            closeMenu();
        }
    }
});

fullscreen?.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        body.requestFullscreen();
    } else {
        document.exitFullscreen();
        body.scrollTo(0, 0);
    }
});

if (!document.fullscreenEnabled) {
    fullscreen?.remove();
}
