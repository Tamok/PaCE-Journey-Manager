/**
 * journeyDetails.js
 *
 * Renders the detailed view for a journey.
 * Displays journey title, editable difficulty/priority, scheduling info,
 * link editors, note editing, and a repositioned "Mark as Complete" button.
 * Also handles subjourneys and renders the associated Gantt chart.
 *
 */

import { renderGantt, bindApprovalCheckboxes } from "./gantt.js";
import { toYMD, parseDate } from "./scheduler.js";

/**
 * Helper: Sorts subjourneys of a journey by priority (using defined order),
 * preserving manual order within each priority group.
 * @param {Object} journey - The journey object containing subJourneys.
 */
function sortSubjourneys(journey) {
  const priorityOrder = { "Critical": 1, "Important": 2, "Next": 3, "Sometime Maybe": 4 };
  if (journey.subJourneys && journey.subJourneys.length > 0) {
    journey.subJourneys = journey.subJourneys.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0; // Preserve order within same priority (stable sort)
    });
  }
}

/**
 * Renders the detailed view for the selected journey.
 * @param {Object} journey - The journey object.
 * @param {Array} journeyData - The complete array of journeys.
 * @param {Function} saveCallback - Callback to save journeyData.
 * @param {Function} refreshTimelineCallback - Callback to re-render the timeline.
 */
