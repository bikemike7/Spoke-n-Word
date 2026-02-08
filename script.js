// ---- SETTINGS ----
const SHEET_ID = "1mxP2-lY1-fhWoHr_LOBLFw4OXnEHmhC8yuqZraPCGdM";
const SHEET_NAME = "Events"; // Change if your tab is named something else

// Google Visualization API CSV endpoint
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

let allEvents = [];

document.addEventListener("DOMContentLoaded", () => {
    loadEvents();
});

// Load & parse CSV using Google Visualization API
async function loadEvents() {
    try {
        console.log("Fetching events from Google Sheets...");
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        console.log("CSV received, parsing...");

        const events = parseCSV(csvText);
        console.log(`Parsed ${events.length} total events`);

        // TEMPORARY: Show all events for debugging (comment out filterFutureEvents)
        // allEvents = filterFutureEvents(events);
        allEvents = events; // Show ALL events
        console.log(`Showing ${allEvents.length} events`);

        renderTable(allEvents);
        setupFilters();

    } catch (err) {
        console.error("Error loading sheet:", err);
        document.getElementById("event-table-body").innerHTML =
            `<tr><td colspan="8" style="color:red;">Failed to load events. Error: ${err.message}</td></tr>`;
    }
}

// Convert CSV → array of objects
function parseCSV(csv) {
    const lines = csv.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, "").toLowerCase());

    const events = lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v => v.replace(/^"|"$/g, ""));
        let eventObj = {};
        headers.forEach((h, i) => eventObj[h] = values[i] || "");
        return eventObj;
    });

    return events;
}

// Filter to show only future events (today and later)
function filterFutureEvents(events) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter(ev => {
        if (!ev.date) return false;

        // Parse the date (handles MM/DD/YYYY, M/D/YYYY, and YYYY-MM-DD formats)
        const eventDate = new Date(ev.date);

        // Check if date is valid
        if (isNaN(eventDate.getTime())) {
            console.warn(`Invalid date format: ${ev.date}`);
            return false;
        }

        return eventDate >= today;
    });
}

// Render table rows - column order matches HTML headers
function renderTable(events) {
    const tbody = document.getElementById("event-table-body");
    tbody.innerHTML = "";

    if (events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No events found.</td></tr>';
        return;
    }

    events.forEach(ev => {
        const row = document.createElement("tr");

        // Column order for display: Date, Time, Name, Location, Host, Description, Tags, Link
        // (matches HTML table headers)
        const name = ev.name || "";
        const location = ev.location || "";
        const host = ev.host || "";
        const description = ev.description || "";
        const tags = ev.tags || "";
        const link = ev.link || "";
        const date = ev.date || "";
        const time = ev.time || "";

        row.innerHTML = `
            <td data-label="Date">${date}</td>
            <td data-label="Time">${time}</td>
            <td data-label="Name">${name}</td>
            <td data-label="Location">${location}</td>
            <td data-label="Host">${host}</td>
            <td data-label="Description">${description}</td>
            <td data-label="Tags">${tags}</td>
            <td data-label="Link">${link ? `<a href="${link}" target="_blank">Link</a>` : ""}</td>
        `;

        tbody.appendChild(row);
    });
}

// Setup all filter event listeners
function setupFilters() {
    const inputs = document.querySelectorAll(".filter-input");

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            const filtered = filterEvents();
            renderTable(filtered);
        });
    });
}

// Filter events based on all filter inputs
function filterEvents() {
    const searchValue = document.getElementById("filter-search").value.toLowerCase();
    const dateValue = document.getElementById("filter-date").value;
    const timeValue = document.getElementById("filter-time").value.toLowerCase();
    const locationValue = document.getElementById("filter-location").value.toLowerCase();
    const hostValue = document.getElementById("filter-host").value.toLowerCase();
    const tagsValue = document.getElementById("filter-tags").value.toLowerCase();

    return allEvents.filter(ev => {
        // Search filter - searches across all fields
        const searchMatch = !searchValue ||
            Object.values(ev).some(val =>
                String(val).toLowerCase().includes(searchValue)
            );

        // Date filter - exact match
        const dateMatch = !dateValue || ev.date === dateValue ||
            new Date(ev.date).toISOString().split('T')[0] === dateValue;

        // Time filter - partial match
        const timeMatch = !timeValue || (ev.time || "").toLowerCase().includes(timeValue);

        // Location filter - partial match
        const locationMatch = !locationValue || (ev.location || "").toLowerCase().includes(locationValue);

        // Host filter - partial match
        const hostMatch = !hostValue || (ev.host || "").toLowerCase().includes(hostValue);

        // Tags filter - partial match
        const tagsMatch = !tagsValue || (ev.tags || "").toLowerCase().includes(tagsValue);

        return searchMatch && dateMatch && timeMatch && locationMatch && hostMatch && tagsMatch;
    });
}
