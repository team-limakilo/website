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
 * @argument {boolean} useChanged
 */
function registerTouch(event, useChanged = false) {
    const touch = useChanged ? event.changedTouches[0] : event.touches[0];
    while (touchTrail.length > 0 && event.time - touchTrail[0].time > 100) {
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
    }
});

body.addEventListener("touchmove", (event) => {
    if (menuIsOpen() && touchStart != null) {
        if (touchMode === MODE_NONE) {
            const touch = registerTouch(event);
            const totalX = Math.abs(touch.x - touchStart.x);
            const totalY = Math.abs(touch.y - touchStart.y);
            if (totalY > 5 && totalY >= totalX) {
                touchMode = MODE_SCROLL;
            } else if (totalX > 5 && totalX > totalY) {
                touchMode = MODE_CLOSE;
            }
        }
        if (touchMode === MODE_CLOSE) {
            const touch = registerTouch(event);
            const offset = Math.min(touch.x - touchStart.x, 0);
            nav.style.transition = "none";
            nav.style.left = offset + "px";
            event.preventDefault();
        }
    }
}, {
    passive: false
});

body.addEventListener("touchend", (event) => {
    if (menuIsOpen() && touchMode === MODE_CLOSE) {
        const touchEndX = event.changedTouches[0].clientX;
        let velocity = 0;
        if (touchTrail.length > 0) {
            const lastTouch = registerTouch(event, true);
            const distanceMoved = lastTouch.x - touchTrail[0].x;
            const timeDiff = lastTouch.time - touchTrail[0].time;
            velocity = distanceMoved / timeDiff;
        }
        nav.style.transition = "";
        nav.style.left = "";
        touchStart = undefined;
        if (velocity < (touchEndX / -window.innerWidth)) {
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
