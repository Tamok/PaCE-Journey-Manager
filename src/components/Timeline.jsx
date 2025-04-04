// src/components/Timeline.jsx
import React from 'react';
import { PRIORITY_ORDER } from '../constants';
import { persistGoals } from '../services/goalService';
import { scheduleGoals } from '../services/scheduler';

const Timeline = ({ goalData, onSelectGoal, role }) => {
  const handleDragStart = (e, index) => {
    if (role !== 'admin') return;
    e.dataTransfer.setData('goalIndex', index);
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (role !== 'admin') return;

    const draggedIndex = parseInt(e.dataTransfer.getData('goalIndex'), 10);
    const reorderedGoals = [...goalData];

    const [draggedGoal] = reorderedGoals.splice(draggedIndex, 1);
    reorderedGoals.splice(targetIndex, 0, draggedGoal);

    // Update priority based on new position
    reorderedGoals.forEach((goal, idx) => {
      goal.priority = PRIORITY_ORDER[Math.min(idx, PRIORITY_ORDER.length - 1)];
    });

    scheduleGoals(reorderedGoals);  // reschedule based on new priorities
    await persistGoals(reorderedGoals); // save changes to Firestore
  };

  const sortedGoals = goalData.sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );

  return (
    <div className="timeline-container">
      {sortedGoals.map((goal, idx) => (
        <div
          key={goal.id}
          className={`timeline-item ${goal.priority.toLowerCase().replace(/ /g, '-')}`}
          draggable={role === 'admin'}
          onDragStart={(e) => handleDragStart(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => onSelectGoal(goal)}
        >
          <strong>{goal.title}</strong>
          <span className="priority-label">{goal.priority}</span>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
