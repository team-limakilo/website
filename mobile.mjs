import { addTouchOpenCloseHandler } from "./lib/touch.mjs";

if (navigator.maxTouchPoints > 0) {
    const body = document.body;
    const nav = document.querySelector("nav");
    const menu = document.querySelector(".menu");
    const shade = document.querySelector(".shade");
    const menuBar = document.querySelector(".menu-bar");
    const links = document.querySelectorAll(".item");

    /** @param {Event?} event */
    function closeMenu(event, force = false) {
        if (force || selectedItem()) {
            body.classList.remove("menu-open");
            menuBar.classList.add("hidden");
            shade.style.opacity = "";
            event?.preventDefault();
            updateNavFocus();
        } else {
            links.forEach((link) => {
                if (link.classList.contains("flash")) {
                    link.removeEventListener("animationend", removeFlash);
                    link.classList.remove("flash");
                    reflow();
                }
                link.addEventListener("animationend", removeFlash, { once: true });
                link.classList.add("flash");
            });
        }
    }

    /** @param {Event?} event */
    function openMenu(event) {
        body.classList.add("menu-open");
        menuBar.classList.remove("hidden");
        shade.style.transition = "";
        shade.style.opacity = "";
        event?.preventDefault();
        updateNavFocus();
    }

    /** @param {Event?} event */
    function removeFlash(event) {
        if (event?.target) {
            event.target.classList.remove("flash");
        }
    }

    function selectedItem() {
        return document.querySelector("nav .item.active");
    }

    function menuIsOpen() {
        return body.classList.contains("menu-open");
    }

    function reflow() {
        document.body.offsetHeight;
    }

    function updateNavFocus() {
        const tabIndex = menuIsOpen() ? "0" : "-1";
        document.querySelectorAll("nav a").forEach((item) => {
            item.tabIndex = tabIndex;
            item.blur?.();
        });
    }

    menu.addEventListener("click", openMenu);
    shade.addEventListener("click", closeMenu);
    body.addEventListener("x-close-menu", closeMenu);

    nav.addEventListener("transitionend", (event) => {
        if (event.target === nav && event.propertyName === "left" && !menuIsOpen()) {
            menuBar.classList.add("hidden");
        }
    });

    addTouchOpenCloseHandler(body, nav, shade, "close", true, () => menuIsOpen(), closeMenu);
    addTouchOpenCloseHandler(menu, nav, shade, "open", false, () => !menuIsOpen(), openMenu);
    addTouchOpenCloseHandler(menuBar, nav, shade, "open", false, () => !menuIsOpen(), openMenu);

    const mobileStyle = document.createElement("link");
    mobileStyle.href = "mobile.css";
    mobileStyle.rel = "stylesheet";
    body.appendChild(mobileStyle);

    if (selectedItem()) {
        menuBar.classList.add("hidden");
    } else {
        openMenu();
    }
}
