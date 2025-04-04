// src/components/GoalDetails.jsx
import React, { useState } from 'react';
import { journeyTemplate } from '../services/taskTemplates';
import GanttChart from './GanttChart';
import { calculateCompletion } from '../services/taskCompletion';
import { calculateTaskPositions } from '../services/taskScheduler';
import { TIMELINE_START_DATE } from '../constants';

const GoalDetails = ({ goal, holidays, allGoals = [] }) => {
  const [completedTasks, setCompletedTasks] = useState([]);

  const toggleTaskCompletion = (taskId) => {
    setCompletedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Ensure goal.scheduledStartDate is valid; fallback to default if not.
  let startDate = new Date(goal.scheduledStartDate);
  if (isNaN(startDate.getTime())) {
    console.error("Invalid goal.scheduledStartDate", goal.scheduledStartDate, "Defaulting to TIMELINE_START_DATE");
    startDate = new Date(TIMELINE_START_DATE);
  }

  const taskPositions = calculateTaskPositions(journeyTemplate, startDate, goal.difficulty, holidays);
  const completionPercentage = calculateCompletion(taskPositions, completedTasks);

  // Safely filter subgoals
  const subgoals = (allGoals || []).filter(g => g.parentId === goal.id);

  return (
    <div className="journey-details p-4 bg-white text-black rounded shadow my-4">
      <h2 className="mb-2 text-xl font-bold">{goal.title}</h2>
      <p className="text-sm text-gray-700 mb-2">
        Priority: {goal.priority} | Difficulty: {goal.difficulty}
      </p>

      <GanttChart
        tasks={journeyTemplate}
        startDate={startDate}
        difficulty={goal.difficulty}
        holidays={holidays}
        completedTasks={completedTasks}
        toggleTaskCompletion={toggleTaskCompletion}
      />
      <div className="mt-2">Completion: {completionPercentage}%</div>

      {subgoals.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Subgoals:</h3>
          {subgoals.map(sg => (
            <div key={sg.id} className="ml-4 p-2 border-l-2 border-gray-300">
              <strong>{sg.title}</strong> ({sg.priority}) - {sg.difficulty}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalDetails;
