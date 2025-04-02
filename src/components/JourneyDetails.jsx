// src/components/JourneyDetails.jsx
import React, { useState } from 'react';
import { renderGantt } from '../services/gantt';
import '../styles/journeyDetails.css';

const JourneyDetails = ({ journey, journeyData, setJourneyData, role }) => {
  const [noteEdit, setNoteEdit] = useState(false);
  const [noteValue, setNoteValue] = useState(journey.note);

  const handleNoteKeyDown = async (e) => {
    if (e.key === 'Enter') {
      journey.note = noteValue;
      setJourneyData([...journeyData]);
      setNoteEdit(false);
    }
  };

  const completeButton = role === 'admin' && !journey.completedDate && (
    <button className="btn" onClick={() => {
      const defaultDate = new Date().toISOString().slice(0, 10);
      const userDate = prompt("Enter completion date (YYYY-MM-DD):", defaultDate);
      if (userDate) {
        journey.completedDate = userDate;
        setJourneyData([...journeyData]);
      }
    }}>
      Mark as Complete
    </button>
  );

  return (
    <div className="journey-details">
      <h2>{journey.title}</h2>
      {completeButton}
      <div className="schedule-info">
        <p>
          Schedule: {journey.scheduledStartDate ? journey.scheduledStartDate : '(unscheduled)'}
        </p>
      </div>
      <div className="editable-fields">
        <label>
          Difficulty:
          <select
            value={journey.difficulty}
            onChange={(e) => {
              journey.difficulty = e.target.value;
              setJourneyData([...journeyData]);
            }}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>
        <label>
          Priority:
          <select
            value={journey.priority}
            onChange={(e) => {
              journey.priority = e.target.value;
              setJourneyData([...journeyData]);
            }}
          >
            <option value="Critical">Critical</option>
            <option value="Important">Important</option>
            <option value="Next">Next</option>
            <option value="Sometime Maybe">Sometime Maybe</option>
          </select>
        </label>
      </div>
      <div className="note-section">
        <label>Note:</label>
        {noteEdit ? (
          <input
            type="text"
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            onKeyDown={handleNoteKeyDown}
          />
        ) : (
          <span onClick={() => role === 'admin' && setNoteEdit(true)}>
            {journey.note || 'Click to add a note'}
          </span>
        )}
      </div>
      <div className="gantt-chart">
        <div dangerouslySetInnerHTML={{ __html: renderGantt(journey) }} />
      </div>
    </div>
  );
};

export default JourneyDetails;
