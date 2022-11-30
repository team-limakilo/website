const menu = document.querySelector(".menu");
const shade = document.querySelector(".shade");
const fullscreen = document.querySelector(".fullscreen");
let touchStartX;
let touchTrail = [];

function closeMenu(event) {
    body.classList.remove("menu-open");
    event.preventDefault();
}

function toggleMenu(event) {
    body.classList.toggle("menu-open");
    event.preventDefault();
}

function menuIsOpen() {
    return body.classList.contains("menu-open");
}

body.addEventListener("x-close-menu", closeMenu);
menu.addEventListener("click", toggleMenu);
shade.addEventListener("click", closeMenu);


body.addEventListener("touchstart", (event) => {
    if (!menuIsOpen()) return;
    touchStartX = event.touches[0].clientX;
    touchVelocity = 0;
});

body.addEventListener("touchmove", (event) => {
    if (!menuIsOpen()) return;
    if (touchStartX != undefined) {
        const offset = Math.min(event.touches[0].clientX - touchStartX, 0);
        // Remove touch motions older than a few milliseconds
        while (touchTrail.length > 0 && event.timeStamp - touchTrail[0].timeStamp > 100) {
            touchTrail.shift();
        }
        // Record this touch event
        touchTrail.push({ offset, timeStamp: event.timeStamp });
        // Move the element onscreen
        nav.style = `left: ${offset}px; transition: none;`;
    }
});

body.addEventListener("touchend", (event) => {
    if (!menuIsOpen()) return;
    const touchEndX = event.changedTouches[0].clientX;
    let velocity = 0;
    if (touchTrail.length > 0) {
        touchTrail.push({ offset: touchTrail[touchTrail.length - 1].offset, timeStamp: event.timeStamp });
        const distanceMoved = touchTrail[touchTrail.length - 1].offset - touchTrail[0].offset;
        const timeDiff = touchTrail[touchTrail.length - 1].timeStamp - touchTrail[0].timeStamp;
        velocity = distanceMoved / timeDiff;
    }
    nav.style = undefined;
    touchStartX = undefined;
    if (velocity < (-touchEndX / window.innerWidth)) {
        closeMenu();
    }
});

fullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        body.requestFullscreen();
    } else {
        document.exitFullscreen();
        body.scrollTo(0, 0);
    }
});

if (!document.fullscreenEnabled) {
    fullscreen.remove();
}
