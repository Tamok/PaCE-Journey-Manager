// app.js
// Main application logic for PaCE Journey Manager.
// This module uses ES module syntax and imports functions from db.js and gantt.js.
// It handles scheduling, rendering the timeline and details view (including collapsible Gantt charts),
// drag-and-drop reordering, editing, adding/deleting subjourneys, and marking journeys complete.

import { initializeDefaultData, loadJourneysFromFirestore, saveJourneysToFirestore } from "./db.js";
import { renderGanttChart, renderCollapsibleGantt } from "./gantt.js";

console.log("PaCE Journey Manager app starting...");

let journeyData = [];

// Load journey data (initialize default data if needed)
async function loadData() {
  journeyData = await initializeDefaultData();
  console.log("Loaded journeyData:", journeyData);
  renderTimeline();
}
loadData();

// Utility Functions
function parseDate(str) {
  const [y, m, d] = str.split("-").map(x => parseInt(x, 10));
  return new Date(y, m - 1, d);
}
function toYMD(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}
function addDays(date, n) {
  const r = new Date(date);
  r.setDate(r.getDate() + n);
  return r;
}
function isWeekend(date) {
  return (date.getDay() === 0 || date.getDay() === 6);
}
function isHoliday(date) {
  // Using holidayRanges from defaultData.js (or import from data.js if you prefer)
  return false; // For now, assume no holidays; you can extend this later.
}
function getNextBusinessDay(date) {
  let d = new Date(date);
  while (isWeekend(d) /*|| isHoliday(d)*/) {
    d = addDays(d, 1);
  }
  return d;
}
function getPreviousBusinessDay(date) {
  let d = new Date(date);
  while (isWeekend(d) /*|| isHoliday(d)*/) {
    d = addDays(d, -1);
  }
  return d;
}
function getDuration(difficulty) {
  if (difficulty === "medium") return 45;
  if (difficulty === "hard") return 60;
  return 30;
}

// Sorting: sort by priority and, if Critical, by priorityNumber.
const priorityOrder = {
  "Critical": 1,
  "Important": 2,
  "Next": 3,
  "Sometime Maybe": 4,
  "Child": 5
};
function sortJourneys() {
  journeyData.sort((a, b) => {
    const pa = priorityOrder[a.priority] || 99;
    const pb = priorityOrder[b.priority] || 99;
    if (pa !== pb) return pa - pb;
    if (pa === 1) {
      const na = a.priorityNumber || 9999;
      const nb = b.priorityNumber || 9999;
      return na - nb;
    }
    return 0;
  });
}

// Scheduling: first journey starts on Monday, March 3, 2025.
const BASE_START_DATE = new Date("2025-03-03");
function scheduleJourneys() {
  sortJourneys();
  let currentDate = getNextBusinessDay(BASE_START_DATE);
  journeyData.forEach(j => {
    if (j.completedDate) {
      j.startDate = getNextBusinessDay(currentDate);
      j.endDate = new Date(j.completedDate);
      if (j.endDate < j.startDate) {
        j.startDate = new Date(j.endDate);
      }
    } else {
      j.startDate = getNextBusinessDay(currentDate);
      let dur = getDuration(j.difficulty);
      let end = addDays(j.startDate, dur - 1);
      if (isWeekend(end)) {
        end = getPreviousBusinessDay(end);
      }
      j.endDate = end;
    }
    currentDate = addDays(j.endDate, 1);
  });
}

// DOM Elements
const resetDefaultBtn = document.getElementById("reset-default-btn");
const timelineContainer = document.getElementById("timeline-container");
const detailsContainer = document.getElementById("details-container");
const addJourneyBtn = document.getElementById("add-journey-btn");
const addJourneyForm = document.getElementById("add-journey-form");
const saveNewJourneyBtn = document.getElementById("save-new-journey");
const cancelNewJourneyBtn = document.getElementById("cancel-new-journey");

let dragSrcEl = null;
let currentJourneyId = null;

// RESET TO DEFAULT
resetDefaultBtn.addEventListener("click", async () => {
  const confirmMsg = "Are you sure you want to reset all data to default? This action cannot be undone.";
  if (confirm(confirmMsg)) {
    journeyData = await resetToDefaultData(); // calls the new function in db.js
    renderTimeline();
    console.log("Data reset to defaults. Timeline reloaded.");
  }
});

