/**
 * app.js
 *
 * Main entry point for the PaCE Journey Manager application.
 *
 * Features:
 *  - Loads journey data from the database (Firestore) on startup,
 *    falling back to default data (from defaultData.js) if none exists.
 *  - Schedules journeys based on difficulty and parent–child relationships.
 *  - Renders a draggable timeline and detailed view with an interactive Gantt chart.
 *  - Persists any changes (such as reordering) to the database.
 *  - Provides a “Reset to Default” option that uses the defaultData.js definitions.
 *
 * Environment variables such as Firebase configuration should be stored in a .env file
 * and referenced by the db.js module.
 *
 * Author: Your Name
 * Date: YYYY-MM-DD
 */

// Import modules.
import { scheduleJourneys, toYMD, BASE_START_DATE } from "./scheduler.js";
import { renderTimeline } from "./timeline.js";
import { renderGantt, bindApprovalCheckboxes } from "./gantt.js";
import {
  initializeDefaultData,
  saveJourneysToFirestore,
  resetToDefaultData
} from "./db.js";

// Get DOM elements.
const timelineContainer = document.getElementById("timeline-container");
const detailsContainer = document.getElementById("details-container");
const resetDefaultBtn = document.getElementById("reset-default-btn");

// Global journey data array.
let journeyData = [];

/**
 * Renders the detailed view for the selected journey.
 *
 * @param {number} index - The index of the journey in journeyData.
 */
function renderDetails(index) {
  const journey = journeyData[index];
  detailsContainer.innerHTML = "";

  // Render journey title.
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("journey-title");
  titleDiv.innerHTML = `<h2>${journey.title}</h2>`;
  detailsContainer.appendChild(titleDiv);

  // Additional detail sections (priority selectors, notes, link editors, etc.)
  // can be added here as needed.

  // Render the Gantt chart.
  const ganttTitle = document.createElement("h3");
  ganttTitle.textContent = "Weekly Breakdown (Gantt)";
  detailsContainer.appendChild(ganttTitle);

  const ganttHTML = renderGantt(journey);
  detailsContainer.insertAdjacentHTML("beforeend", ganttHTML);

  // Bind approval checkbox events so that checking them stamps the task.
  bindApprovalCheckboxes(journey);
  console.log(`Rendered details for journey "${journey.title}".`);
}

/**
 * Renders the timeline with drag & drop reordering.
 *
 * The timeline module updates journeyData with an explicit 'order'
 * property when items are manually reordered. After each reordering,
 * the new journey order is saved to the database.
 */
function renderAppTimeline() {
  renderTimeline(journeyData, timelineContainer, renderDetails);
  console.log("Timeline rendered with updated journey data.");
  // Persist changes after rendering (e.g. after a drop event).
  saveJourneyData();
}

/**
 * Loads journey data from the database. If no data exists,
 * resets to default (using defaultData.js via resetToDefaultData).
 */
async function loadJourneyData() {
  try {
    const data = await initializeDefaultData();
    if (Array.isArray(data) && data.length > 0) {
      journeyData = data;
      console.log("Loaded journey data from database.");
    } else {
      console.warn("No journey data found in database. Resetting to default.");
      await resetJourneyDataToDefault();
    }
  } catch (error) {
    console.error("Error loading journey data:", error);
  }
  renderAppTimeline();
}

/**
 * Saves the current journey data to the database.
 */
async function saveJourneyData() {
  try {
    await saveJourneysToFirestore(journeyData);
    console.log("Journey data saved to database.");
  } catch (error) {
    console.error("Error saving journey data:", error);
  }
}

/**
 * Resets the journey data to the default values defined in defaultData.js.
 * Then saves these default values to the database.
 */
async function resetJourneyDataToDefault() {
  try {
    journeyData = await resetToDefaultData();
    console.log("Journey data reset to default.");
    await saveJourneyData();
    renderAppTimeline();
  } catch (error) {
    console.error("Error resetting journey data to default:", error);
  }
}

// Attach event listener for the "Reset to Default" button.
if (resetDefaultBtn) {
  resetDefaultBtn.addEventListener("click", async () => {
    if (
      confirm(
        "Are you sure you want to reset journey data to default? This action cannot be undone."
      )
    ) {
      await resetJourneyDataToDefault();
    }
  });
} else {
  console.warn("Reset to Default button not found in the DOM.");
}

/**
 * Initializes the application:
 *  - Loads journey data from the database.
 *  - Renders the timeline.
 */
async function initApp() {
  console.log("Initializing PaCE Journey Manager...");
  await loadJourneyData();
}

// Initialize the application.
initApp();

// Note: The timeline module (timeline.js) should be written so that any drag-and-drop reordering
// updates the journeyData array with an explicit 'order' property and calls the provided renderDetails callback.
// This, in turn, triggers saveJourneyData() to persist changes.
