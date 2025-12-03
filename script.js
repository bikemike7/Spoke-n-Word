// ---- SETTINGS ----
const SHEET_ID = "1mxP2-lY1-fhWoHr_LOBLFw4OXnEHmhC8yuqZraPCGdM"; 
const SHEET_NAME = "Events"; // Change if your tab is named something else

// Google Visualization API CSV endpoint
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

document.addEventListener("DOMContentLoaded", () => {
    loadEvents();
});

// Load & parse CSV using Google Visualization API
async function loadEvents() {
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const events = parseCSV(csvText);

        renderTable(events);
        setupFilters(events);

    } catch (err) {
        console.error("Error loading sheet:", err);
        document.getElementById("event-table-body").innerHTML =
            `<tr><td colspan="8" style="color:red;">Failed to load events.</td></tr>`;
    }
}

// Convert CSV → array of objects
function parseCSV(csv) {
    const lines = csv.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

    const events = lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/"/g, ""));
        let eventObj = {};
        headers.forEach((h, i) => eventObj[h] = values[i] || "");
        return eventObj;
    });

    return events;
}

// Render table rows
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

// Filtering logic
function setupFilters(events) {
    const inputs = document.querySelectorAll(".filter-input");

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            const filtered = filterEvents(events);
            renderTable(filtered);
        });
    });
}

function filterEvents(events) {
    const filters = {
        date: document.getElementById("filter-date").value.toLowerCase(),
        time: document.getElementById("filter-time").value.toLowerCase(),
        location: document.getElementById("filter-location").value.toLowerCase(),
        name: document.getElementById("filter-name").value.toLowerCase(),
        description: document.getElementById("filter-description").value.toLowerCase(),
        tags: document.getElementById("filter-tags").value.toLowerCase(),
        host: document.getElementById("filter-host").value.toLowerCase(),
    };

    return events.filter(ev =>
        Object.entries(filters).every(([field, value]) =>
            ev[field]?.toLowerCase().includes(value)
        )
    );
}

