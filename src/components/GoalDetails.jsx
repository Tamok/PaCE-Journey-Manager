// src/components/GoalDetails.jsx
import React, { useEffect, useState } from 'react';
import GanttChart from './GanttChart';
import { journeyTemplate as taskTemplate } from '../services/taskTemplates';
import { calculateCompletion } from '../services/taskCompletion';
import { TIMELINE_START_DATE } from '../constants';
import { toYMD } from '../services/dateUtils';
import { updateGoal, createGoal, persistGoals } from '../services/goalService';
import { scheduleGoals } from '../services/scheduler';
import { PRIORITY_ORDER } from '../constants';
import { generateUCSBHolidaysAndBreaks } from '../services/holidayGenerator';
import '../styles/journeyDetails.css';

const GoalDetails = ({ goal, allGoals = [], role, onClose, onGoalsUpdate }) => {
  const [localGoal, setLocalGoal] = useState({ ...goal });
  const [completedTasks, setCompletedTasks] = useState({});
  const [editing, setEditing] = useState(false);
  const [showSubgoalForm, setShowSubgoalForm] = useState(false);
  const [newSubgoalTitle, setNewSubgoalTitle] = useState('');

  useEffect(() => {
    setLocalGoal({ ...goal });
  }, [goal]);

  let startDate = new Date(localGoal.scheduledStartDate);
  if (isNaN(startDate.getTime())) {
    console.error("Invalid goal.scheduledStartDate", localGoal.scheduledStartDate, "Defaulting to TIMELINE_START_DATE");
    startDate = new Date(TIMELINE_START_DATE);
  }

  // Use your holiday generator to obtain holiday dates for the relevant years.
  const holidays = generateUCSBHolidaysAndBreaks(2025, 2026);

  const toggleTaskCompletion = (taskId) => {
    if (completedTasks[taskId]) {
      const newCompleted = { ...completedTasks };
      delete newCompleted[taskId];
      setCompletedTasks(newCompleted);
    } else {
      const timestamp = window.prompt("Enter completion date/time (e.g., YYYY-MM-DD HH:MM):", new Date().toLocaleString());
      if (timestamp) {
        setCompletedTasks({ ...completedTasks, [taskId]: timestamp });
      }
    }
  };

  const taskPositions = taskTemplate.reduce((acc, t) => {
    acc[t.id] = { task: t, startDate: t.startDate || toYMD(startDate), endDate: t.endDate || toYMD(startDate) };
    return acc;
  }, {});

  const completionPercentage = calculateCompletion(taskPositions, completedTasks);

  // Change terminology to sub-goals.
  const subgoals = allGoals.filter(g => g.parentId === localGoal.id);

  const handleSave = async () => {
    if (!localGoal.title.trim()) {
      alert('Title cannot be empty.');
      return;
    }
    await updateGoal(localGoal);
    setEditing(false);
    const updatedGoals = [...allGoals.filter(g => g.id !== localGoal.id), localGoal];
    const sorted = updatedGoals.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));
    scheduleGoals(sorted);
    await persistGoals(sorted);
    onGoalsUpdate(sorted);
  };

  const handleMarkComplete = async () => {
    const newVal = localGoal.completedDate ? null : new Date().toISOString();
    const updated = { ...localGoal, completedDate: newVal };
    setLocalGoal(updated);
    await updateGoal(updated);
    const updatedGoals = [...allGoals.filter(g => g.id !== updated.id), updated];
    scheduleGoals(updatedGoals.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)));
    await persistGoals(updatedGoals);
    onGoalsUpdate(updatedGoals);
  };

  const handleAddSubgoal = async () => {
    if (!newSubgoalTitle.trim()) {
      alert('Subgoal title is required.');
      return;
    }
    const newSub = createGoal(newSubgoalTitle, localGoal.priority, localGoal.difficulty, '');
    newSub.parentId = localGoal.id;
    const updatedGoals = [...allGoals, newSub];
    scheduleGoals(updatedGoals.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)));
    await persistGoals(updatedGoals);
    onGoalsUpdate(updatedGoals);
    setShowSubgoalForm(false);
    setNewSubgoalTitle('');
  };

  return (
    <div className="journey-details p-4 bg-white text-black rounded shadow my-4">
      <div className="flex justify-between">
        {editing ? (
          <input
            className="font-bold text-xl border p-1"
            value={localGoal.title}
            onChange={(e) => setLocalGoal({ ...localGoal, title: e.target.value })}
          />
        ) : (
          <h2 className="mb-2 text-xl font-bold">{localGoal.title}</h2>
        )}
        <button onClick={onClose} className="text-sm underline">Close</button>
      </div>

      {role === 'admin' && !editing && (
        <button
          className="text-sm underline text-blue-600 mb-2"
          onClick={() => setEditing(true)}
        >
          Edit
        </button>
      )}

      <p className="text-sm text-gray-700 mb-2">
        Priority:{" "}
        {editing ? (
          <select
            className="border p-1 text-sm"
            value={localGoal.priority}
            onChange={(e) => setLocalGoal({ ...localGoal, priority: e.target.value })}
          >
            <option value="Critical">Critical</option>
            <option value="Important">Important</option>
            <option value="Next">Next</option>
            <option value="Sometime Maybe">Sometime Maybe</option>
          </select>
        ) : (
          localGoal.priority
        )}
        {" | "}
        Difficulty:{" "}
        {editing ? (
          <select
            className="border p-1 text-sm"
            value={localGoal.difficulty}
            onChange={(e) => setLocalGoal({ ...localGoal, difficulty: e.target.value })}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        ) : (
          localGoal.difficulty
        )}
      </p>

      <p className="text-sm mb-2">
        Schedule Start:{" "}
        {editing ? (
          <input
            type="date"
            className="border p-1 text-sm"
            value={localGoal.scheduledStartDate || toYMD(startDate)}
            onChange={(e) => setLocalGoal({ ...localGoal, scheduledStartDate: e.target.value })}
          />
        ) : (
          localGoal.scheduledStartDate || toYMD(startDate)
        )}
      </p>

      <div className="mb-2">
        <label className="block text-sm font-bold">Note/Description:</label>
        {editing ? (
          <textarea
            className="border p-1 w-full"
            value={localGoal.note || ''}
            onChange={(e) => setLocalGoal({ ...localGoal, note: e.target.value })}
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{localGoal.note || '—'}</p>
        )}
      </div>

      <div className="mb-2">
        <label className="block text-sm font-bold">Podio Link:</label>
        {editing ? (
          <input
            className="border p-1 w-full"
            value={localGoal.podioLink || ''}
            onChange={(e) => setLocalGoal({ ...localGoal, podioLink: e.target.value })}
          />
        ) : localGoal.podioLink ? (
          <a href={localGoal.podioLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">
            {localGoal.podioLink}
          </a>
        ) : (
          <span className="text-sm">—</span>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-bold">Zoho Link:</label>
        {editing ? (
          <input
            className="border p-1 w-full"
            value={localGoal.zohoLink || ''}
            onChange={(e) => setLocalGoal({ ...localGoal, zohoLink: e.target.value })}
          />
        ) : localGoal.zohoLink ? (
          <a href={localGoal.zohoLink} target="_blank" rel="noreferrer" className="text-blue-600 underline">
            {localGoal.zohoLink}
          </a>
        ) : (
          <span className="text-sm">—</span>
        )}
      </div>

      {editing && role === 'admin' && (
        <button className="btn mb-4" onClick={handleSave}>
          Save Changes
        </button>
      )}

      <div className="flex items-center mb-4">
        <button className="btn mr-2" onClick={handleMarkComplete}>
          {localGoal.completedDate ? 'Reopen' : 'Mark as Complete'}
        </button>
        {localGoal.completedDate && (
          <span className="text-green-600 text-sm">
            Completed on {new Date(localGoal.completedDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="border-t pt-2 mt-2">
        <h3 className="font-bold mb-2">Gantt Chart</h3>
        <GanttChart
          tasks={taskTemplate}
          startDate={startDate}
          difficulty={localGoal.difficulty}
          holidays={holidays.map(h => h.date)}
          completedTasks={completedTasks}
          toggleTaskCompletion={toggleTaskCompletion}
        />
        <div className="mt-2">Completion: {completionPercentage}%</div>
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">Sub-goals:</h3>
        {subgoals.length > 0 ? (
          subgoals.map(sg => (
            <div key={sg.id} className="ml-4 p-2 border-l-2 border-gray-300 mb-2">
              <strong>{sg.title}</strong> ({sg.priority}) - {sg.difficulty}
              {sg.completedDate && (
                <span className="ml-2 text-green-600 text-sm">
                  (Completed on {new Date(sg.completedDate).toLocaleDateString()})
                </span>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm">No sub-goals yet.</p>
        )}
        {role === 'admin' && (
          <>
            {!showSubgoalForm && (
              <button
                className="btn mt-2"
                onClick={() => setShowSubgoalForm(true)}
              >
                Add Sub-goal
              </button>
            )}
            {showSubgoalForm && (
              <div className="p-2 mt-2 border rounded bg-gray-50">
                <label className="block mb-2">
                  Sub-goal Title:
                  <input
                    className="block w-full p-1 border"
                    type="text"
                    value={newSubgoalTitle}
                    onChange={(e) => setNewSubgoalTitle(e.target.value)}
                  />
                </label>
                <button className="btn mr-2" onClick={handleAddSubgoal}>
                  Save Sub-goal
                </button>
                <button className="btn-cancel" onClick={() => setShowSubgoalForm(false)}>
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GoalDetails;
