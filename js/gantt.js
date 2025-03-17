/**
 * gantt.js
 *
 * This module is responsible for rendering the Gantt chart for a journey and
 * binding approval checkbox events to timestamp task approvals.
 *
 * The chart is built as an HTML table with the number of columns determined by the journey's difficulty:
 *   - Easy: 4 weeks
 *   - Medium: 6 weeks
 *   - Hard: 8 weeks
 *
 * Each task row is based on a default set of tasks (baseTaskRows) which is cloned and adapted.
 * Approval tasks include a checkbox that, when checked, is stamped with the current date and time.
 *
 * Author: Your Name
 * Date: YYYY-MM-DD
 */

/* ---------------------------
   Base Task Rows Definition
---------------------------- */
/**
 * The base set of task rows used to build the Gantt chart.
 * This is cloned and adapted (by shifting weeks or adding extra tasks)
 * depending on the journey's difficulty.
 */
const baseTaskRows = [
  // Week 1 Tasks
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
  // Approval tasks (Weeks 2-3)
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
  // Week 4 Tasks
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

/* ---------------------------------
   Task Rows Adaptation for a Journey
---------------------------------- */
/**
 * Returns the task rows for a given journey.
 * If the journey already has a taskRows property, that is returned.
 * Otherwise, a clone of the baseTaskRows is adapted based on journey.difficulty:
 *   - For medium difficulty, tasks scheduled in week 4 are shifted to week 5 and an extra row is added.
 *   - For hard difficulty, tasks are pushed out further and extra QA/Wrap-up rows are added.
 *
 * @param {Object} journey - The journey object.
 * @returns {Array} An array of task rows.
 */
function getTaskRowsForJourney(journey) {
  if (journey.taskRows) return journey.taskRows;

  // Clone the base tasks.
  const cloned = JSON.parse(JSON.stringify(baseTaskRows));

  if (journey.difficulty === "medium") {
    // Shift tasks scheduled at week 4 to week 5.
    cloned.forEach(task => {
      if (task.startWeek === 4) {
        task.startWeek = 5;
        task.endWeek = 5;
      }
    });
    // Add an extra row for medium difficulty.
    cloned.push({
      name: "Extended QA & Wrap-Up",
      startWeek: 6,
      endWeek: 6,
      dependencies: [],
      isApproval: false
    });
    console.log(`Adapted ${cloned.length} task rows for medium difficulty.`);
  } else if (journey.difficulty === "hard") {
    // For hard difficulty, push tasks out to extend the timeline.
    cloned.forEach(task => {
      if (task.startWeek === 4) {
        task.startWeek = 7;
        task.endWeek = 7;
      }
      // Other tasks may remain as is.
    });
    // Add additional rows specific to hard difficulty.
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
    console.log(`Adapted ${cloned.length} task rows for hard difficulty.`);
  } else {
    console.log(`Using base task rows for easy difficulty.`);
  }

  journey.taskRows = cloned;
  return journey.taskRows;
}

/* -------------------------------
   Gantt Chart Rendering Function
-------------------------------- */
/**
 * Renders the Gantt chart for a given journey.
 * The chart is returned as an HTML string.
 *
 * @param {Object} journey - The journey object, which must have a defined difficulty and startDate.
 * @returns {string} HTML string representing the Gantt chart.
 */
export function renderGantt(journey) {
  let totalWeeks = 4;
  if (journey.difficulty === "medium") {
    totalWeeks = 6;
  } else if (journey.difficulty === "hard") {
    totalWeeks = 8;
  }

  let html = `<div class="gantt-container">
    <table class="gantt-table">
      <thead>
        <tr>
          <th class="task-row-name">Task</th>`;

  // Create table headers for each week.
  for (let w = 1; w <= totalWeeks; w++) {
    html += `<th>Week ${w}</th>`;
  }
  html += `</tr></thead><tbody>`;

  // Get task rows (either pre-defined or adapted from baseTaskRows).
  const rows = getTaskRowsForJourney(journey);
  rows.forEach((row, rowIndex) => {
    html += `<tr>`;
    html += `<td class="task-row-name">`;
    // For approval tasks, include a checkbox with a data attribute.
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

    // Render cells for each week.
    for (let w = 1; w <= totalWeeks; w++) {
      if (w >= row.startWeek && w <= row.endWeek) {
        let cellClass = "gantt-active";
        // If journey.startDate exists, mark the cell corresponding to the current week.
        if (journey.startDate) {
          const oneWeekMs = 7 * 24 * 3600 * 1000;
          const today = new Date();
          const weekIndex = Math.floor((today - journey.startDate) / oneWeekMs) + 1;
          if (weekIndex === w) {
            cellClass += " gantt-current";
          }
        }
        html += `<td class="${cellClass}"></td>`;
      } else {
        html += `<td></td>`;
      }
    }
    html += `</tr>`;
  });

  html += `</tbody></table></div>`;
  console.log(`Rendered Gantt chart for journey "${journey.title}" with ${totalWeeks} weeks.`);
  return html;
}

/* -------------------------------------------
   Approval Checkbox Event Binding Function
-------------------------------------------- */
/**
 * Binds event listeners to approval checkboxes in the rendered Gantt chart.
 * When an approval checkbox is checked, the corresponding task row is stamped with the current timestamp,
 * and the checkbox is disabled.
 *
 * @param {Object} journey - The journey object which has taskRows.
 */
export function bindApprovalCheckboxes(journey) {
  // Look for approval checkboxes within the gantt container.
  const container = document.querySelector(".gantt-container");
  if (!container) {
    console.warn("No gantt container found when binding approval checkboxes.");
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
        // Update the adjacent timestamp span.
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
