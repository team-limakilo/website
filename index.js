const main = document.querySelector("iframe[name=main]");
const loading = document.querySelector("iframe[name=loading]");
const items = document.querySelectorAll("nav .item");

// Enable dynamic links
items.forEach((item) => {
    const link = item.querySelector("a");
    const closeButton = item.querySelector("button");
    link.setAttribute("target", link.id);
    link.addEventListener("click", (event) => {
        /** @type {HTMLElement} */
        const link = event.target;
        const item = link.parentElement;
        location.hash = link.id;
        items.forEach((other) => {
            other.classList.remove("active");
        });
        item.classList.add("active");
        document.querySelectorAll("iframe.content").forEach((iframe) => {
            iframe.classList.add("hidden");
        });
        /** @type {HTMLElement} */
        let iframe = document.querySelector(`iframe[name="${link.id}"`);
        if (iframe == null) {
            // Create a new iframe
            loading.classList.remove("hidden");
            iframe = document.createElement("iframe");
            iframe.setAttribute("allow", "fullscreen");
            iframe.setAttribute("name", link.id);
            iframe.setAttribute("src", link.href);
            iframe.classList.add("content");
            iframe.classList.add("hidden");
            document.querySelector("iframe.content").insertAdjacentElement("afterend", iframe);
            iframe.addEventListener("load", (event) => {
                const activeLink = document.querySelector(".item.active a");
                if (iframe.name === activeLink.id) {
                    loading.classList.add("hidden");
                    iframe.classList.remove("hidden");
                }
            });
            item.classList.add("open");
        } else {
            // Switch to existing iframe
            loading.classList.add("hidden");
            iframe.classList.remove("hidden");
            event.preventDefault();
        }
    });
    // Close iframe when the X button is clicked
    closeButton.addEventListener("click", (event) => {
        /** @type {HTMLElement} */
        const button = event.target;
        const item = button.parentElement;
        const link = item.querySelector("a");
        const isActive = item.classList.contains("active");
        item.classList.remove("open");
        item.classList.remove("active");
        document.querySelector(`iframe[name="${link.id}"]`).remove();
        if (isActive) {
            location.hash = "";
            loading.classList.add("hidden");
            let next = item.nextElementSibling;
            while (next) {
                if (next.classList.contains("open")) {
                    return next.querySelector("a").dispatchEvent(new Event("click"));
                } else {
                    next = next.nextElementSibling;
                }
            }
            let prev = item.previousElementSibling;
            while (prev) {
                if (prev.classList.contains("open")) {
                    return prev.querySelector("a").dispatchEvent(new Event("click"));
                } else {
                    prev = prev.previousElementSibling;
                }
            }
        }
    });
});

// Activate link on page load
if (location.hash) {
    const link = document.querySelector(location.hash);
    if (link != null) {
        link.dispatchEvent(new Event("click"));
    }
}

// And on changes as well
window.addEventListener("hashchange", (event) => {
    if (location.hash !== "") {
        const activeLink = document.querySelector(".item.active a");
        if (activeLink == null || `#${activeLink.id}` !== location.hash) {
            const newLink = document.querySelector(location.hash);
            if (newLink != null) {
                newLink.dispatchEvent(new Event("click"));
            }
        }
    }
});

// Remove main iframe if JS is available
main.remove();
