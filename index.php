
<?php
// ========================================
// GOOGLE SHEETS (Option A: Publish as CSV)
// ========================================

// 🔧 PUT YOUR GOOGLE SHEET CSV URL HERE
$csv_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-_vMfpUnY0zdDCYpjKugwXEGuWMn42WSOyI3UqVeLQgzbCMJsg7U4xgkISXtCymLKVGGSB5TuzITA/pub?output=csv";

// Fetch CSV
$csv_data = array_map("str_getcsv", explode("\n", file_get_contents($csv_url)));
$headers = array_map('trim', array_shift($csv_data)); // extract header row

// Convert CSV rows → associative arrays
$events = [];
foreach ($csv_data as $row) {
    if (count($row) < count($headers)) continue;
    $events[] = array_combine($headers, $row);
}

// Output JSON of all events for JS filtering
$events_json = json_encode($events);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Spoke 'n Word</title>
    <link rel="stylesheet" href="styles.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <header>
        <h1>Spoke 'n Word</h1>
    </header>

    <!-- FILTER SECTION -->
    <section id="filters" class="filters">
        <input id="searchInput" placeholder="Search events…" />

        <input id="dateFilter" type="date" />
        <input id="timeFilter" type="time" />

        <input id="locationFilter" placeholder="Filter by location…" />
        <input id="hostFilter" placeholder="Filter by host…" />
        <input id="tagFilter" placeholder="Filter by tag…" />
    </section>

    <!-- EVENT TABLE -->
    <section id="eventList" class="event-list">
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Host</th>
                    <th>Description</th>
                    <th>Tags</th>
                    <th>Link</th>
                </tr>
            </thead>
            <tbody id="tableBody">
            </tbody>
        </table>
    </section>

    <script>
        const events = <?= $events_json ?>;
    </script>
    <script src="script.js"></script>
</body>
</html>
