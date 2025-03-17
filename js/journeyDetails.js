/**
 * journeyDetails.js
 *
 * Renders the detailed view for a journey.
 * Displays title, dropdowns for difficulty and priority (without duplicate text),
 * schedule information (formatted as "Monday, March 2"), slick Podio/Zoho link editing,
 * note editing, and a repositioned "Mark as Complete" button in the top right.
 * Also manages subjourneys – which are draggable, allow editing of difficulty/priority,
 * display their links if set, and can be marked complete.
 *
 * Exports:
 *   renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback)
 */

import { renderGantt, bindApprovalCheckboxes } from "./gantt.js";
import { toYMD, parseDate } from "./scheduler.js";

export function renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback) {
  const detailsContainer = document.getElementById("details-container");
  detailsContainer.innerHTML = "";
  console.log(`Rendering details for journey: ${journey.title}`);

  // Container for header elements (title and complete button)
  const headerDiv = document.createElement("div");
  headerDiv.style.position = "relative";
  headerDiv.classList.add("journey-header");
  headerDiv.innerHTML = `<h2>${journey.title}</h2>`;
  detailsContainer.appendChild(headerDiv);

  // "Mark as Complete" button positioned in the top right
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

  // Editable dropdowns for difficulty and priority.
  const infoDiv = document.createElement("div");
  infoDiv.style.marginBottom = "8px";
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
      <span>${journey.startDate ? new Date(journey.startDate).toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" }) : "(unscheduled)"}</span>
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

  // Podio/Zoho links (for top-level journeys).
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

  // Extra schedule info.
  if (journey.startDate && journey.endDate) {
    const duration = Math.ceil((new Date(journey.endDate) - new Date(journey.startDate) + 1) / (24 * 3600 * 1000));
    const extraInfo = document.createElement("p");
    extraInfo.innerHTML = `<strong>Duration:</strong> ${duration} days`;
    detailsContainer.appendChild(extraInfo);
  }

  // --- Subjourney Management ---
  const subContainer = document.createElement("div");
  subContainer.classList.add("subjourneys-container");
  subContainer.innerHTML = "<h3>Subjourneys</h3>";

  // Add Subjourney Form & Button.
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
      subItem.setAttribute("draggable", "true");
      subItem.style.marginBottom = "10px";
      subItem.innerHTML = `
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
      // Render links for subjourney if set.
      const subLinksDiv = subItem.querySelector(".sub-links");
      if (sub.podioLink) subLinksDiv.innerHTML += `<a href="${sub.podioLink}" target="_blank">Podio</a> `;
      if (sub.zohoLink) subLinksDiv.innerHTML += `<a href="${sub.zohoLink}" target="_blank">Zoho</a>`;
      
      // Drag-and-drop reordering.
      subItem.addEventListener("dragstart", (e) => {
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
        const [movedSub] = journey.subJourneys.splice(fromIdx, 1);
        journey.subJourneys.splice(toIdx, 0, movedSub);
        console.log(`Reordered subjourney "${movedSub.title}" from ${fromIdx} to ${toIdx}.`);
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
        await saveCallback(journeyData);
        renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
      });
      subItem.querySelector(".cancel-sub-edit").addEventListener("click", () => {
        subItem.querySelector(".edit-sub-form").style.display = "none";
        console.log(`Cancelled edit for subjourney "${sub.title}".`);
      });
      // Mark subjourney as complete.
      subItem.querySelector(".complete-sub").addEventListener("click", async () => {
        if (!sub.completedDate) {
          const defaultDate = toYMD(new Date());
          const userDate = prompt("Enter completion date for subjourney (YYYY-MM-DD):", defaultDate);
          if (!userDate) return;
          const compDate = parseDate(userDate);
          if (isNaN(compDate.getTime())) {
            alert("Invalid date.");
            return;
          }
          sub.completedDate = compDate;
          console.log(`Subjourney "${sub.title}" marked complete on ${toYMD(compDate)}.`);
          await saveCallback(journeyData);
          renderJourneyDetails(journey, journeyData, saveCallback, refreshTimelineCallback);
        } else {
          alert("Subjourney already marked complete.");
        }
      });
      // Toggle Gantt chart using an icon.
      subItem.querySelector(".toggle-sub-gantt").addEventListener("click", () => {
        const subGanttDiv = subItem.querySelector(".sub-gantt");
        const btn = subItem.querySelector(".toggle-sub-gantt");
        if (subGanttDiv.style.display === "none") {
          subGanttDiv.style.display = "block";
          btn.textContent = "▲";
          sub._ganttVisible = true;
        } else {
          subGanttDiv.style.display = "none";
          btn.textContent = "▼";
          sub._ganttVisible = false;
        }
        console.log(`Toggled Gantt for subjourney "${sub.title}".`);
      });
      subContainer.appendChild(subItem);
    });
  }
  detailsContainer.appendChild(subContainer);
  console.log(`Subjourney section rendered for "${journey.title}".`);
}
