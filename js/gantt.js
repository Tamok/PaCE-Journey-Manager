/**
 * gantt.js
 *
 * Renders the Gantt chart for a journey and binds approval checkbox events.
 * Non-approval tasks are scaled based on difficulty.
 * Holidays are marked on the chart:
 *  - If an entire week is off, the cell gets the "gantt-holiday-full" class.
 *  - If only part of the week is affected, a tooltip is added with holiday details.
 * The current week (based on today's date) is highlighted on active task cells.
 *
 * Author: Your Name
 * Date: YYYY-MM-DD
 */

import { addDays, toYMD, getHolidays } from "./scheduler.js";

/**
 * Base Task Rows Definition
 */
const baseTaskRows = [
  { name: "Diagram Building", startWeek: 1, endWeek: 1, dependencies: [], isApproval: false },
  { name: "Content Creation", startWeek: 1, endWeek: 1, dependencies: [], isApproval: false },
  { name: "Creative Development", startWeek: 1, endWeek: 1, dependencies: [], isApproval: false },
  { name: "Initial Email Template (Zoho)", startWeek: 1, endWeek: 1, dependencies: ["Creative Development"], isApproval: false },
  { name: "PM Approval", startWeek: 2, endWeek: 2, dependencies: [], isApproval: true },
  { name: "Sheetal Approval", startWeek: 2, endWeek: 2, dependencies: ["PM Approval"], isApproval: true },
  { name: "Paolo Approval", startWeek: 3, endWeek: 3, dependencies: ["Sheetal Approval"], isApproval: true },
  { name: "Denis Approval", startWeek: 3, endWeek: 3, dependencies: ["Paolo Approval"], isApproval: true },
  { name: "Zoho Workflow Building (Diagram)", startWeek: 2, endWeek: 2, dependencies: ["Diagram Building", "PM Approval"], isApproval: false },
  { name: "Email Template Revision (Zoho)", startWeek: 3, endWeek: 3, dependencies: ["Creative Development", "Paolo Approval", "Denis Approval"], isApproval: false },
  { name: "Workflow Linking / Logic", startWeek: 3, endWeek: 3, dependencies: ["Email Template Revision"], isApproval: false },
  { name: "Final Template Revision", startWeek: 4, endWeek: 4, dependencies: ["Denis Approval"], isApproval: false },
  { name: "Project Wrap-Up & Check-In", startWeek: 4, endWeek: 4, dependencies: [], isApproval: false }
];

/**
 * Returns task rows for a journey, adjusted by difficulty.
 * @param {Object} journey - The journey.
 * @returns {Array} Task rows.
 */
function getTaskRowsForJourney(journey) {
  const cloned = JSON.parse(JSON.stringify(baseTaskRows));
  let totalWeeks = 4;
  const diff = journey.difficulty
    ? journey.difficulty.charAt(0).toUpperCase() + journey.difficulty.slice(1).toLowerCase()
    : "Easy";
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

/**
 * Renders the Gantt chart for a journey.
 * @param {Object} journey - The journey.
 * @returns {string} HTML string for the Gantt chart.
 */
export function renderGantt(journey) {
  let totalWeeks = 4;
  const diff = journey.difficulty
    ? journey.difficulty.charAt(0).toUpperCase() + journey.difficulty.slice(1).toLowerCase()
    : "Easy";
  if (diff === "Medium") totalWeeks = 6;
  else if (diff === "Hard") totalWeeks = 8;
  
  let html = `<div class="gantt-container">
    <table class="gantt-table">
      <thead>
        <tr>
          <th class="task-row-name">Task</th>`;
  for (let w = 1; w <= totalWeeks; w++) {
    html += `<th>Week ${w}</th>`;
  }
  html += `</tr></thead><tbody>`;
  
  const rows = getTaskRowsForJourney(journey);
  rows.forEach((row, rowIndex) => {
    html += `<tr class="gantt-row" data-index="${rowIndex}">`;
    html += `<td class="task-row-name" onmouseenter="this.parentElement.classList.add('dependency-highlight')" onmouseleave="this.parentElement.classList.remove('dependency-highlight')">`;
    if (row.isApproval) {
      html += `<label>
        <input type="checkbox" class="approval-checkbox" data-task-index="${rowIndex}" ${row.approvedOn ? "checked disabled" : ""} />
        ${row.name}
      </label>`;
      if (row.approvedOn) {
        html += `<span class="approval-timestamp completed">Approved on ${row.approvedOn}</span>`;
      } else {
        html += `<span class="approval-timestamp" style="display:none;"></span>`;
      }
    } else {
      html += row.name;
    }
    if (row.dependencies && row.dependencies.length > 0) {
      html += `<br><small>depends on: ${row.dependencies.join(", ")}</small>`;
    }
    html += `</td>`;
    
    // Use scheduledStartDate for the Gantt chart's base date.
    let baseDate = journey.scheduledStartDate ? new Date(journey.scheduledStartDate) : new Date(journey.startDate);
    
    for (let w = 1; w <= totalWeeks; w++) {
      let cellClass = "";
      if (w >= row.startWeek && w <= row.endWeek) cellClass = "gantt-active";
      
      let weekStart = addDays(baseDate, (w - 1) * 7);
      let weekEnd = addDays(weekStart, 6);
      
      // Filter holidays for this week.
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
      
      // Mark the current week.
      if (baseDate) {
        const oneWeekMs = 7 * 24 * 3600 * 1000;
        const today = new Date();
        const weekIndex = Math.floor((today - baseDate) / oneWeekMs) + 1;
        if (weekIndex === w && cellClass.includes("gantt-active")) {
          cellClass += " gantt-current";
        }
      }
      
      html += `<td class="${cellClass}" ${tooltip ? 'title="'+tooltip+'"' : ''}></td>`;
    }
    html += `</tr>`;
  });
  
  html += `</tbody></table></div>`;
  console.log(`Rendered Gantt chart for "${journey.title}" with ${totalWeeks} weeks.`);
  return html;
}

/**
 * Binds approval checkbox events in the Gantt chart.
 * @param {Object} journey - The journey.
 */
export function bindApprovalCheckboxes(journey) {
  const container = document.querySelector(".gantt-container");
  if (!container) {
    console.warn("No gantt container found for binding approval checkboxes.");
    return;
  }
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
        const timeSpan = checkbox.parentElement.nextElementSibling || checkbox.parentElement.querySelector(".approval-timestamp");
        if (timeSpan) {
          timeSpan.textContent = `Approved on ${nowStr}`;
          timeSpan.classList.add("completed");
          timeSpan.style.display = "inline";
        }
        checkbox.disabled = true;
        console.log(`Task "${rows[taskIndex].name}" approved at ${nowStr}.`);
      }
    });
  });
}
