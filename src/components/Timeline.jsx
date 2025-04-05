// src/components/Timeline.jsx
import React from 'react';
import { PRIORITY_ORDER } from '../constants';
import { persistGoals } from '../services/goalService';
import { scheduleGoals } from '../services/scheduler';
import '../styles/timeline.css';

const Timeline = ({ goalData, onSelectGoal, role, onReorder }) => {
  // Self-sort goals by priority
  const sortedGoals = [...goalData].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );

  const handleDragStart = (e, index) => {
    if (role !== 'admin') return;
    e.dataTransfer.setData('goalIndex', index);
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (role !== 'admin') return;

    const draggedIndex = parseInt(e.dataTransfer.getData('goalIndex'), 10);
    const reorderedGoals = [...sortedGoals];

    const [draggedGoal] = reorderedGoals.splice(draggedIndex, 1);
    reorderedGoals.splice(targetIndex, 0, draggedGoal);

    // Update priority based on new position
    reorderedGoals.forEach((goal, idx) => {
      goal.priority = PRIORITY_ORDER[Math.min(idx, PRIORITY_ORDER.length - 1)];
    });

    scheduleGoals(reorderedGoals);
    await persistGoals(reorderedGoals);
    onReorder(reorderedGoals);
  };

  return (
    <div className="timeline-container" style={{ backgroundColor: "#ffffff" }}>
      {sortedGoals.map((goal, idx) => {
        const completionEstimate = goal.scheduledEndDate
          ? new Date(goal.scheduledEndDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : '';
        return (
          <div
            key={goal.id}
            className={`timeline-item ${goal.priority.toLowerCase().replace(/ /g, '-')}`}
            draggable={role === 'admin'}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => onSelectGoal(goal)}
          >
            <div style={{ textAlign: 'left', width: '100%', paddingLeft: '10px' }}>
              <strong>{goal.title}</strong>
              <div className="priority-label">{goal.priority}</div>
              <div style={{ fontSize: '0.85rem', color: '#003660', marginTop: '4px' }}>
                {completionEstimate}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