// Render Timeline (only top-level journeys; subjourneys are nested)
function renderTimeline() {
  scheduleJourneys();
  timelineContainer.innerHTML = "";
  journeyData.forEach((j, index) => {
    if (j.priority === "Child") return;
    const item = document.createElement("div");
    item.classList.add("timeline-item");
    if (j.priority === "Critical") item.classList.add("critical");
    else if (j.priority === "Important") item.classList.add("important");
    else if (j.priority === "Next") item.classList.add("next");
    else item.classList.add("maybe");
    if (j.completedDate) item.classList.add("completed");
    item.setAttribute("draggable", "true");

    const monthYear = j.startDate ? j.startDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
    const dateRange = (j.startDate && j.endDate) ? `${toYMD(j.startDate)} – ${toYMD(j.endDate)}` : "";
    item.innerHTML = `
      <strong>${j.title}</strong>
      <span>${monthYear}<br>${dateRange}</span>
    `;
    item.addEventListener("click", () => {
      document.querySelectorAll(".timeline-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      currentJourneyId = j.id;
      renderDetails(j.id);
    });
    item.addEventListener("dragstart", e => {
      dragSrcEl = item;
      e.dataTransfer.effectAllowed = "move";
    });
    item.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      item.classList.add("drop-target");
    });
    item.addEventListener("dragleave", () => {
      item.classList.remove("drop-target");
    });
    item.addEventListener("drop", async e => {
      e.stopPropagation();
      item.classList.remove("drop-target");
      if (dragSrcEl !== item) {
        const fromIndex = [...timelineContainer.children].indexOf(dragSrcEl);
        const toIndex = [...timelineContainer.children].indexOf(item);
        const [moved] = journeyData.splice(fromIndex, 1);
        journeyData.splice(toIndex, 0, moved);
        await saveJourneysToFirestore(journeyData);
        renderTimeline();
        item.classList.add("active");
        renderDetails(moved.id);
      }
    });
    item.addEventListener("dragend", () => {
      document.querySelectorAll(".timeline-item").forEach(el => el.classList.remove("drop-target"));
    });
    timelineContainer.appendChild(item);
  });
}

