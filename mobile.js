const menu = document.querySelector(".menu");
const shade = document.querySelector(".shade");

body.addEventListener("x-close-menu", () => {
    document.body.classList.remove("menu-open");
});

menu.addEventListener("click", () => {
    body.classList.toggle("menu-open");
});

shade.addEventListener("click", () => {
    body.classList.remove("menu-open");
});
