// ===== CONFIG: Your published Google Sheet CSV URL =====
const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-_vMfpUnY0zdDCYpjKugwXEGuWMn42WSOyI3UqVeLQgzbCMJsg7U4xgkISXtCymLKVGGSB5TuzITA/pub?output=csv"; // <-- Replace this

// ===== DOM ELEMENTS =====
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const dateFilter = document.getElementById("dateFilter");
const timeFilter = document.getElementById("timeFilter");
const locationFilter = document.getElementById("locationFilter");
const hostFilter = document.getElementById("hostFilter");
const tagFilter = document.getElementById("tagFilter");

let events = [];

// ===== FETCH AND PARSE CSV =====
async function loadEvents() {
    const response = await fetch(csvUrl);
    const csvText = await response.text();

    const lines = csvText.trim().split("\n");
    const headers = lines.shift().split(",").map(h => h.trim());

    events = lines.map(line => {
        const values = line.split(",");
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || "");
        return obj;
    });

    renderEvents(events);
}

// ===== RENDER EVENTS =====
function renderEvents(list) {
    tableBody.innerHTML = "";

    list.forEach(e => {
        const row = document.createElement("tr");

        const cells = [
            {label:"Date", value:e.date},
            {label:"Time", value:e.time},
            {label:"Name", value:e.name},
            {label:"Location", value:e.location},
            {label:"Host", value:e.host},
            {label:"Description", value:e.description},
            {label:"Tags", value:e.tags},
            {label:"Link", value:`<a href="${e.link}" target="_blank">Event Link</a>`}
        ];

        cells.forEach(c => {
            const td = document.createElement("td");
            td.innerHTML = c.value;
            td.setAttribute("data-label", c.label);
            row.appendChild(td);
        });

        tableBody.appendChild(row);
    });
}

// ===== FILTERING =====
function filterEvents() {
    let filtered = events;

    const searchTerm = searchInput.value.toLowerCase();
    const dateVal = dateFilter.value;
    const timeVal = timeFilter.value;
    const loc = locationFilter.value.toLowerCase();
    const host = hostFilter.value.toLowerCase();
    const tag = tagFilter.value.toLowerCase();

    filtered = filtered.filter(e => {
        return (
            (!searchTerm ||
                e.name.toLowerCase().includes(searchTerm) ||
                e.description.toLowerCase().includes(searchTerm)) &&
            (!dateVal || e.date === dateVal) &&
            (!timeVal || e.time >= timeVal) &&
            (!loc || e.location.toLowerCase().includes(loc)) &&
            (!host || e.host.toLowerCase().includes(host)) &&
            (!tag || e.tags.toLowerCase().includes(tag))
        );
    });

    renderEvents(filtered);
}

// ===== EVENT LISTENERS =====
[searchInput, dateFilter, timeFilter, locationFilter, hostFilter, tagFilter]
    .forEach(el => el.addEventListener("input", filterEvents));

// ===== INITIAL LOAD =====
loadEvents();
