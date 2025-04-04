// src/components/JourneyDetails.jsx
import React, { useState } from 'react';
import { journeyTemplate } from '../services/taskTemplates';
import GanttChart from './GanttChart';
import { calculateCompletion } from '../services/taskCompletion';

const GoalDetails = ({ goal, holidays }) => {
  const [completedTasks, setCompletedTasks] = useState([]);

  const toggleTaskCompletion = (taskId) => {
    setCompletedTasks(prev => prev.includes(taskId)
      ? prev.filter(id => id !== taskId)
      : [...prev, taskId]);
  };

  const completionPercentage = calculateCompletion(
    calculateTaskPositions(journeyTemplate, goal.scheduledStartDate, goal.difficulty, holidays),
    completedTasks
  );

  return (
    <div>
      <h2>{goal.title}</h2>
      <GanttChart
        tasks={journeyTemplate}
        startDate={goal.scheduledStartDate}
        difficulty={goal.difficulty}
        holidays={holidays}
        completedTasks={completedTasks}
        toggleTaskCompletion={toggleTaskCompletion}
      />
      <div>Completion: {completionPercentage}%</div>
    </div>
  );
};

export default GoalDetails;
