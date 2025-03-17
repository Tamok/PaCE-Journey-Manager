/* main.js */
(function(){

    /* --- Utility Functions --- */
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
      const day = date.getDay();
      return (day === 0 || day === 6);
    }
    function isHoliday(date) {
      return !!holidayRanges.find(h => {
        const start = parseDate(h.start);
        const end = parseDate(h.end);
        return date >= start && date <= end;
      });
    }
    function getHolidayName(date) {
      const match = holidayRanges.find(h => {
        const start = parseDate(h.start);
        const end = parseDate(h.end);
        return date >= start && date <= end;
      });
      return match ? match.name : "";
    }
    function getNextBusinessDay(date) {
      let d = new Date(date);
      while(isWeekend(d) || isHoliday(d)) {
        d = addDays(d, 1);
      }
      return d;
    }
    function getPreviousBusinessDay(date) {
      let d = new Date(date);
      while(isWeekend(d) || isHoliday(d)) {
        d = addDays(d, -1);
      }
      return d;
    }
    function getDuration(difficulty) {
      if(difficulty === "easy") return 30;
      if(difficulty === "medium") return 45;
      if(difficulty === "hard") return 60;
      return 30;
    }
  
    /* --- Priority Sorting --- */
    const priorityOrder = {
      "Priority": 1,
      "Important": 2,
      "Next": 3,
      "Sometime Maybe": 4,
      "Child": 5 // subjourneys appear last in their group unless manually re-labeled
    };
  
    function sortJourneys() {
      // 1) Sort by priority group
      // 2) Among Priority, sort by priorityNumber ascending
      journeyData.sort((a, b) => {
        const pa = priorityOrder[a.priority] || 99;
        const pb = priorityOrder[b.priority] || 99;
        if(pa !== pb) {
          return pa - pb;
        }
        // If both are "Priority," compare priorityNumber
        if(pa === 1) {
          const na = a.priorityNumber || 9999;
          const nb = b.priorityNumber || 9999;
          return na - nb;
        }
        return 0;
      });
    }
  
    /* --- Scheduling Journeys (base start date) --- */
    const BASE_START_DATE = new Date("2025-03-03");
  
    function scheduleJourneys() {
      sortJourneys();
      let currentDate = getNextBusinessDay(BASE_START_DATE);
      journeyData.forEach(j => {
        if(j.completedDate) {
          // If user marked entire journey completed early
          j.startDate = getNextBusinessDay(currentDate);
          j.endDate = new Date(j.completedDate);
          if(j.endDate < j.startDate) {
            j.startDate = new Date(j.endDate);
          }
        } else {
          j.startDate = getNextBusinessDay(currentDate);
          const dur = getDuration(j.difficulty);
          let end = addDays(j.startDate, dur - 1);
          if(isWeekend(end) || isHoliday(end)) {
            end = getPreviousBusinessDay(end);
          }
          j.endDate = end;
        }
        currentDate = addDays(j.endDate, 1);
      });
    }
  
    /* DOM References */
    const timelineContainer = document.getElementById("timeline-container");
    const detailsContainer = document.getElementById("details-container");
    const addJourneyBtn = document.getElementById("add-journey-btn");
    const addJourneyForm = document.getElementById("add-journey-form");
    const saveNewJourneyBtn = document.getElementById("save-new-journey");
    const cancelNewJourneyBtn = document.getElementById("cancel-new-journey");
  
    /* --- Render Timeline (Single Row) --- */
    let dragSrcEl = null;
  
    function renderTimeline() {
      scheduleJourneys();
      timelineContainer.innerHTML = "";
      journeyData.forEach((j, index) => {
        const item = document.createElement("div");
        item.classList.add("timeline-item");
  
        // Priority accent
        const p = j.priority;
        if(p === "Priority") item.classList.add("priority");
        else if(p === "Important") item.classList.add("important");
        else if(p === "Next") item.classList.add("next");
        else if(p === "Sometime Maybe") item.classList.add("maybe");
        else if(p === "Child") item.classList.add("child");
  
        if(j.completedDate) {
          item.classList.add("completed");
        }
  
        item.setAttribute("draggable", "true");
        // If it's "Priority" with a number, remove that number from the displayed title
        const displayTitle = j.title.trim();
        const monthYear = j.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const dateRange = `${toYMD(j.startDate)} – ${toYMD(j.endDate)}`;
        item.innerHTML = `
          <strong>${displayTitle}</strong>
          <span>${monthYear}<br>${dateRange}</span>
        `;
  
        // Click => show details
        item.addEventListener("click", () => {
          document.querySelectorAll(".timeline-item").forEach(el => el.classList.remove("active"));
          item.classList.add("active");
          renderDetails(index);
        });
  
        // Drag events
        item.addEventListener("dragstart", e => {
          dragSrcEl = item;
          e.dataTransfer.effectAllowed = "move";
        });
        item.addEventListener("dragover", e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          item.classList.add("drop-target");
        });
        item.addEventListener("dragleave", e => {
          item.classList.remove("drop-target");
        });
        item.addEventListener("drop", e => {
          e.stopPropagation();
          item.classList.remove("drop-target");
          if(dragSrcEl !== item) {
            const fromIndex = [...timelineContainer.children].indexOf(dragSrcEl);
            const toIndex = [...timelineContainer.children].indexOf(item);
            const [moved] = journeyData.splice(fromIndex, 1);
            journeyData.splice(toIndex, 0, moved);
            renderTimeline();
            item.classList.add("active");
            renderDetails(toIndex);
          }
        });
        item.addEventListener("dragend", () => {
          document.querySelectorAll(".timeline-item").forEach(el => el.classList.remove("drop-target"));
        });
  
        timelineContainer.appendChild(item);
      });
    }
  
    /* --- Multi-Row Gantt with Tasks & Approvals (timestamp) --- */
    // For each journey, we adapt the baseTaskRows for easy/medium/hard:
    // - easy => 4 weeks
    // - medium => 6 weeks
    // - hard => 8 weeks
    // We create a table row for each task, highlight columns for that task’s time range.
  
    function getTaskRowsForJourney(journey) {
      if(!journey.taskRows) {
        // create a copy of baseTaskRows
        const cloned = JSON.parse(JSON.stringify(baseTaskRows));
        // if medium => extend to week 6
        if(journey.difficulty === "medium") {
          // We'll just shift "Final Template Revision" + "Project Wrap-Up" from week 4 to 6
          cloned.forEach(task => {
            if(task.startWeek === 4) {
              task.startWeek = 5;
              task.endWeek = 5;
            }
          });
          // Add 1 more row for week6
          cloned.push({
            name: "Extended QA & Wrap-Up",
            startWeek: 6,
            endWeek: 6,
            dependencies: [],
            isApproval: false
          });
        } else if(journey.difficulty === "hard") {
          // push tasks out to week 8
          cloned.forEach(task => {
            if(task.startWeek === 3) {
              task.endWeek = 3;
            }
            if(task.startWeek === 4) {
              task.startWeek = 7;
              task.endWeek = 7;
            }
          });
          cloned.push({
            name: "Additional Hard Journey QA",
            startWeek: 5,
            endWeek: 6,
            dependencies: [],
            isApproval: false
          });
          cloned.push({
            name: "Extended Approvals (if needed)",
            startWeek: 5,
            endWeek: 6,
            dependencies: [],
            isApproval: true
          });
          cloned.push({
            name: "Pre-Final Wrap-Up",
            startWeek: 6,
            endWeek: 6,
            dependencies: [],
            isApproval: false
          });
          cloned.push({
            name: "Final Wrap-Up",
            startWeek: 8,
            endWeek: 8,
            dependencies: [],
            isApproval: false
          });
        }
        journey.taskRows = cloned;
      }
      return journey.taskRows;
    }
  
    function renderGantt(journey) {
      const today = new Date();
      let totalWeeks = 4;
      if(journey.difficulty === "medium") totalWeeks = 6;
      if(journey.difficulty === "hard") totalWeeks = 8;
  
      // Build table headers
      let html = `<div class="gantt-container">
      <table class="gantt-table">
        <thead>
          <tr>
            <th class="task-row-name">Task</th>`;
      for(let w=1; w<=totalWeeks; w++){
        html += `<th>Week ${w}</th>`;
      }
      html += `</tr></thead><tbody>`;
  
      // For each row in the journey’s tasks, we highlight columns [startWeek..endWeek]
      const rows = getTaskRowsForJourney(journey);
      rows.forEach(row => {
        html += `<tr>`;
        // Row name + checkboxes if it's an approval
        html += `<td class="task-row-name">`;
        // If approval, we show a checkbox that timestamps when checked
        if(row.isApproval) {
          // We'll store the timestamp in row.approvedOn if user checks it
          const timeStamp = row.approvedOn ? `<span class="approval-timestamp completed">Approved on ${row.approvedOn}</span>` : 
                                             `<span class="approval-timestamp" style="display:none;"></span>`;
          html += `
            <label>
              <input type="checkbox" class="approval-checkbox" ${row.approvedOn ? "checked disabled" : ""} />
              ${row.name}
            </label>
            ${timeStamp}
          `;
        } else {
          html += `${row.name}`;
        }
        // If dependencies exist, display them
        if(row.dependencies && row.dependencies.length) {
          html += `<br><small>depends on: ${row.dependencies.join(", ")}</small>`;
        }
        html += `</td>`;
  
        // Now the weekly columns
        for(let w=1; w<=totalWeeks; w++){
          if(w >= row.startWeek && w <= row.endWeek) {
            // Mark if this is "current week"
            // Rough approach: if journey started X days ago, we see how many days to each "week"
            // We'll keep it simple: if the user is currently in that week, highlight with .gantt-current
            let cellClass = "gantt-active";
            // For holiday highlight, let's skip here because we don't know day-level within the week
            // We'll keep the holiday highlight for day-level Gantt. 
            // If you want, you could do further checks. For now we only do .gantt-active.
  
            // Check if "today" falls in [startWeek..endWeek], we guess if w is the "current" week
            const startOfJourney = journey.startDate; 
            const oneWeekMs = 7*24*3600*1000;
            // approximate "week index" since journey start
            const weekIndex = Math.floor((today - startOfJourney)/oneWeekMs) + 1;
            if(weekIndex === w) {
              cellClass += " gantt-current";
            }
            html += `<td class="${cellClass}"></td>`;
          } else {
            html += `<td></td>`;
          }
        }
        html += `</tr>`;
      });
  
      html += `</tbody></table></div>`;
      return html;
    }
  
    /* --- Render Details --- */
    function renderDetails(index) {
      const j = journeyData[index];
      detailsContainer.innerHTML = "";
  
      // Title & schedule
      const titleDiv = document.createElement("div");
      titleDiv.classList.add("journey-title");
      titleDiv.innerHTML = `<h2>${j.title}</h2>`;
      detailsContainer.appendChild(titleDiv);
  
      // Priority dropdown
      const priorityDiv = document.createElement("div");
      priorityDiv.innerHTML = `
        <label>Priority:
          <select id="journey-priority-select">
            <option value="Priority">Priority</option>
            <option value="Important">Important</option>
            <option value="Next">Next</option>
            <option value="Sometime Maybe">Sometime Maybe</option>
            <option value="Child">No Priority (Subjourney)</option>
          </select>
        </label>
        <label>Priority Number (if Priority):
          <input type="number" id="journey-priority-number" style="width:70px;" />
        </label>
      `;
      detailsContainer.appendChild(priorityDiv);
      const prioritySelect = priorityDiv.querySelector("#journey-priority-select");
      const priorityNumberInput = priorityDiv.querySelector("#journey-priority-number");
      prioritySelect.value = j.priority || "Child";
      priorityNumberInput.value = j.priorityNumber || "";
  
      prioritySelect.addEventListener("change", () => {
        j.priority = prioritySelect.value;
        if(j.priority !== "Priority") {
          j.priorityNumber = undefined;
        }
        // re-sort
        const oldIndex = index;
        const removed = journeyData.splice(oldIndex, 1)[0];
        journeyData.push(removed);
        renderTimeline();
        renderDetails(journeyData.length - 1);
      });
      priorityNumberInput.addEventListener("change", () => {
        if(j.priority === "Priority") {
          j.priorityNumber = parseInt(priorityNumberInput.value, 10) || undefined;
          renderTimeline();
          const newIndex = journeyData.indexOf(j);
          renderDetails(newIndex);
        }
      });
  
      // Date info
      const dateP = document.createElement("p");
      const startStr = j.startDate ? j.startDate.toDateString() : "(unscheduled)";
      const endStr = j.endDate ? j.endDate.toDateString() : "(unscheduled)";
      dateP.innerHTML = `<strong>Schedule:</strong> ${startStr} – ${endStr}`;
      detailsContainer.appendChild(dateP);
  
      // Edit Podio/Zoho (only if not "Child")
      if(j.priority !== "Child") {
        const linkEditorBtn = document.createElement("button");
        linkEditorBtn.classList.add("btn");
        linkEditorBtn.textContent = "Edit Podio/Zoho Links";
        detailsContainer.appendChild(linkEditorBtn);
  
        const linksEditor = document.createElement("div");
        linksEditor.id = "links-editor";
        linksEditor.innerHTML = `
          <label>Podio Link: 
            <input type="text" id="podio-input" value="${j.podioLink || ""}" />
          </label>
          <label>Zoho Link: 
            <input type="text" id="zoho-input" value="${j.zohoLink || ""}" />
          </label>
          <button id="save-links" class="btn">Save Links</button>
        `;
        detailsContainer.appendChild(linksEditor);
  
        linkEditorBtn.addEventListener("click", () => {
          linksEditor.style.display = (linksEditor.style.display === "block") ? "none" : "block";
        });
        linksEditor.querySelector("#save-links").addEventListener("click", () => {
          j.podioLink = linksEditor.querySelector("#podio-input").value.trim();
          j.zohoLink = linksEditor.querySelector("#zoho-input").value.trim();
          linksEditor.style.display = "none";
          renderDetails(index);
        });
  
        // If links exist, show them
        if(j.podioLink || j.zohoLink) {
          const linkDiv = document.createElement("div");
          linkDiv.classList.add("podio-zoho-links");
          if(j.podioLink) {
            linkDiv.innerHTML += `<a href="${j.podioLink}" target="_blank">Podio</a> `;
          }
          if(j.zohoLink) {
            linkDiv.innerHTML += `<a href="${j.zohoLink}" target="_blank">Zoho</a>`;
          }
          detailsContainer.appendChild(linkDiv);
        }
      }
  
      // Note
      const noteP = document.createElement("p");
      noteP.innerHTML = `<strong>Note:</strong> <span id="note-display">${j.note}</span>`;
      detailsContainer.appendChild(noteP);
  
      // Mark as complete (if not completed)
      if(!j.completedDate) {
        const completeBtn = document.createElement("button");
        completeBtn.classList.add("btn");
        completeBtn.textContent = "Mark as Complete";
        completeBtn.addEventListener("click", () => {
          const userDateStr = prompt("Enter completion date (YYYY-MM-DD):", toYMD(new Date()));
          if(!userDateStr) return;
          const compDate = parseDate(userDateStr);
          if(isNaN(compDate.getTime())) {
            alert("Invalid date.");
            return;
          }
          j.completedDate = compDate;
          renderTimeline();
          renderDetails(index);
        });
        detailsContainer.appendChild(completeBtn);
      }
  
      // Edit note button
      const editBtn = document.createElement("button");
      editBtn.classList.add("btn");
      editBtn.textContent = "Edit Note";
      detailsContainer.appendChild(editBtn);
      const noteInput = document.createElement("input");
      noteInput.type = "text";
      noteInput.classList.add("edit-note");
      noteInput.value = j.note;
      detailsContainer.appendChild(noteInput);
      editBtn.addEventListener("click", () => {
        noteInput.style.display = "block";
        noteInput.focus();
      });
      noteInput.addEventListener("keydown", e => {
        if(e.key === "Enter") {
          j.note = noteInput.value.trim();
          renderDetails(index);
          renderTimeline();
        }
      });
  
      // Gantt
      const ganttTitle = document.createElement("h3");
      ganttTitle.textContent = "Weekly Breakdown (Gantt)";
      detailsContainer.appendChild(ganttTitle);
  
      const ganttHTML = renderGantt(j);
      detailsContainer.insertAdjacentHTML("beforeend", ganttHTML);
  
      // Add event listeners for approval checkboxes
      const approvalCheckboxes = detailsContainer.querySelectorAll(".approval-checkbox");
      approvalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", e => {
          if(checkbox.checked) {
            // timestamp it
            const nowStr = new Date().toLocaleString();
            const timeSpan = checkbox.parentElement.nextElementSibling || checkbox.parentElement.querySelector(".approval-timestamp");
            if(timeSpan) {
              timeSpan.textContent = `Approved on ${nowStr}`;
              timeSpan.classList.add("completed");
              timeSpan.style.display = "inline";
            }
            // store it in the row
            const rowName = checkbox.parentElement.innerText.replace(/Approved on.*/, "").trim();
            const rowObj = j.taskRows.find(r => r.name === rowName);
            if(rowObj) {
              rowObj.approvedOn = nowStr;
            }
            checkbox.disabled = true;
          }
        });
      });
  
      // Legend
      const legendDiv = document.createElement("div");
      legendDiv.id = "legend";
      legendDiv.innerHTML = `
        <div class="legend-item"><div class="legend-color priority"></div> Priority</div>
        <div class="legend-item"><div class="legend-color important"></div> Important</div>
        <div class="legend-item"><div class="legend-color next"></div> Next</div>
        <div class="legend-item"><div class="legend-color maybe"></div> Sometime Maybe</div>
        <div class="legend-item"><div class="legend-color child"></div> Subjourney</div>
      `;
      detailsContainer.appendChild(legendDiv);
    }
  
    /* --- Add Journey Logic --- */
    addJourneyBtn.addEventListener("click", () => {
      addJourneyForm.style.display = "block";
    });
    cancelNewJourneyBtn.addEventListener("click", () => {
      addJourneyForm.style.display = "none";
    });
    saveNewJourneyBtn.addEventListener("click", () => {
      const title = document.getElementById("new-journey-title").value.trim();
      const priority = document.getElementById("new-journey-priority").value;
      const priorityNumber = parseInt(document.getElementById("new-journey-number").value, 10) || undefined;
      const difficulty = document.getElementById("new-journey-difficulty").value;
      const note = document.getElementById("new-journey-note").value.trim();
      const podioLink = document.getElementById("new-journey-podio").value.trim();
      const zohoLink = document.getElementById("new-journey-zoho").value.trim();
  
      if(!title) {
        alert("Title is required.");
        return;
      }
      const newJourney = {
        title,
        priority,
        difficulty,
        note
      };
      if(priority === "Priority" && priorityNumber) {
        newJourney.priorityNumber = priorityNumber;
      }
      if(priority !== "Child") {
        newJourney.podioLink = podioLink;
        newJourney.zohoLink = zohoLink;
      }
      journeyData.push(newJourney);
  
      // Clear form
      document.getElementById("new-journey-title").value = "";
      document.getElementById("new-journey-note").value = "";
      document.getElementById("new-journey-podio").value = "";
      document.getElementById("new-journey-zoho").value = "";
      document.getElementById("new-journey-number").value = "";
      addJourneyForm.style.display = "none";
  
      renderTimeline();
    });
  
    /* --- Save/Load Config --- */
    document.getElementById("save-config-btn").addEventListener("click", () => {
      localStorage.setItem("journeyData", JSON.stringify(journeyData));
      alert("Configuration saved locally.");
    });
    document.getElementById("download-config-btn").addEventListener("click", () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(journeyData, null, 2));
      const dlAnchor = document.createElement("a");
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", "journey_configuration.json");
      dlAnchor.click();
    });
  
    // Load from localStorage if present
    (function loadFromStorage(){
      const stored = localStorage.getItem("journeyData");
      if(stored) {
        try {
          const parsed = JSON.parse(stored);
          if(Array.isArray(parsed)) {
            journeyData = parsed;
          }
        } catch(e) {
          console.error("Error parsing stored journey data:", e);
        }
      }
    })();
  
    /* --- Initial Render --- */
    renderTimeline();
    if(timelineContainer.firstChild) {
      timelineContainer.firstChild.classList.add("active");
      renderDetails(0);
    }
  
  })();
  