// Render Details for a journey (including subjourneys and Gantt charts)
function renderDetails(journeyId) {
  const j = journeyData.find(x => x.id === journeyId);
  if (!j) {
    detailsContainer.innerHTML = "<p>Journey not found.</p>";
    return;
  }
  detailsContainer.innerHTML = "";

  // Title and priority
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("journey-title");
  titleDiv.innerHTML = `<h2>${j.title}</h2>`;
  detailsContainer.appendChild(titleDiv);

  // Priority Editor
  const priorityDiv = document.createElement("div");
  priorityDiv.innerHTML = `
    <label>Priority:
      <select id="journey-priority-select">
        <option value="Critical">Critical</option>
        <option value="Important">Important</option>
        <option value="Next">Next</option>
        <option value="Sometime Maybe">Sometime Maybe</option>
      </select>
    </label>
    <label>Sub-Priority (if Critical):
      <input type="number" id="journey-priority-number" style="width:60px;" />
    </label>
  `;
  detailsContainer.appendChild(priorityDiv);
  const prioSelect = priorityDiv.querySelector("#journey-priority-select");
  const prioNumber = priorityDiv.querySelector("#journey-priority-number");
  prioSelect.value = j.priority || "Sometime Maybe";
  prioNumber.value = j.priorityNumber || "";
  prioSelect.addEventListener("change", async () => {
    j.priority = prioSelect.value;
    if (j.priority !== "Critical") {
      j.priorityNumber = undefined;
      prioNumber.value = "";
    }
    await saveJourneysToFirestore(journeyData);
    renderTimeline();
    renderDetails(j.id);
  });
  prioNumber.addEventListener("change", async () => {
    if (j.priority === "Critical") {
      j.priorityNumber = parseInt(prioNumber.value, 10) || undefined;
      await saveJourneysToFirestore(journeyData);
      renderTimeline();
      renderDetails(j.id);
    }
  });

  // Date Display
  const dateP = document.createElement("p");
  const startStr = j.startDate ? j.startDate.toDateString() : "(unscheduled)";
  const endStr = j.endDate ? j.endDate.toDateString() : "(unscheduled)";
  dateP.innerHTML = `<strong>Schedule:</strong> ${startStr} – ${endStr}`;
  detailsContainer.appendChild(dateP);

  // Podio/Zoho Links Editor (only for non-child journeys)
  if (j.priority !== "Child") {
    const linkEditorBtn = document.createElement("button");
    linkEditorBtn.classList.add("btn");
    linkEditorBtn.textContent = "Edit Podio/Zoho Links";
    detailsContainer.appendChild(linkEditorBtn);
    const linkEditorDiv = document.createElement("div");
    linkEditorDiv.style.display = "none";
    linkEditorDiv.innerHTML = `
      <label>Podio Link:
        <input type="text" id="podio-input" value="${j.podioLink || ""}" />
      </label>
      <label>Zoho Link:
        <input type="text" id="zoho-input" value="${j.zohoLink || ""}" />
      </label>
      <button id="save-links-btn" class="btn">Save Links</button>
    `;
    detailsContainer.appendChild(linkEditorDiv);
    linkEditorBtn.addEventListener("click", () => {
      linkEditorDiv.style.display = linkEditorDiv.style.display === "block" ? "none" : "block";
    });
    linkEditorDiv.querySelector("#save-links-btn").addEventListener("click", async () => {
      j.podioLink = linkEditorDiv.querySelector("#podio-input").value.trim();
      j.zohoLink = linkEditorDiv.querySelector("#zoho-input").value.trim();
      await saveJourneysToFirestore(journeyData);
      linkEditorDiv.style.display = "none";
      renderDetails(j.id);
    });
    if (j.podioLink || j.zohoLink) {
      const linkDiv = document.createElement("div");
      linkDiv.classList.add("podio-zoho-links");
      if (j.podioLink) {
        linkDiv.innerHTML += `<a href="${j.podioLink}" target="_blank">Podio</a> `;
      }
      if (j.zohoLink) {
        linkDiv.innerHTML += `<a href="${j.zohoLink}" target="_blank">Zoho</a>`;
      }
      detailsContainer.appendChild(linkDiv);
    }
  }

  // Note Editing
  const noteP = document.createElement("p");
  noteP.innerHTML = `<strong>Note:</strong> <span id="note-display">${j.note}</span>`;
  detailsContainer.appendChild(noteP);
  const editNoteBtn = document.createElement("button");
  editNoteBtn.classList.add("btn");
  editNoteBtn.textContent = "Edit Note";
  detailsContainer.appendChild(editNoteBtn);
  const noteInput = document.createElement("input");
  noteInput.classList.add("edit-note");
  noteInput.value = j.note;
  detailsContainer.appendChild(noteInput);
  editNoteBtn.addEventListener("click", () => {
    noteInput.style.display = "block";
    noteInput.focus();
  });
  noteInput.addEventListener("keydown", async e => {
    if (e.key === "Enter") {
      j.note = noteInput.value.trim();
      await saveJourneysToFirestore(journeyData);
      renderDetails(j.id);
      renderTimeline();
    }
  });

  // Mark as Complete Button
  if (!j.completedDate) {
    const completeBtn = document.createElement("button");
    completeBtn.classList.add("btn");
    completeBtn.textContent = "Mark as Complete";
    completeBtn.addEventListener("click", async () => {
      const userDateStr = prompt("Enter completion date (YYYY-MM-DD):", toYMD(new Date()));
      if (!userDateStr) return;
      const compDate = parseDate(userDateStr);
      if (isNaN(compDate.getTime())) {
        alert("Invalid date.");
        return;
      }
      j.completedDate = compDate;
      await saveJourneysToFirestore(journeyData);
      renderTimeline();
      renderDetails(j.id);
    });
    detailsContainer.appendChild(completeBtn);
  }

  // Render Gantt Chart for this journey
  const ganttDiv = document.createElement("div");
  ganttDiv.innerHTML = renderGanttChart(j);
  detailsContainer.appendChild(ganttDiv);

  // Render Subjourneys (with their own collapsible Gantt charts)
  if (j.subJourneys && j.subJourneys.length > 0) {
    const subDiv = document.createElement("div");
    subDiv.classList.add("subjourneys-container");
    subDiv.innerHTML = "<h3>Subjourneys</h3>";
    j.subJourneys.forEach((sub, idx) => {
      const item = document.createElement("div");
      item.classList.add("subjourney-item");
      item.innerHTML = `
        <strong>${sub.title}</strong>
        <br><em>Difficulty:</em> ${sub.difficulty}
        <br><em>Note:</em> ${sub.note}
        <button class="btn delete-sub" data-index="${idx}">Delete</button>
        <div class="sub-gantt">${renderGanttChart(sub)}</div>
      `;
      subDiv.appendChild(item);
    });
    const addSubBtn = document.createElement("button");
    addSubBtn.classList.add("btn");
    addSubBtn.textContent = "Add Subjourney";
    addSubBtn.addEventListener("click", async () => {
      const subTitle = prompt("Enter subjourney title:");
      if (!subTitle) return;
      const subDiff = prompt("Enter difficulty (easy, medium, hard):", "easy");
      const subNote = prompt("Enter note (optional):", "");
      const newSub = {
        id: Date.now() + Math.random(),
        title: subTitle,
        difficulty: subDiff,
        note: subNote
      };
      // If parent is complete, reopen it by removing the completedDate
      if (j.completedDate) {
        delete j.completedDate;
      }
      j.subJourneys.push(newSub);
      await saveJourneysToFirestore(journeyData);
      renderDetails(j.id);
    });
    subDiv.appendChild(addSubBtn);
    detailsContainer.appendChild(subDiv);
  }

  // Legend
  const legendDiv = document.createElement("div");
  legendDiv.id = "legend";
  legendDiv.innerHTML = `
    <div class="legend-item"><div class="legend-color"></div> Critical</div>
    <div class="legend-item"><div class="legend-color important"></div> Important</div>
    <div class="legend-item"><div class="legend-color next"></div> Next</div>
    <div class="legend-item"><div class="legend-color maybe"></div> Sometime Maybe</div>
  `;
  detailsContainer.appendChild(legendDiv);
}

