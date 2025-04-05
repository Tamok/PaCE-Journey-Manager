// src/components/AddGoalForm.jsx
import React, { useState } from 'react';
import '../styles/journeyDetails.css';

const AddGoalForm = ({ onAddGoal, role }) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Critical');
  const [difficulty, setDifficulty] = useState('Easy');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }
    const newGoal = {
      id: Date.now().toString(),
      title,
      priority,
      difficulty,
      note,
      scheduledStartDate: new Date().toISOString().slice(0, 10),
      completedDate: null,
      subGoals: []
    };
    onAddGoal(newGoal);
    setTitle('');
    setPriority('Critical');
    setDifficulty('Easy');
    setNote('');
    setShowForm(false);
  };

  if (role !== 'admin') return null;

  return (
    <div className="add-journey-form">
      <button className="btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add Goal'}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal Title"
              required
            />
          </label>
          <label>
            Priority:
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Critical">Critical</option>
              <option value="Important">Important</option>
              <option value="Next">Next</option>
              <option value="Sometime Maybe">Sometime Maybe</option>
            </select>
          </label>
          <label>
            Difficulty:
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="Easy">Easy (1 month)</option>
              <option value="Medium">Medium (1.5 months)</option>
              <option value="Hard">Hard (2 months)</option>
            </select>
          </label>
          <label>
            Note:
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
            />
          </label>
          <button type="submit" className="btn">Save Goal</button>
        </form>
      )}
    </div>
  );
};

export default AddGoalForm;
