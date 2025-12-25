// ---- SETTINGS ----
const SHEET_ID = "1mxP2-lY1-fhWoHr_LOBLFw4OXnEHmh1mxP2-lY1-fhWoHr_LOBLFw4OXnEHmhC8yuqZraPCGdM";
const SHEET_NAME = "Events";

// Google Visualization API safe CSV endpoint
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-_vMfpUnY0zdDCYpjKugwXEGuWMn42WSOyI3UqVeLQgzbCMJsg7U4xgkISXtCymLKVGGSB5TuzITA/pub?gid=0&single=true&output=csv";

document.addEventListener("DOMContentLoaded", () => {
    loadEvents();
    document.getElementById("reset-filters").addEventListener("click", resetFilters);
});

// Load CSV
async function loadEvents() {
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const events = parseCSV(csvText);
        const futureEvents = filterFutureEvents(events);

renderTable(futureEvents);
populateDropdowns(futureEvents);
setupDropdownFiltering(futureEvents);


    } catch (err) {
        console.error("Error:", err);
    }
}

// Parse CSV to objects
function parseCSV(csv) {
    const lines = csv.split("\n").map(l => l.trim()).filter(Boolean);
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    console.log("CSV headers:", headers);


    return lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/"/g, ""));
        let obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || "");
        return obj;
    });
}
function filterFutureEvents(events) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of day

    return events.filter(ev => {
        if (!ev.date) return false;

        const eventDate = new Date(ev.date);
        if (isNaN(eventDate)) return false;

        return eventDate >= today;
    });
}

// Render event rows
function renderTable(events) {
    const tbody = document.getElementById("event-table-body");
    tbody.innerHTML = "";

    events.forEach(ev => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${ev.date}</td>
            <td>${ev.time}</td>
            <td>${ev.location}</td>
            <td>${ev.name}</td>
            <td>${ev.description}</td>
            <td><a href="${ev.link}" target="_blank">Link</a></td>
            <td>${ev.tags}</td>
            <td>${ev.host}</td>
        `;
        tbody.appendChild(row);
    });
}

// Populate dropdowns
function populateDropdowns(events) {
    const fields = ["date", "time", "location", "name", "tags", "host"];

    fields.forEach(field => {
        const select = document.getElementById(`filter-${field}`);
        if (!select) return; // extra safety

        const values = [...new Set(
            events.map(ev => ev[field] || "").filter(v => v.trim() !== "")
        )].sort();

        select.innerHTML = `<option value="">All</option>`;
        values.forEach(v => {
            select.innerHTML += `<option value="${v}">${v}</option>`;
        });
    });
}


// Filter events
function setupDropdownFiltering(events) {
    const selects = document.querySelectorAll(".filter-select");

    selects.forEach(sel => {
        sel.addEventListener("change", () => {
            const filtered = runFilters(events);
            renderTable(filtered);
        });
    });
}

function runFilters(events) {
    const filters = {
        date: document.getElementById("filter-date").value,
        time: document.getElementById("filter-time").value,
        location: document.getElementById("filter-location").value,
        name: document.getElementById("filter-name").value,
        tags: document.getElementById("filter-tags").value,
        host: document.getElementById("filter-host").value,
    };

    return events.filter(ev =>
        Object.entries(filters).every(([field, value]) =>
            value === "" || ev[field] === value
        )
    );
}

// Reset filters
function resetFilters() {
    document.querySelectorAll(".filter-select").forEach(sel => sel.value = "");
    loadEvents();
}
