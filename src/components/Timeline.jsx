// src/components/Timeline.jsx
import React from 'react';
import { toYMD } from '../services/scheduler';
import '../styles/timeline.css';

const Timeline = ({ journeyData, onSelectJourney, role, onReorder }) => {
  const topJourneys = journeyData.filter(journey => !journey.parentId);

  const handleClick = (index) => {
    onSelectJourney(index);
  };

  const handleDragStart = (e, index) => {
    if (role !== 'admin') return;
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, dropIndex) => {
    if (role !== 'admin') return;
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex !== dropIndex) {
      onReorder(dragIndex, dropIndex);
    }
  };

  return (
    <div className="timeline-container">
      {topJourneys.map((journey, index) => {
        const startDate = journey.scheduledStartDate ? new Date(journey.scheduledStartDate) : null;
        const startStr = startDate ? startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
        const fullDate = startDate ? startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';
        return (
          <div
            key={journey.id}
            className={`timeline-item ${journey.completedDate ? 'completed' : ''} ${journey.priority.toLowerCase().replace(/ /g, '-')}`}
            draggable={role === 'admin' && !journey.completedDate}
            onDragStart={(e) => handleDragStart(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => handleClick(index)}
            title={fullDate}
          >
            <strong>{journey.title}</strong>
            <span className="date-label">{startStr}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
