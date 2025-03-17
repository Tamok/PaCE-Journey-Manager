/**
 * journeyDetails.js
 *
 * Module for rendering the detailed view of a journey including:
 * - Title display
 * - Podio/Zoho links editing for top-level journeys
 * - Note editing
 * - Mark as complete functionality
 * - Parent Gantt chart display
 * - Subjourney management with collapsible Gantt charts, and edit/delete capabilities
 *
 * Exports:
 *   renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback)
 *
 * Parameters:
 *   journey - The journey object whose details are to be displayed.
 *   journeyData - The full array of journeys (to allow saving any updates).
 *   saveCallback - An async function to persist journey data (e.g. saveJourneyData).
 *   refreshTimelineCallback - A function to refresh the timeline display after changes.
 */

import { renderGantt, bindApprovalCheckboxes } from "./gantt.js";
import { toYMD, parseDate } from "./scheduler.js";

export function renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback) {
  const detailsContainer = document.getElementById("details-container");
  detailsContainer.innerHTML = ""; // Clear previous content

  // Render Journey Title
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("journey-title");
  titleDiv.innerHTML = `<h2>${journey.title}</h2>`;
  detailsContainer.appendChild(titleDiv);
  console.log(`Rendering details for journey: ${journey.title}`);

  // Podio/Zoho Links Editor (only for top-level journeys)
  if (!journey.parentId) {
    const linkEditorBtn = document.createElement("button");
    linkEditorBtn.classList.add("btn");
    linkEditorBtn.textContent = "Edit Podio/Zoho Links";
    detailsContainer.appendChild(linkEditorBtn);

    const linkEditorDiv = document.createElement("div");
    linkEditorDiv.style.display = "none";
    linkEditorDiv.innerHTML = `
      <label>Podio Link:
        <input type="text" id="podio-input" value="${journey.podioLink || ""}" />
      </label>
      <label>Zoho Link:
        <input type="text" id="zoho-input" value="${journey.zohoLink || ""}" />
      </label>
      <button id="save-links-btn" class="btn">Save Links</button>
    `;
    detailsContainer.appendChild(linkEditorDiv);

    linkEditorBtn.addEventListener("click", () => {
      linkEditorDiv.style.display = (linkEditorDiv.style.display === "block") ? "none" : "block";
      console.log("Toggled Podio/Zoho link editor visibility.");
    });

    linkEditorDiv.querySelector("#save-links-btn").addEventListener("click", async () => {
      journey.podioLink = linkEditorDiv.querySelector("#podio-input").value.trim();
      journey.zohoLink = linkEditorDiv.querySelector("#zoho-input").value.trim();
      console.log(`Saving Podio/Zoho links for journey "${journey.title}".`);
      await saveCallback(journeyData);
      linkEditorDiv.style.display = "none";
      renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
    });

    // Display existing links if available
    if (journey.podioLink || journey.zohoLink) {
      const linkDiv = document.createElement("div");
      linkDiv.classList.add("podio-zoho-links");
      if (journey.podioLink) {
        linkDiv.innerHTML += `<a href="${journey.podioLink}" target="_blank">Podio</a> `;
      }
      if (journey.zohoLink) {
        linkDiv.innerHTML += `<a href="${journey.zohoLink}" target="_blank">Zoho</a>`;
      }
      detailsContainer.appendChild(linkDiv);
    }
  }

  // Note Editing Section
  const noteP = document.createElement("p");
  noteP.innerHTML = `<strong>Note:</strong> <span id="note-display">${journey.note || ""}</span>`;
  detailsContainer.appendChild(noteP);

  const editNoteBtn = document.createElement("button");
  editNoteBtn.classList.add("btn");
  editNoteBtn.textContent = "Edit Note";
  detailsContainer.appendChild(editNoteBtn);

  const noteInput = document.createElement("input");
  noteInput.classList.add("edit-note");
  noteInput.value = journey.note || "";
  noteInput.style.display = "none";
  detailsContainer.appendChild(noteInput);

  editNoteBtn.addEventListener("click", () => {
    noteInput.style.display = "block";
    noteInput.focus();
    console.log("Activated note editing mode.");
  });

  noteInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      journey.note = noteInput.value.trim();
      console.log(`Note updated for journey "${journey.title}": ${journey.note}`);
      await saveCallback(journeyData);
      renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
      refreshTimelineCallback();
    }
  });

  // Mark as Complete Button (if not already completed)
  if (!journey.completedDate) {
    const completeBtn = document.createElement("button");
    completeBtn.classList.add("btn");
    completeBtn.textContent = "Mark as Complete";
    detailsContainer.appendChild(completeBtn);

    completeBtn.addEventListener("click", async () => {
      const defaultDate = toYMD(new Date());
      const userDateStr = prompt("Enter completion date (YYYY-MM-DD):", defaultDate);
      if (!userDateStr) return;
      const compDate = parseDate(userDateStr);
      if (isNaN(compDate.getTime())) {
        alert("Invalid date.");
        return;
      }
      journey.completedDate = compDate;
      console.log(`Journey "${journey.title}" marked as complete on ${toYMD(compDate)}.`);
      await saveCallback(journeyData);
      refreshTimelineCallback();
      renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
    });
  } else {
    const completeInfo = document.createElement("p");
    completeInfo.innerHTML = `<strong>Completed on:</strong> ${toYMD(new Date(journey.completedDate))}`;
    detailsContainer.appendChild(completeInfo);
  }

  // Render Parent Gantt Chart
  const ganttDiv = document.createElement("div");
  ganttDiv.innerHTML = renderGantt(journey);
  detailsContainer.appendChild(ganttDiv);
  bindApprovalCheckboxes(journey);
  console.log(`Gantt chart rendered for journey "${journey.title}".`);

  // Subjourney Management Section
  const subContainer = document.createElement("div");
  subContainer.classList.add("subjourneys-container");
  subContainer.innerHTML = "<h3>Subjourneys</h3>";

  // Add Subjourney Button and Form
  const addSubBtn = document.createElement("button");
  addSubBtn.classList.add("btn");
  addSubBtn.textContent = "Add Subjourney";
  subContainer.appendChild(addSubBtn);

  const subForm = document.createElement("div");
  subForm.style.display = "none";
  subForm.innerHTML = `
    <input type="text" id="subjourney-title" placeholder="Subjourney Title" />
    <select id="subjourney-difficulty">
      <option value="easy">Easy</option>
      <option value="medium">Medium</option>
      <option value="hard">Hard</option>
    </select>
    <input type="text" id="subjourney-note" placeholder="Subjourney Note" />
    <input type="text" id="subjourney-podio" placeholder="Podio Link (optional)" />
    <input type="text" id="subjourney-zoho" placeholder="Zoho Link (optional)" />
    <button id="save-subjourney-btn" class="btn">Save Subjourney</button>
    <button id="cancel-subjourney-btn" class="btn btn-cancel">Cancel</button>
  `;
  subContainer.appendChild(subForm);

  addSubBtn.addEventListener("click", () => {
    subForm.style.display = (subForm.style.display === "none") ? "block" : "none";
    console.log("Toggled subjourney add form visibility.");
  });

  subForm.querySelector("#cancel-subjourney-btn").addEventListener("click", () => {
    subForm.style.display = "none";
    console.log("Cancelled subjourney addition.");
  });

  subForm.querySelector("#save-subjourney-btn").addEventListener("click", async () => {
    const title = subForm.querySelector("#subjourney-title").value.trim();
    const difficulty = subForm.querySelector("#subjourney-difficulty").value;
    const note = subForm.querySelector("#subjourney-note").value.trim();
    const podio = subForm.querySelector("#subjourney-podio").value.trim();
    const zoho = subForm.querySelector("#subjourney-zoho").value.trim();

    if (!title) {
      alert("Subjourney title is required.");
      return;
    }
    const newSub = {
      id: Date.now() + Math.random(),
      title,
      difficulty,
      note,
      podioLink: podio,
      zohoLink: zoho
    };
    if (!journey.subJourneys) {
      journey.subJourneys = [];
    }
    journey.subJourneys.push(newSub);
    console.log(`Added new subjourney "${title}" to journey "${journey.title}".`);
    await saveCallback(journeyData);
    subForm.style.display = "none";
    renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
  });

  // Render existing subjourneys if any
  if (journey.subJourneys && journey.subJourneys.length > 0) {
    journey.subJourneys.forEach((sub, idx) => {
      const subItem = document.createElement("div");
      subItem.classList.add("subjourney-item");
      subItem.style.marginBottom = "10px";
      subItem.innerHTML = `
        <strong>${sub.title}</strong>
        <br><em>Difficulty:</em> ${sub.difficulty}
        <br><em>Note:</em> <span class="sub-note-display">${sub.note}</span>
        <br>
        <button class="btn edit-sub">Edit</button>
        <button class="btn delete-sub" data-index="${idx}">Delete</button>
        <button class="btn toggle-sub-gantt">Toggle Gantt</button>
        <div class="sub-gantt" style="display:none;">${renderGantt(sub)}</div>
        <div class="edit-sub-form" style="display:none;">
          <input type="text" class="edit-sub-title" value="${sub.title}" />
          <select class="edit-sub-difficulty">
            <option value="easy" ${sub.difficulty==="easy"?"selected":""}>Easy</option>
            <option value="medium" ${sub.difficulty==="medium"?"selected":""}>Medium</option>
            <option value="hard" ${sub.difficulty==="hard"?"selected":""}>Hard</option>
          </select>
          <input type="text" class="edit-sub-note" value="${sub.note}" placeholder="Subjourney Note" />
          <input type="text" class="edit-sub-podio" value="${sub.podioLink||""}" placeholder="Podio Link" />
          <input type="text" class="edit-sub-zoho" value="${sub.zohoLink||""}" placeholder="Zoho Link" />
          <button class="btn save-sub-edit">Save</button>
          <button class="btn cancel-sub-edit btn-cancel">Cancel</button>
        </div>
      `;

      // Delete subjourney event
      subItem.querySelector(".delete-sub").addEventListener("click", async () => {
        if (confirm("Delete this subjourney?")) {
          journey.subJourneys.splice(idx, 1);
          console.log(`Deleted subjourney "${sub.title}" from journey "${journey.title}".`);
          await saveCallback(journeyData);
          renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
        }
      });

      // Toggle edit form for subjourney
      subItem.querySelector(".edit-sub").addEventListener("click", () => {
        const editForm = subItem.querySelector(".edit-sub-form");
        editForm.style.display = (editForm.style.display === "none") ? "block" : "none";
        console.log(`Toggled edit form for subjourney "${sub.title}".`);
      });

      // Save subjourney edit
      subItem.querySelector(".save-sub-edit").addEventListener("click", async () => {
        const newTitle = subItem.querySelector(".edit-sub-title").value.trim();
        const newDiff = subItem.querySelector(".edit-sub-difficulty").value;
        const newNote = subItem.querySelector(".edit-sub-note").value.trim();
        const newPodio = subItem.querySelector(".edit-sub-podio").value.trim();
        const newZoho = subItem.querySelector(".edit-sub-zoho").value.trim();
        if (!newTitle) {
          alert("Title required.");
          return;
        }
        sub.title = newTitle;
        sub.difficulty = newDiff;
        sub.note = newNote;
        sub.podioLink = newPodio;
        sub.zohoLink = newZoho;
        console.log(`Updated subjourney "${newTitle}" in journey "${journey.title}".`);
        await saveCallback(journeyData);
        renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
      });

      // Cancel subjourney edit
      subItem.querySelector(".cancel-sub-edit").addEventListener("click", () => {
        subItem.querySelector(".edit-sub-form").style.display = "none";
        console.log(`Cancelled edit for subjourney "${sub.title}".`);
      });

      // Toggle collapsible Gantt for subjourney
      subItem.querySelector(".toggle-sub-gantt").addEventListener("click", () => {
        const subGanttDiv = subItem.querySelector(".sub-gantt");
        subGanttDiv.style.display = (subGanttDiv.style.display === "none") ? "block" : "none";
        console.log(`Toggled Gantt chart visibility for subjourney "${sub.title}".`);
      });

      subContainer.appendChild(subItem);
    });
  }

  detailsContainer.appendChild(subContainer);
  console.log(`Subjourney section rendered for journey "${journey.title}".`);
}
