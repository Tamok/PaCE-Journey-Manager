// src/components/GanttChart.jsx
import React from 'react';
import { parseDate, toYMD, addDays } from '../services/dateUtils';

/**
 * Computes the fraction (0 to 1) of overlap (in days) between a task period and a week period.
 */
const computeOverlapFraction = (taskStart, taskEnd, weekStart, weekEnd) => {
  const start = taskStart > weekStart ? taskStart : weekStart;
  const end = taskEnd < weekEnd ? taskEnd : weekEnd;
  const diff = (end - start) / (1000 * 60 * 60 * 24) + 1; // inclusive of both days
  return diff > 0 ? Math.min(diff / 7, 1) : 0;
};

/**
 * Determines holiday overlay type for the week cell.
 * Returns "full" if all 7 days are holidays, "partial" if some are, or null.
 */
const getHolidayOverlayType = (weekStart, holidays) => {
  let holidayCount = 0;
  for (let i = 0; i < 7; i++) {
    const day = toYMD(addDays(weekStart, i));
    if (holidays.includes(day)) {
      holidayCount++;
    }
  }
  if (holidayCount === 7) return 'full';
  if (holidayCount > 0) return 'partial';
  return null;
};

const GanttChart = ({
  tasks,
  startDate,
  difficulty,
  holidays = [],
  completedTasks = {}, // now an object: { taskId: "completion timestamp" }
  toggleTaskCompletion
}) => {
  // Determine the earliest and latest dates among tasks
  let minDate = null;
  let maxDate = null;
  tasks.forEach(task => {
    const ts = parseDate(task.startDate);
    const te = parseDate(task.endDate);
    if (!minDate || ts < minDate) minDate = ts;
    if (!maxDate || te > maxDate) maxDate = te;
  });
  if (!minDate || !maxDate) {
    return <p>No valid task dates.</p>;
  }

  // Generate weekly columns starting from minDate to maxDate
  const weekColumns = [];
  let tempDate = new Date(minDate);
  let weekIndex = 1;
  while (tempDate <= maxDate) {
    weekColumns.push({ label: `Week ${weekIndex}`, date: new Date(tempDate) });
    tempDate = addDays(tempDate, 7);
    weekIndex++;
  }

  return (
    <div className="gantt-container overflow-auto">
      <table className="gantt-table">
        <thead>
          <tr>
            <th style={{ minWidth: '250px', textAlign: 'left' }}>Task</th>
            {weekColumns.map((col, i) => (
              <th key={i} style={{ textAlign: 'center' }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => {
            const taskStart = parseDate(task.startDate);
            const taskEnd = parseDate(task.endDate);
            const isCompleted = completedTasks.hasOwnProperty(task.id);
            return (
              <tr
                key={task.id}
                className={isCompleted ? 'bg-gray-200' : ''}
                onMouseEnter={() => {
                  // Optionally, add logic to highlight dependency cells
                }}
                onMouseLeave={() => {
                  // Remove highlight
                }}
              >
                <td style={{ textAlign: 'left', padding: '8px' }}>
                  <div style={{ fontWeight: 'bold' }}>{task.name}</div>
                  {task.dependencies && task.dependencies.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      Depends on: {task.dependencies.join(', ')}
                    </div>
                  )}
                  {isCompleted && (
                    <div style={{ color: '#38a169', fontSize: '0.8rem', marginTop: '4px' }}>
                      Task completed on {completedTasks[task.id]}
                    </div>
                  )}
                  <div>
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleTaskCompletion(task.id)}
                        style={{ marginRight: '4px' }}
                      />
                      {isCompleted ? 'Completed' : 'Mark Complete'}
                    </label>
                  </div>
                </td>
                {weekColumns.map((col, i) => {
                  const cellStart = col.date;
                  const cellEnd = addDays(cellStart, 6);
                  const overlapFraction = computeOverlapFraction(taskStart, taskEnd, cellStart, cellEnd);
                  const holidayType = getHolidayOverlayType(cellStart, holidays);
                  return (
                    <td key={i} style={{ position: 'relative', width: '80px', height: '40px' }}>
                      {overlapFraction > 0 && (
                        <div
                          style={{
                            width: `${overlapFraction * 100}%`,
                            height: '100%',
                            backgroundColor: isCompleted ? '#c6f6d5' : '#feb2b2'
                          }}
                        />
                      )}
                      {holidayType === 'full' && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#003660',
                          opacity: 0.2
                        }} />
                      )}
                      {holidayType === 'partial' && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundImage: 'repeating-linear-gradient(45deg, #003660, #003660 2px, transparent 2px, transparent 4px)',
                          opacity: 0.2
                        }} />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GanttChart;
