const ver = document.getElementById("ver");
ver.parentElement.classList.remove("hidden");
fetch(ver.dataset.url)
    .then((response) => response.json())
    .then((data) => {
        const { dcsVersion } = data;
        ver.innerText = dcsVersion || "Unknown";
    })
    .catch((err) => {
        ver.innerText = "Failed to fetch information from server";
        ver.classList.add("error");
        throw err;
    });
