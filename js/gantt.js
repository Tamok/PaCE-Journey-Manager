// gantt.js
// Provides functions to render dynamic Gantt charts for journeys.
// Task durations are scaled according to the journey’s difficulty.
// For each task, the base duration (in weeks) is scaled: easy=1, medium=1.5, hard=3 (rounded up).

function getScaleFactor(difficulty) {
  if (difficulty === "medium") return 1.5;
  if (difficulty === "hard") return 3;
  return 1;
}

function renderGanttChart(journey) {
  const scaleFactor = getScaleFactor(journey.difficulty);
  // Base tasks for an easy project (duration in weeks)
  const baseTasks = [
    { name: "Diagram Building", duration: 1 },
    { name: "Content Creation", duration: 1 },
    { name: "Creative Development", duration: 1 },
    { name: "Initial Email Template (Zoho)", duration: 1 },
    { name: "PM Approval", duration: 1 },
    { name: "Sheetal Approval", duration: 1 },
    { name: "Paolo Approval", duration: 1 },
    { name: "Denis Approval", duration: 1 },
    { name: "Zoho Workflow Building", duration: 1 },
    { name: "Email Template Revision", duration: 1 },
    { name: "Workflow Linking", duration: 1 },
    { name: "Final Template Revision", duration: 1 },
    { name: "Project Wrap-Up", duration: 1 }
  ];

  // Scale durations and compute sequential start and end weeks
  let currentWeek = 1;
  const tasks = baseTasks.map(task => {
    const scaledDuration = Math.ceil(task.duration * scaleFactor);
    const taskObj = { name: task.name, startWeek: currentWeek, endWeek: currentWeek + scaledDuration - 1 };
    currentWeek += scaledDuration;
    return taskObj;
  });
  const totalWeeks = currentWeek - 1;

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
