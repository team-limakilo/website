const menu = document.querySelector(".menu");
const shade = document.querySelector(".shade");
const fullscreen = document.querySelector(".fullscreen");

body.addEventListener("x-close-menu", () => {
    document.body.classList.remove("menu-open");
});

menu.addEventListener("click", () => {
    body.classList.toggle("menu-open");
});

shade.addEventListener("click", () => {
    body.classList.remove("menu-open");
});

fullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        body.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

if (!document.fullscreenEnabled) {
    fullscreen.remove();
}