export function renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback) {
  const detailsContainer = document.getElementById("details-container");
  detailsContainer.innerHTML = "";
  console.log(`Rendering details for journey: ${journey.title}`);

  // Header with title and completion button/info.
  const headerDiv = document.createElement("div");
  headerDiv.style.position = "relative";
  headerDiv.classList.add("journey-header");
  headerDiv.innerHTML = `<h2>${journey.title}</h2>`;
  detailsContainer.appendChild(headerDiv);

  if (!journey.completedDate) {
    const completeBtn = document.createElement("button");
    completeBtn.classList.add("btn");
    completeBtn.style.position = "absolute";
    completeBtn.style.top = "10px";
    completeBtn.style.right = "10px";
    completeBtn.textContent = "Mark as Complete";
    headerDiv.appendChild(completeBtn);
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
      console.log(`Journey "${journey.title}" marked complete on ${toYMD(compDate)}.`);
      await saveCallback(journeyData);
      refreshTimelineCallback();
      renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
    });
  } else {
    const completeInfo = document.createElement("p");
    completeInfo.innerHTML = `<strong>Completed on:</strong> ${toYMD(new Date(journey.completedDate))}`;
    headerDiv.appendChild(completeInfo);
  }

  // Schedule and settings info.
  const infoDiv = document.createElement("div");
  infoDiv.style.marginBottom = "8px";
  let scheduleInfo = "(unscheduled)";
  if (journey.initialStartDate && journey.initialEndDate && journey.scheduledStartDate && journey.scheduledEndDate) {
    const plannedStart = new Date(journey.initialStartDate);
    const plannedEnd = new Date(journey.initialEndDate);
    const scheduledStart = new Date(journey.scheduledStartDate);
    const scheduledEnd = new Date(journey.scheduledEndDate);
    const plannedDuration = Math.ceil((plannedEnd - plannedStart + 1) / (24 * 3600 * 1000));
    const startStr = scheduledStart.toLocaleDateString();
    const endStr = scheduledEnd.toLocaleDateString();
    scheduleInfo = `Start: ${startStr}, End: ${endStr}, Duration: ${plannedDuration} days`;
    const today = new Date();
    if (!journey.completedDate && today > plannedEnd) {
      const overdueDays = Math.floor((today - plannedEnd) / (24 * 3600 * 1000));
      scheduleInfo += ` <span style="color:red;">(${overdueDays} days over)</span>`;
      console.log(`Journey "${journey.title}" is overdue by ${overdueDays} days.`);
    }
    if (journey.completedDate) {
      const actualDuration = Math.ceil((scheduledEnd - scheduledStart + 1) / (24 * 3600 * 1000));
      const diff = plannedDuration - actualDuration;
      if (diff > 0) {
        scheduleInfo += ` <span style="color:green;">(${diff} days early)</span>`;
        console.log(`Journey "${journey.title}" completed ${diff} days early.`);
      } else if (diff < 0) {
        scheduleInfo += ` <span style="color:red;">(${Math.abs(diff)} days late)</span>`;
        console.log(`Journey "${journey.title}" completed ${Math.abs(diff)} days late.`);
      }
    }
  }

  infoDiv.innerHTML = `
    <div style="margin-bottom:8px;">
      <label><strong>Difficulty:</strong></label>
      <select id="edit-difficulty">
        <option value="Easy" ${journey.difficulty==="Easy"?"selected":""}>Easy</option>
        <option value="Medium" ${journey.difficulty==="Medium"?"selected":""}>Medium</option>
        <option value="Hard" ${journey.difficulty==="Hard"?"selected":""}>Hard</option>
      </select>
    </div>
    <div style="margin-bottom:8px;">
      <label><strong>Priority:</strong></label>
      <select id="edit-priority">
        <option value="Critical" ${journey.priority==="Critical"?"selected":""}>Critical</option>
        <option value="Important" ${journey.priority==="Important"?"selected":""}>Important</option>
        <option value="Next" ${journey.priority==="Next"?"selected":""}>Next</option>
        <option value="Sometime Maybe" ${journey.priority==="Sometime Maybe"?"selected":""}>Sometime Maybe</option>
      </select>
    </div>
    <div style="margin-bottom:8px;">
      <label><strong>Schedule:</strong></label>
      <span>${scheduleInfo}</span>
    </div>
  `;
  detailsContainer.appendChild(infoDiv);

  infoDiv.querySelector("#edit-difficulty").addEventListener("change", async (e) => {
    journey.difficulty = e.target.value;
    console.log(`Difficulty for "${journey.title}" changed to ${journey.difficulty}.`);
    await saveCallback(journeyData);
    refreshTimelineCallback();
    renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
  });
  infoDiv.querySelector("#edit-priority").addEventListener("change", async (e) => {
    journey.priority = e.target.value;
    console.log(`Priority for "${journey.title}" changed to ${journey.priority}.`);
    await saveCallback(journeyData);
    refreshTimelineCallback();
    renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
  });

  // Podio/Zoho link editing (for top-level journeys).
  if (!journey.parentId) {
    const linkEditorBtn = document.createElement("button");
    linkEditorBtn.classList.add("btn");
    linkEditorBtn.style.fontSize = "0.9rem";
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
      <button id="save-links-btn" class="btn" style="font-size:0.9rem;">Save Links</button>
    `;
    detailsContainer.appendChild(linkEditorDiv);
    linkEditorBtn.addEventListener("click", () => {
      linkEditorDiv.style.display = (linkEditorDiv.style.display === "block") ? "none" : "block";
      console.log("Toggled Podio/Zoho link editor.");
    });
    linkEditorDiv.querySelector("#save-links-btn").addEventListener("click", async () => {
      journey.podioLink = linkEditorDiv.querySelector("#podio-input").value.trim();
      journey.zohoLink = linkEditorDiv.querySelector("#zoho-input").value.trim();
      console.log(`Saved links for "${journey.title}".`);
      await saveCallback(journeyData);
      linkEditorDiv.style.display = "none";
      renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
    });
    if (journey.podioLink || journey.zohoLink) {
      const linkDiv = document.createElement("div");
      linkDiv.style.fontSize = "0.9rem";
      linkDiv.classList.add("podio-zoho-links");
      if (journey.podioLink) linkDiv.innerHTML += `<a href="${journey.podioLink}" target="_blank">Podio</a> `;
      if (journey.zohoLink) linkDiv.innerHTML += `<a href="${journey.zohoLink}" target="_blank">Zoho</a>`;
      detailsContainer.appendChild(linkDiv);
    }
  }

  // Note editing.
  const noteP = document.createElement("p");
  noteP.innerHTML = `<strong>Note:</strong> <span id="note-display">${journey.note || ""}</span>`;
  detailsContainer.appendChild(noteP);
  const editNoteBtn = document.createElement("button");
  editNoteBtn.classList.add("btn");
  editNoteBtn.style.fontSize = "0.9rem";
  editNoteBtn.textContent = "Edit Note";
  detailsContainer.appendChild(editNoteBtn);
  const noteInput = document.createElement("input");
  noteInput.classList.add("edit-note");
  noteInput.value = journey.note || "";
  detailsContainer.appendChild(noteInput);
  editNoteBtn.addEventListener("click", () => {
    noteInput.style.display = "block";
    noteInput.focus();
    console.log("Note editing activated.");
  });
  noteInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      journey.note = noteInput.value.trim();
      console.log(`Note for "${journey.title}" updated to: ${journey.note}`);
      await saveCallback(journeyData);
      renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
      refreshTimelineCallback();
    }
  });

  // Render Gantt chart.
  const ganttDiv = document.createElement("div");
  ganttDiv.innerHTML = renderGantt(journey);
  detailsContainer.appendChild(ganttDiv);
  bindApprovalCheckboxes(journey);
  console.log(`Gantt chart rendered for "${journey.title}".`);

  // --- Subjourney Management Section ---
  const subContainer = document.createElement("div");
  subContainer.classList.add("subjourneys-container");
  subContainer.innerHTML = "<h3>Subjourneys</h3>";

  // Add Subjourney Form & Toggle Button.
  const addSubBtn = document.createElement("button");
  addSubBtn.classList.add("btn");
  addSubBtn.style.fontSize = "0.9rem";
  addSubBtn.textContent = "Add Subjourney";
  subContainer.appendChild(addSubBtn);
  const subForm = document.createElement("div");
  subForm.style.display = "none";
  subForm.innerHTML = `
    <input type="text" id="subjourney-title" placeholder="Subjourney Title" />
    <select id="subjourney-difficulty">
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </select>
    <select id="subjourney-priority">
      <option value="Critical">Critical</option>
      <option value="Important">Important</option>
      <option value="Next" selected>Next</option>
      <option value="Sometime Maybe">Sometime Maybe</option>
    </select>
    <input type="text" id="subjourney-note" placeholder="Subjourney Note" />
    <input type="text" id="subjourney-podio" placeholder="Podio Link (optional)" />
    <input type="text" id="subjourney-zoho" placeholder="Zoho Link (optional)" />
    <button id="save-subjourney-btn" class="btn" style="font-size:0.9rem;">Save Subjourney</button>
    <button id="cancel-subjourney-btn" class="btn btn-cancel" style="font-size:0.9rem;">Cancel</button>
  `;
  subContainer.appendChild(subForm);
  addSubBtn.addEventListener("click", () => {
    subForm.style.display = (subForm.style.display === "none") ? "block" : "none";
    console.log("Toggled subjourney add form.");
  });
  subForm.querySelector("#cancel-subjourney-btn").addEventListener("click", () => {
    subForm.style.display = "none";
    console.log("Subjourney addition cancelled.");
  });
  subForm.querySelector("#save-subjourney-btn").addEventListener("click", async () => {
    const title = subForm.querySelector("#subjourney-title").value.trim();
    const difficulty = subForm.querySelector("#subjourney-difficulty").value;
    const priority = subForm.querySelector("#subjourney-priority").value;
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
      priority,
      note,
      podioLink: podio,
      zohoLink: zoho,
      completedDate: null,
      _ganttVisible: false
    };
    if (!journey.subJourneys) journey.subJourneys = [];
    journey.subJourneys.push(newSub);
    console.log(`Added subjourney "${title}" to "${journey.title}".`);
    // Sort after addition.
    sortSubjourneys(journey);
    await saveCallback(journeyData);
    subForm.style.display = "none";
    renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
  });

  // Render existing subjourneys.
  if (journey.subJourneys && journey.subJourneys.length > 0) {
    journey.subJourneys.forEach((sub, idx) => {
      const subItem = document.createElement("div");
      let subClass = "";
      if (sub.priority === "Critical") subClass = "sub-critical";
      else if (sub.priority === "Important") subClass = "sub-important";
      else if (sub.priority === "Next") subClass = "sub-next";
      else if (sub.priority === "Sometime Maybe") subClass = "sub-sometime";
      subItem.classList.add("subjourney-item", subClass);
      if (!sub.completedDate) subItem.setAttribute("draggable", "true");
      subItem.style.marginBottom = "10px";
      
      // Updated innerHTML: add drag-grip icon before the title.
      subItem.innerHTML = `
        <span class="drag-grip" title="Drag to reorder">⋮⋮</span>
        <strong>${sub.title}</strong>
        <span style="font-size:0.85rem;">[${sub.difficulty} | ${sub.priority}]</span>
        <br><em>Note:</em> <span class="sub-note-display">${sub.note}</span>
        <br>
        <div style="margin-top:4px;">
          <button class="btn edit-sub" style="font-size:0.8rem;">Edit</button>
          <button class="btn delete-sub" data-index="${idx}" style="font-size:0.8rem;">Delete</button>
          <button class="btn complete-sub" style="font-size:0.8rem;">Mark Complete</button>
          <button class="btn toggle-sub-gantt" title="Toggle Gantt" style="font-size:0.8rem;">${sub._ganttVisible ? "▲" : "▼"}</button>
        </div>
        <div class="sub-links" style="font-size:0.8rem;"></div>
        <div class="sub-gantt" style="display: ${sub._ganttVisible ? "block" : "none"};">${renderGantt(sub)}</div>
        <div class="edit-sub-form" style="display:none; margin-top:4px;">
          <input type="text" class="edit-sub-title" value="${sub.title}" />
          <select class="edit-sub-difficulty">
            <option value="Easy" ${sub.difficulty==="Easy"?"selected":""}>Easy</option>
            <option value="Medium" ${sub.difficulty==="Medium"?"selected":""}>Medium</option>
            <option value="Hard" ${sub.difficulty==="Hard"?"selected":""}>Hard</option>
          </select>
          <select class="edit-sub-priority">
            <option value="Critical" ${sub.priority==="Critical"?"selected":""}>Critical</option>
            <option value="Important" ${sub.priority==="Important"?"selected":""}>Important</option>
            <option value="Next" ${sub.priority==="Next"?"selected":""}>Next</option>
            <option value="Sometime Maybe" ${sub.priority==="Sometime Maybe"?"selected":""}>Sometime Maybe</option>
          </select>
          <input type="text" class="edit-sub-note" value="${sub.note}" placeholder="Subjourney Note" />
          <input type="text" class="edit-sub-podio" value="${sub.podioLink||""}" placeholder="Podio Link" />
          <input type="text" class="edit-sub-zoho" value="${sub.zohoLink||""}" placeholder="Zoho Link" />
          <button class="btn save-sub-edit" style="font-size:0.8rem;">Save</button>
          <button class="btn cancel-sub-edit btn-cancel" style="font-size:0.8rem;">Cancel</button>
        </div>
      `;

      const subLinksDiv = subItem.querySelector(".sub-links");
      if (sub.podioLink) subLinksDiv.innerHTML += `<a href="${sub.podioLink}" target="_blank">Podio</a> `;
      if (sub.zohoLink) subLinksDiv.innerHTML += `<a href="${sub.zohoLink}" target="_blank">Zoho</a>`;

      // Drag-and-drop for subjourneys.
      subItem.addEventListener("dragstart", (e) => {
        if (sub.completedDate) {
          e.preventDefault();
          return;
        }
        subItem.classList.add("dragging");
        e.dataTransfer.setData("text/plain", idx);
        console.log(`Started dragging subjourney "${sub.title}".`);
      });
      subItem.addEventListener("dragover", (e) => {
        e.preventDefault();
        subItem.classList.add("drop-target");
      });
      subItem.addEventListener("dragleave", () => {
        subItem.classList.remove("drop-target");
      });
      subItem.addEventListener("drop", async (e) => {
        e.preventDefault();
        subItem.classList.remove("drop-target");
        const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
        const toIdx = idx;
        if (fromIdx === toIdx) return;
        const movedSub = journey.subJourneys[fromIdx];
        if (movedSub.completedDate) {
          console.log(`Subjourney "${movedSub.title}" is completed and immovable.`);
          return;
        }
        const [movedSubArr] = journey.subJourneys.splice(fromIdx, 1);
        journey.subJourneys.splice(toIdx, 0, movedSubArr);
        
        // Determine new priority based on drop position:
        let newPriority;
        if (toIdx === 0) {
          newPriority = "Critical";
        } else if (toIdx === journey.subJourneys.length - 1) {
          newPriority = "Sometime Maybe";
        } else {
          if (subItem.classList.contains("sub-critical")) {
            newPriority = "Critical";
          } else if (subItem.classList.contains("sub-important")) {
            newPriority = "Important";
          } else if (subItem.classList.contains("sub-next")) {
            newPriority = "Next";
          } else if (subItem.classList.contains("sub-sometime")) {
            newPriority = "Sometime Maybe";
          } else {
            newPriority = movedSubArr.priority;
          }
        }
        movedSubArr.priority = newPriority;
        console.log(`Reordered subjourney "${movedSubArr.title}" from ${fromIdx} to ${toIdx} with new priority ${movedSubArr.priority}.`);
        
        // Self-sort subjourneys by priority (preserving manual order within each group).
        sortSubjourneys(journey);
        await saveCallback(journeyData);
        renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
      });
      subItem.addEventListener("dragend", () => {
        subItem.classList.remove("dragging");
      });
      
      // Delete subjourney.
      subItem.querySelector(".delete-sub").addEventListener("click", async () => {
        if (confirm("Delete this subjourney?")) {
          journey.subJourneys.splice(idx, 1);
          console.log(`Deleted subjourney "${sub.title}".`);
          await saveCallback(journeyData);
          renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
        }
      });
      
      // Toggle edit form.
      subItem.querySelector(".edit-sub").addEventListener("click", () => {
        const form = subItem.querySelector(".edit-sub-form");
        form.style.display = (form.style.display === "none") ? "block" : "none";
        console.log(`Toggled edit form for subjourney "${sub.title}".`);
      });
      
      // Bind toggle for subjourney Gantt collapse/uncollapse.
      const toggleGanttBtn = subItem.querySelector(".toggle-sub-gantt");
      toggleGanttBtn.addEventListener("click", async () => {
        sub._ganttVisible = !sub._ganttVisible;
        console.log(`Toggled Gantt for subjourney "${sub.title}" to ${sub._ganttVisible}.`);
        await saveCallback(journeyData);
        renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
      });
      
      // Save subjourney edits.
      subItem.querySelector(".save-sub-edit").addEventListener("click", async () => {
        const newTitle = subItem.querySelector(".edit-sub-title").value.trim();
        const newDiff = subItem.querySelector(".edit-sub-difficulty").value;
        const newPriority = subItem.querySelector(".edit-sub-priority").value;
        const newNote = subItem.querySelector(".edit-sub-note").value.trim();
        const newPodio = subItem.querySelector(".edit-sub-podio").value.trim();
        const newZoho = subItem.querySelector(".edit-sub-zoho").value.trim();
        if (!newTitle) {
          alert("Title required.");
          return;
        }
        sub.title = newTitle;
        sub.difficulty = newDiff;
        sub.priority = newPriority;
        sub.note = newNote;
        sub.podioLink = newPodio;
        sub.zohoLink = newZoho;
        console.log(`Updated subjourney "${newTitle}".`);
        // Self-sort after editing priority.
        sortSubjourneys(journey);
        await saveCallback(journeyData);
        renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
      });
      
      // Cancel subjourney edit.
      subItem.querySelector(".cancel-sub-edit").addEventListener("click", () => {
        subItem.querySelector(".edit-sub-form").style.display = "none";
        console.log(`Cancelled edit for subjourney "${sub.title}".`);
      });
      
      subContainer.appendChild(subItem);
    });
  }
  detailsContainer.appendChild(subContainer);
  console.log(`Subjourney section rendered for "${journey.title}".`);
}
