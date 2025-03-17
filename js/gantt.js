/**
 * gantt.js
 *
 * Renders the Gantt chart for a journey and binds events for approval checkboxes.
 * Non-approval tasks (i.e. creative tasks) are recalculated based on the journey's difficulty.
 * Dependencies are highlighted on hover.
 *
 * Author: Your Name
 * Date: YYYY-MM-DD
 */

/* Base Task Rows Definition */
const baseTaskRows = [
  // Non-approval tasks (their durations will be scaled)
  {
    name: "Diagram Building",
    startWeek: 1,
    endWeek: 1,
    dependencies: [],
    isApproval: false
  },
  {
    name: "Content Creation",
    startWeek: 1,
    endWeek: 1,
    dependencies: [],
    isApproval: false
  },
  {
    name: "Creative Development",
    startWeek: 1,
    endWeek: 1,
    dependencies: [],
    isApproval: false
  },
  {
    name: "Initial Email Template (Zoho)",
    startWeek: 1,
    endWeek: 1,
    dependencies: ["Creative Development"],
    isApproval: false
  },
  // Approval tasks (fixed at 2 weeks, constant order)
  {
    name: "PM Approval",
    startWeek: 2,
    endWeek: 2,
    dependencies: [],
    isApproval: true
  },
  {
    name: "Sheetal Approval",
    startWeek: 2,
    endWeek: 2,
    dependencies: ["PM Approval"],
    isApproval: true
  },
  {
    name: "Paolo Approval",
    startWeek: 3,
    endWeek: 3,
    dependencies: ["Sheetal Approval"],
    isApproval: true
  },
  {
    name: "Denis Approval",
    startWeek: 3,
    endWeek: 3,
    dependencies: ["Paolo Approval"],
    isApproval: true
  },
  // Overlapping tasks
  {
    name: "Zoho Workflow Building (Diagram)",
    startWeek: 2,
    endWeek: 2,
    dependencies: ["Diagram Building", "PM Approval"],
    isApproval: false
  },
  {
    name: "Email Template Revision (Zoho)",
    startWeek: 3,
    endWeek: 3,
    dependencies: ["Creative Development", "Paolo Approval", "Denis Approval"],
    isApproval: false
  },
  {
    name: "Workflow Linking / Logic",
    startWeek: 3,
    endWeek: 3,
    dependencies: ["Email Template Revision"],
    isApproval: false
  },
  // Final tasks
  {
    name: "Final Template Revision",
    startWeek: 4,
    endWeek: 4,
    dependencies: ["Denis Approval"],
    isApproval: false
  },
  {
    name: "Project Wrap-Up & Check-In",
    startWeek: 4,
    endWeek: 4,
    dependencies: [],
    isApproval: false
  }
];

/**
 * Adapts the base task rows for a given journey.
 * Approval tasks remain fixed (2 weeks). Non-approval tasks are scaled.
 * Scaling factor is (totalWeeks / 4), where totalWeeks is based on difficulty:
 *   Easy = 4, Medium = 6, Hard = 8.
 * @param {Object} journey - The journey object.
 * @returns {Array} Task rows for the journey.
 */
function getTaskRowsForJourney(journey) {
  if (journey.taskRows) return journey.taskRows;

  const cloned = JSON.parse(JSON.stringify(baseTaskRows));
  let totalWeeks = 4;
  if (journey.difficulty === "Medium") totalWeeks = 6;
  else if (journey.difficulty === "Hard") totalWeeks = 8;
  const factor = totalWeeks / 4;

  cloned.forEach(task => {
    if (!task.isApproval) {
      task.startWeek = Math.max(1, Math.round(task.startWeek * factor));
      task.endWeek = Math.max(task.startWeek, Math.round(task.endWeek * factor));
    }
  });
  journey.taskRows = cloned;
  return journey.taskRows;
}

/**
 * Renders the Gantt chart for a journey.
 * @param {Object} journey - The journey object.
 * @returns {string} HTML string of the Gantt chart.
 */
export function renderGantt(journey) {
  let totalWeeks = 4;
  if (journey.difficulty === "Medium") totalWeeks = 6;
  else if (journey.difficulty === "Hard") totalWeeks = 8;
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
    html += `<td class="task-row-name" 
              onmouseenter="this.parentElement.classList.add('dependency-highlight')" 
              onmouseleave="this.parentElement.classList.remove('dependency-highlight')">`;
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
    for (let w = 1; w <= totalWeeks; w++) {
      if (w >= row.startWeek && w <= row.endWeek) {
        let cellClass = "gantt-active";
        if (journey.startDate) {
          const oneWeekMs = 7 * 24 * 3600 * 1000;
          const today = new Date();
          const weekIndex = Math.floor((today - new Date(journey.startDate)) / oneWeekMs) + 1;
          if (weekIndex === w) cellClass += " gantt-current";
        }
        html += `<td class="${cellClass}"></td>`;
      } else {
        html += `<td></td>`;
      }
    }
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;
  console.log(`Rendered Gantt chart for "${journey.title}" (${totalWeeks} weeks).`);
  return html;
}

/**
 * Binds event listeners to approval checkboxes in the rendered Gantt chart.
 * When checked, stamps the task with the current timestamp and disables the checkbox.
 * @param {Object} journey - The journey object.
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
        const timeSpan = checkbox.parentElement.nextElementSibling ||
                         checkbox.parentElement.querySelector(".approval-timestamp");
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
