// src/components/GanttChart.jsx

import React from 'react';
import { calculateTaskPositions } from '../services/taskScheduler';

const GanttChart = ({ tasks, startDate, difficulty, holidays, completedTasks, toggleTaskCompletion }) => {
  const taskPositions = calculateTaskPositions(tasks, startDate, difficulty, holidays);

  return (
    <table className="gantt-table">
      <thead><tr><th>Task</th><th>Timeline</th></tr></thead>
      <tbody>
        {Object.values(taskPositions).map(({ task, startDate, endDate }) => {
          const completed = completedTasks.includes(task.id);
          const canComplete = task.dependencies.every(dep => completedTasks.includes(dep));

          return (
            <tr key={task.id}>
              <td>
                <label>
                  <input
                    type="checkbox"
                    checked={completed}
                    disabled={!canComplete}
                    onChange={() => toggleTaskCompletion(task.id)}
                  /> {task.name}
                </label>
              </td>
              <td>{startDate} → {endDate}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default GanttChart;
