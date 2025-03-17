/**
 * app.js
 *
 * Main entry point for PaCE Journey Manager.
 * Loads journey data from Firestore (or default data), schedules journeys,
 * renders the timeline and detailed view, and enables configuration save/download/upload.
 *
 * Author: Your Name
 * Date: YYYY-MM-DD
 */

import { scheduleJourneys, toYMD } from "./scheduler.js";
import { renderTimeline } from "./timeline.js";
import { renderJourneyDetails } from "./journeyDetails.js";
import {
  initializeDefaultData,
  saveJourneysToFirestore,
  resetToDefaultData
} from "./db.js";

const timelineContainer = document.getElementById("timeline-container");
const resetDefaultBtn = document.getElementById("reset-default-btn");
const addJourneyBtn = document.getElementById("add-journey-btn");
const addJourneyForm = document.getElementById("add-journey-form");
const saveConfigBtn = document.getElementById("save-config-btn");
const downloadConfigBtn = document.getElementById("download-config-btn");
const uploadConfigBtn = document.getElementById("upload-config-btn");

let journeyData = [];

/**
 * Renders detailed view for the selected journey.
 * @param {number} index - Index in journeyData.
 */
function renderDetails(index) {
  const journey = journeyData[index];
  renderJourneyDetails(journey, journeyData, saveJourneyData, renderAppTimeline);
}

/**
 * Renders the timeline and persists changes.
 */
function renderAppTimeline() {
  renderTimeline(journeyData, timelineContainer, renderDetails);
  console.log("Timeline rendered.");
  saveJourneyData();
}

/**
 * Loads journey data from Firestore; resets to default if empty.
 */
async function loadJourneyData() {
  try {
    const data = await initializeDefaultData();
    if (Array.isArray(data) && data.length > 0) {
      journeyData = data;
      console.log("Loaded journey data from database.");
    } else {
      console.warn("No journey data found; resetting to default.");
      await resetJourneyDataToDefault();
    }
  } catch (error) {
    console.error("Error loading journey data:", error);
  }
  renderAppTimeline();
}

/**
 * Saves journey data to Firestore.
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
 * Resets journey data to default and saves to Firestore.
 */
async function resetJourneyDataToDefault() {
  try {
    journeyData = await resetToDefaultData();
    console.log("Journey data reset to default.");
    await saveJourneyData();
    renderAppTimeline();
  } catch (error) {
    console.error("Error resetting journey data:", error);
  }
}

// Reset Configuration button.
if (resetDefaultBtn) {
  resetDefaultBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to reset data? This action cannot be undone.")) {
      await resetJourneyDataToDefault();
    }
  });
} else {
  console.warn("Reset button not found in DOM.");
}

/**
 * Handles Add Journey form.
 */
if (addJourneyBtn && addJourneyForm) {
  addJourneyBtn.addEventListener("click", () => {
    addJourneyForm.style.display = "block";
    console.log("Add Journey form displayed.");
  });
  document.getElementById("cancel-new-journey").addEventListener("click", () => {
    addJourneyForm.style.display = "none";
    console.log("Add Journey form cancelled.");
  });
  document.getElementById("save-new-journey").addEventListener("click", async () => {
    const title = document.getElementById("new-journey-title").value.trim();
    const prio = document.getElementById("new-journey-priority").value;
    const subPrio = parseInt(document.getElementById("new-journey-number").value, 10) || null;
    const diff = document.getElementById("new-journey-difficulty").value;
    const note = document.getElementById("new-journey-note").value.trim();
    const podio = document.getElementById("new-journey-podio").value.trim();
    const zoho = document.getElementById("new-journey-zoho").value.trim();
    if (!title) {
      alert("Title is required.");
      return;
    }
    const newJourney = {
      id: Date.now() + Math.random(),
      title,
      priority: prio,
      priorityNumber: (prio === "Critical") ? subPrio : null,
      difficulty: diff,
      note,
      podioLink: podio,
      zohoLink: zoho,
      completedDate: null,
      startDate: null,
      endDate: null,
      subJourneys: []
    };
    journeyData.push(newJourney);
    console.log(`Added new journey: "${title}".`);
    await saveJourneyData();
    document.getElementById("new-journey-title").value = "";
    document.getElementById("new-journey-number").value = "";
    document.getElementById("new-journey-note").value = "";
    document.getElementById("new-journey-podio").value = "";
    document.getElementById("new-journey-zoho").value = "";
    addJourneyForm.style.display = "none";
    renderAppTimeline();
  });
} else {
  console.warn("Add Journey elements not found in DOM.");
}

/**
 * Save Configuration button handler.
 */
if (saveConfigBtn) {
  saveConfigBtn.addEventListener("click", async () => {
    await saveJourneyData();
    alert("Configuration saved to Firestore.");
  });
}

/**
 * Download Configuration button handler.
 */
if (downloadConfigBtn) {
  downloadConfigBtn.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(journeyData, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "journey_configuration.json");
    dlAnchor.click();
  });
}

/**
 * Upload Configuration handler.
 */
if (uploadConfigBtn) {
  uploadConfigBtn.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        const importedData = JSON.parse(text);
        journeyData = importedData;
        await saveJourneyData();
        renderAppTimeline();
        alert("Configuration uploaded successfully.");
      } catch (error) {
        console.error("Error parsing uploaded configuration:", error);
        alert("Invalid configuration file.");
      }
    };
    fileInput.click();
  });
}

(async function initApp() {
  console.log("Initializing PaCE Journey Manager...");
  await loadJourneyData();
})();