// Add Journey Form Logic
addJourneyBtn.addEventListener("click", () => {
  addJourneyForm.style.display = "block";
});
cancelNewJourneyBtn.addEventListener("click", () => {
  addJourneyForm.style.display = "none";
});
saveNewJourneyBtn.addEventListener("click", async () => {
  const title = document.getElementById("new-journey-title").value.trim();
  const prio = document.getElementById("new-journey-priority").value;
  const subPrio = parseInt(document.getElementById("new-journey-number").value, 10) || undefined;
  const diff = document.getElementById("new-journey-difficulty").value;
  const note = document.getElementById("new-journey-note").value.trim();
  const podio = document.getElementById("new-journey-podio").value.trim();
  const zoho = document.getElementById("new-journey-zoho").value.trim();
  if (!title) {
    alert("Title required.");
    return;
  }
  const newJ = {
    id: Date.now() + Math.random(),
    title,
    priority: prio,
    priorityNumber: (prio === "Critical") ? subPrio : undefined,
    difficulty: diff,
    note,
    podioLink: podio,
    zohoLink: zoho,
    subJourneys: []
  };
  journeyData.push(newJ);
  await saveJourneysToFirestore(journeyData);
  document.getElementById("new-journey-title").value = "";
  document.getElementById("new-journey-number").value = "";
  document.getElementById("new-journey-note").value = "";
  document.getElementById("new-journey-podio").value = "";
  document.getElementById("new-journey-zoho").value = "";
  addJourneyForm.style.display = "none";
  renderTimeline();
});

// Save / Download Config
document.getElementById("save-config-btn").addEventListener("click", async () => {
  await saveJourneysToFirestore(journeyData);
  alert("Configuration saved to Firestore.");
});
document.getElementById("download-config-btn").addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(journeyData, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "journey_configuration.json");
  dlAnchor.click();
});

// Initial render
renderTimeline();
if (timelineContainer.firstChild) {
  timelineContainer.firstChild.classList.add("active");
  const firstJourney = journeyData.find(j => j.priority !== "Child");
  if (firstJourney) {
    currentJourneyId = firstJourney.id;
    renderDetails(firstJourney.id);
  }
}

console.log("PaCE Journey Manager initialized with journeyData:", journeyData);

