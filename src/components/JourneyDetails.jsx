// src/components/JourneyDetails.jsx
import React, { useState } from 'react';
import { renderGantt, bindApprovalCheckboxes } from '../services/gantt';
import { toYMD, parseDate } from '../services/scheduler';
import '../styles/journeyDetails.css';

const JourneyDetails = ({ journey, journeyData, setJourneyData, role }) => {
  const [noteEdit, setNoteEdit] = useState(false);
  const [noteValue, setNoteValue] = useState(journey.note);

  const handleNoteKeyDown = async (e) => {
    if (e.key === 'Enter') {
      journey.note = noteValue;
      await setJourneyData([...journeyData]);
      setNoteEdit(false);
    }
  };

  const markComplete = async () => {
    const defaultDate = toYMD(new Date());
    const userDate = prompt("Enter completion date (YYYY-MM-DD):", defaultDate);
    if (!userDate) return;
    const compDate = parseDate(userDate);
    if (isNaN(compDate.getTime())) {
      alert("Invalid date.");
      return;
    }
    journey.completedDate = compDate;
    await setJourneyData([...journeyData]);
    setJourneyData([...journeyData]);
    console.log(`Journey "${journey.title}" marked complete on ${toYMD(compDate)}.`);
  };

  return (
    <div className="journey-details">
      <h2>{journey.title}</h2>
      {!journey.completedDate ? (
        role === "admin" && <button className="btn" onClick={markComplete}>Mark as Complete</button>
      ) : (
        <p><strong>Completed on:</strong> {toYMD(new Date(journey.completedDate))}</p>
      )}
      <div className="schedule-info">
        <p>Schedule: {journey.scheduledStartDate ? journey.scheduledStartDate : "(unscheduled)"}</p>
      </div>
      <div className="editable-fields">
        <label>
          Difficulty:
          <select value={journey.difficulty} onChange={async (e) => { journey.difficulty = e.target.value; await setJourneyData([...journeyData]); }}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>
        <label>
          Priority:
          <select value={journey.priority} onChange={async (e) => { journey.priority = e.target.value; await setJourneyData([...journeyData]); }}>
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
          <span onClick={() => role === "admin" && setNoteEdit(true)}>
            {journey.note || "Click to add a note"}
          </span>
        )}
      </div>
      <div className="link-section">
        { !journey.parentId && (
          <>
            <button className="btn" onClick={() => {
              const podio = prompt("Enter Podio Link:", journey.podioLink || "");
              const zoho = prompt("Enter Zoho Link:", journey.zohoLink || "");
              journey.podioLink = podio || "";
              journey.zohoLink = zoho || "";
              setJourneyData([...journeyData]);
            }}>Edit Podio/Zoho Links</button>
            {(journey.podioLink || journey.zohoLink) && (
              <div>
                {journey.podioLink && <a href={journey.podioLink} target="_blank" rel="noreferrer">Podio</a>}{" "}
                {journey.zohoLink && <a href={journey.zohoLink} target="_blank" rel="noreferrer">Zoho</a>}
              </div>
            )}
          </>
        )}
      </div>
      <div className="gantt-chart" dangerouslySetInnerHTML={{ __html: renderGantt(journey) }} />
      {setTimeout(() => { bindApprovalCheckboxes(journey); }, 0)}
      {/* Subjourney Management */}
      <SubjourneyManager journey={journey} journeyData={journeyData} setJourneyData={setJourneyData} />
    </div>
  );
};

const SubjourneyManager = ({ journey, journeyData, setJourneyData }) => {
  const [showForm, setShowForm] = useState(false);
  const [subTitle, setSubTitle] = useState("");
  const [subDifficulty, setSubDifficulty] = useState("Easy");
  const [subPriority, setSubPriority] = useState("Next");
  const [subNote, setSubNote] = useState("");
  const addSubjourney = async () => {
    if (!subTitle.trim()) {
      alert("Subjourney title is required.");
      return;
    }
    const newSub = {
      id: Date.now() + Math.random(),
      title: subTitle,
      difficulty: subDifficulty,
      priority: subPriority,
      note: subNote,
      podioLink: "",
      zohoLink: "",
      completedDate: null,
      _ganttVisible: false
    };
    journey.subJourneys = journey.subJourneys ? [...journey.subJourneys, newSub] : [newSub];
    await setJourneyData([...journeyData]);
    setSubTitle("");
    setSubNote("");
    setShowForm(false);
    console.log(`Added subjourney "${newSub.title}" to "${journey.title}".`);
  };

  return (
    <div className="subjourneys-container">
      <h3>Subjourneys</h3>
      <button className="btn" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add Subjourney"}</button>
      {showForm && (
        <div className="subjourney-form">
          <input type="text" placeholder="Subjourney Title" value={subTitle} onChange={e => setSubTitle(e.target.value)} />
          <select value={subDifficulty} onChange={e => setSubDifficulty(e.target.value)}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select value={subPriority} onChange={e => setSubPriority(e.target.value)}>
            <option value="Critical">Critical</option>
            <option value="Important">Important</option>
            <option value="Next">Next</option>
            <option value="Sometime Maybe">Sometime Maybe</option>
          </select>
          <input type="text" placeholder="Subjourney Note" value={subNote} onChange={e => setSubNote(e.target.value)} />
          <button className="btn" onClick={addSubjourney}>Save Subjourney</button>
        </div>
      )}
      {journey.subJourneys && journey.subJourneys.map((sub, idx) => (
        <div key={sub.id} className="subjourney-item">
          <strong>{sub.title}</strong> [{sub.difficulty} | {sub.priority}]
          <p>{sub.note}</p>
          <button className="btn" onClick={async () => {
            if (window.confirm("Delete this subjourney?")) {
              journey.subJourneys.splice(idx, 1);
              await setJourneyData([...journeyData]);
              console.log(`Deleted subjourney "${sub.title}".`);
            }
          }}>Delete</button>
          {/* Additional edit and toggle Gantt buttons can be added here similarly */}
        </div>
      ))}
    </div>
  );
};

export default JourneyDetails;
