# Journeys Timeline App

This folder contains a standalone multi-file JavaScript application for displaying
a timeline of journeys, subjourneys, Gantt charts, etc.

## Structure

- index.html
  Main HTML entry point. Loads the CSS/JS files in the correct order.
- css/styles.css
  All styling (colors, layout, fancy scrollbar, etc.).
- js/data.js
  Contains holiday data, the final parsed journey list from the spreadsheet, and any default tasks.
- js/db.js
  A simple "database" layer that uses localStorage. In production, replace with real server calls.
- js/app.js
  Core logic: sorting, scheduling, rendering the timeline, details, subjourneys, forms, etc.

## Hosting on Drupal

1. **Static Folder** (Simple)
   - Copy this `journeys/` folder into your Drupal webroot (e.g., `web/journeys/`).
   - Visit https://example.com/journeys/ to see the timeline.

2. **Integrate into Drupal** (Advanced)
   - Place these files in your custom theme or module. 
   - Define a .libraries.yml referencing these CSS/JS files.
   - Attach the library in a Twig template or custom block. 
   - Optionally create a custom route to serve the page at /timeline.

## Customization

- Adjust color theming in `css/styles.css`.
- Modify or add more journeys in `js/data.js`.
- Switch from localStorage to a real backend by editing `js/db.js`.
