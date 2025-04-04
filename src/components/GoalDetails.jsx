// src/components/JourneyDetails.jsx
import React, { useState } from 'react';
import { journeyTemplate } from '../services/taskTemplates';
import GanttChart from './GanttChart';
import { calculateCompletion } from '../services/taskCompletion';
import { calculateTaskPositions } from '../services/taskScheduler';

const GoalDetails = ({ goal, holidays, allGoals }) => {
  const [completedTasks, setCompletedTasks] = useState([]);

  const toggleTaskCompletion = (taskId) => {
    setCompletedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const taskPositions = calculateTaskPositions(journeyTemplate, goal.scheduledStartDate, goal.difficulty, holidays);
  const completionPercentage = calculateCompletion(taskPositions, completedTasks);

  // Gather subgoals
  const subgoals = allGoals.filter(g => g.parentId === goal.id);

  return (
    <div className="journey-details p-4 bg-white text-black rounded shadow my-4">
      <h2 className="mb-2 text-xl font-bold">{goal.title}</h2>
      <p className="text-sm text-gray-700 mb-2">
        Priority: {goal.priority} | Difficulty: {goal.difficulty}
      </p>

      <GanttChart
        tasks={journeyTemplate}
        startDate={goal.scheduledStartDate}
        difficulty={goal.difficulty}
        holidays={holidays}
        completedTasks={completedTasks}
        toggleTaskCompletion={toggleTaskCompletion}
      />
      <div className="mt-2">Completion: {completionPercentage}%</div>

      {/* Subgoals listed below */}
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
