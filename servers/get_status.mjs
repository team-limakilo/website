const ver = document.getElementById("ver");
ver.parentElement.classList.remove("hidden");

const status = document.getElementById("status");
status.parentElement.classList.remove("hidden");

const now = new Date().getTime() / 1000;

fetch(document.body.dataset.statusUrl)
    .then((response) => response.json())
    .then((data) => {
        const { dcsVersion, date, ended } = data;
        ver.innerText = dcsVersion || "Unknown";
        ver.classList = dcsVersion ? ["code"] : ["warning"];
        status.innerText = formatStatus(date, ended).text;
        status.classList = formatStatus(date, ended).classList;
    })
    .catch((err) => {
        status.innerText = "Failed to fetch information";
        status.classList = ["error"];
        ver.innerText = "Unknown";
        ver.classList = ["warning"];
        throw err;
    });

/**
 * @param {string} date 
 * @param {boolean} ended 
 */
function formatStatus(date, ended) {
    const then = new Date(date).getTime() / 1000;
    if (ended) {
        return { text: "Offline", classList: ["error"] };
    } else if (now - then > 120) {
        return { text: "Unknown", classList: ["warning"] };
    } else {
        return { text: "Running", classList: ["success"] };
    }
}
