const ver = document.getElementById("ver");
ver.parentElement.classList.remove("hidden");

const status = document.getElementById("status");
status.parentElement.classList.remove("hidden");

const now = new Date().getTime() / 1000;

async function updateStatus() {
    await fetch(document.body.dataset.statusUrl)
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
}

/**
 * @param {string} date
 * @param {boolean} ended
 */
function formatStatus(date, ended) {
    const then = new Date(date).getTime() / 1000;
    const secondsAgo = new Date().getTime() / 1000 - then;
    if (ended) {
        return { text: `Offline (${formatSecondsAgo(secondsAgo)})`, classList: ["error"] };
    } else if (now - then > 120) {
        return { text: `Unknown (${formatSecondsAgo(secondsAgo)})`, classList: ["warning"] };
    } else {
        return { text: "Running", classList: ["success"] };
    }
}

/**
 * @param {number} seconds
 */
function formatSecondsAgo(seconds) {
    if (seconds < 0) {
        return "In the future";
    } else if (seconds < 5) {
        return "just now";
    } else if (seconds < 60) {
        return "less than one minute";
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return quantity(minutes, "minute", "minutes");
    } else if (seconds < 3600 * 24) {
        const hours = Math.floor(seconds / 3600);
        return quantity(hours, "hour", "hours");
    } else {
        const days = Math.floor(seconds / (3600 * 24));
        return quantity(days, "day", "days");
    }
}

/**
 * @param {number} number
 * @param {string} singular
 * @param {string} plural
 */
function quantity(number, singular, plural) {
    if (number === 1) {
        return `${number} ${singular}`;
    } else {
        return `${number} ${plural}`;
    }
}

updateStatus();
setInterval(updateStatus, 60 * 1000);
