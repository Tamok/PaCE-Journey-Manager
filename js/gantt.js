// gantt.js
// Provides functions to render Gantt charts for journeys and subjourneys.
// Each Gantt chart is rendered as an HTML table with columns representing weeks.
// In this example, we use a fixed set of tasks for simplicity. 
// In a production system you may wish to dynamically generate task rows.

function renderGanttChart(journey) {
  // Determine number of weeks based on difficulty.
  let totalWeeks = 4;
  if (journey.difficulty === "medium") totalWeeks = 6;
  if (journey.difficulty === "hard") totalWeeks = 8;

  // Example task rows (these can be dynamically generated)
  const tasks = [
    { name: "Diagram Building", startWeek: 1, endWeek: 1 },
    { name: "Content Creation", startWeek: 1, endWeek: 1 },
    { name: "Creative Development", startWeek: 1, endWeek: 1 },
    { name: "Initial Email Template (Zoho)", startWeek: 1, endWeek: 1 },
    { name: "PM Approval", startWeek: 2, endWeek: 2 },
    { name: "Sheetal Approval", startWeek: 2, endWeek: 2 },
    { name: "Paolo Approval", startWeek: 3, endWeek: 3 },
    { name: "Denis Approval", startWeek: 3, endWeek: 3 },
    { name: "Zoho Workflow Building", startWeek: 2, endWeek: 2 },
    { name: "Email Template Revision", startWeek: 3, endWeek: 3 },
    { name: "Workflow Linking", startWeek: 3, endWeek: 3 },
    { name: "Final Template Revision", startWeek: 4, endWeek: 4 },
    { name: "Project Wrap-Up", startWeek: 4, endWeek: 4 }
  ];

  let html = `<div class="gantt-container"><table class="gantt-table"><thead><tr><th>Task</th>`;
  for (let w = 1; w <= totalWeeks; w++) {
    html += `<th>Week ${w}</th>`;
  }
  html += `</tr></thead><tbody>`;
  tasks.forEach(task => {
    html += `<tr>`;
    html += `<td class="task-row-name">${task.name}</td>`;
    for (let w = 1; w <= totalWeeks; w++) {
      if (w >= task.startWeek && w <= task.endWeek) {
        let cellClass = "gantt-active";
        // For current week marking, you could calculate based on journey start date.
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

function renderCollapsibleGantt(journey, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  const toggleBtn = document.createElement("button");
  toggleBtn.classList.add("btn");
  toggleBtn.textContent = "Toggle Gantt Chart";
  container.appendChild(toggleBtn);
  const ganttDiv = document.createElement("div");
  ganttDiv.style.display = "none";
  ganttDiv.innerHTML = renderGanttChart(journey);
  container.appendChild(ganttDiv);
  toggleBtn.addEventListener("click", () => {
    ganttDiv.style.display = ganttDiv.style.display === "none" ? "block" : "none";
  });
}

export { renderGanttChart, renderCollapsibleGantt };
