// src/services/gantt.js
import { addDays, toYMD, getCalendarWeek, getHolidays } from "./scheduler";

const baseTaskRows = [
  { name: "Diagram Building", startWeek: 1, endWeek: 1, dependencies: [], isApproval: false },
  { name: "Content Creation", startWeek: 1, endWeek: 1, dependencies: [], isApproval: false },
  { name: "Creative Development", startWeek: 1, endWeek: 1, dependencies: [], isApproval: false },
  { name: "PM Approval", startWeek: 2, endWeek: 2, dependencies: [], isApproval: true },
  { name: "Final Template Revision", startWeek: 4, endWeek: 4, dependencies: [], isApproval: false }
];

function getTaskRowsForJourney(journey) {
  const cloned = JSON.parse(JSON.stringify(baseTaskRows));
  let totalWeeks = 4;
  const diff = journey.difficulty ? journey.difficulty : "Easy";
  if (diff === "Medium") totalWeeks = 6;
  else if (diff === "Hard") totalWeeks = 8;
  const factor = totalWeeks / 4;
  cloned.forEach(task => {
    if (!task.isApproval) {
      task.startWeek = Math.ceil(task.startWeek * factor);
      task.endWeek = Math.ceil(task.endWeek * factor);
    }
  });
  return cloned;
}

export function renderGantt(journey, baseOverride = null) {
  let baseDate = baseOverride 
      ? new Date(baseOverride) 
      : (journey.scheduledStartDate ? new Date(journey.scheduledStartDate) : new Date());
  let totalWeeks = 4;
  const diff = journey.difficulty ? journey.difficulty : "Easy";
  if (diff === "Medium") totalWeeks = 6;
  else if (diff === "Hard") totalWeeks = 8;

  let html = `<div class="gantt-container">
    <table class="gantt-table">
      <thead>
        <tr><th>Task</th>`;
  for (let w = 1; w <= totalWeeks; w++) {
    const weekStart = addDays(baseDate, (w - 1) * 7);
    const weekNum = getCalendarWeek(weekStart);
    const yearSuffix = String(weekStart.getFullYear()).slice(-2);
    html += `<th>W${weekNum}<sup>${yearSuffix}</sup></th>`;
  }
  html += `</tr></thead><tbody>`;
  const rows = getTaskRowsForJourney(journey);
  rows.forEach((row, idx) => {
    html += `<tr>`;
    html += `<td>${row.isApproval ? `<label><input type="checkbox" class="approval-checkbox" data-task-index="${idx}" ${row.approvedOn ? "checked disabled" : ""}/> ${row.name}</label>` : row.name}`;
    if (row.dependencies && row.dependencies.length > 0) {
      html += `<br><small>depends on: ${row.dependencies.join(", ")}</small>`;
    }
    html += `</td>`;
    for (let w = 1; w <= totalWeeks; w++) {
      let cellClass = "";
      if (w >= row.startWeek && w <= row.endWeek) cellClass = "gantt-active";
      let weekStart = addDays(baseDate, (w - 1) * 7);
      let weekEnd = addDays(weekStart, 6);
      let holidaysThisWeek = getHolidays().filter(h => {
        let hDate = new Date(h.date);
        return hDate >= weekStart && hDate <= weekEnd;
      });
      let tooltip = "";
      if (holidaysThisWeek.length === 7) {
        cellClass = "gantt-holiday-full";
      } else if (holidaysThisWeek.length > 0) {
        cellClass += " gantt-holiday";
        tooltip = holidaysThisWeek.map(h => `${h.date} - ${h.name}`).join(", ");
      }
      // Highlight current week.
      const today = new Date();
      const oneWeekMs = 7 * 24 * 3600 * 1000;
      const weekIndex = Math.floor((today - baseDate) / oneWeekMs) + 1;
      if (weekIndex === w && cellClass.includes("gantt-active")) {
        cellClass += " gantt-current";
      }
      html += `<td class="${cellClass}" ${tooltip ? 'title="'+tooltip+'"' : ''}></td>`;
    }
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;
  console.log(`Rendered Gantt chart for "${journey.title}".`);
  return html;
}

export function bindApprovalCheckboxes(journey) {
  const container = document.querySelector(".gantt-container");
  if (!container) return;
  const checkboxes = container.querySelectorAll(".approval-checkbox");
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        const nowStr = new Date().toLocaleString();
        const taskIndex = checkbox.getAttribute("data-task-index");
        const rows = getTaskRowsForJourney(journey);
        if (rows && rows[taskIndex]) {
          rows[taskIndex].approvedOn = nowStr;
        }
        const span = checkbox.parentElement.nextElementSibling || checkbox.parentElement.querySelector(".approval-timestamp");
        if (span) {
          span.textContent = `Approved on ${nowStr}`;
          span.classList.add("completed");
          span.style.display = "inline";
        }
        checkbox.disabled = true;
        console.log(`Task "${rows[taskIndex].name}" approved at ${nowStr}.`);
      }
    });
  });
}
