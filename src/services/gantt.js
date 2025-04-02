// src/services/gantt.js
import { addDays, toYMD, getCalendarWeek } from './scheduler';

const baseTaskRows = [
  { name: "Diagram Building", startWeek: 1, endWeek: 1, isApproval: false },
  { name: "Content Creation", startWeek: 1, endWeek: 1, isApproval: false },
  { name: "Creative Development", startWeek: 1, endWeek: 1, isApproval: false },
  { name: "PM Approval", startWeek: 2, endWeek: 2, isApproval: true },
  { name: "Final Template Revision", startWeek: 4, endWeek: 4, isApproval: false }
];

export function renderGantt(journey) {
  let baseDate = journey.scheduledStartDate ? new Date(journey.scheduledStartDate) : new Date();
  let totalWeeks = 4;
  if (journey.difficulty === 'Medium') totalWeeks = 6;
  else if (journey.difficulty === 'Hard') totalWeeks = 8;
  let html = `<div class="gantt-container">
    <table class="gantt-table">
      <thead>
        <tr><th>Task</th>`;
  for (let w = 1; w <= totalWeeks; w++) {
    const weekStart = addDays(baseDate, (w - 1) * 7);
    const weekNum = getCalendarWeek(weekStart);
    html += `<th>W${weekNum}</th>`;
  }
  html += `</tr></thead><tbody>`;
  baseTaskRows.forEach((task, index) => {
    html += `<tr><td>${task.name}</td>`;
    for (let w = 1; w <= totalWeeks; w++) {
      const cellClass = (w >= task.startWeek && w <= task.endWeek) ? 'gantt-active' : '';
      html += `<td class="${cellClass}"></td>`;
    }
    html += `</tr>`;
  });
  html += `</tbody></table></div>`;
  return html;
}
