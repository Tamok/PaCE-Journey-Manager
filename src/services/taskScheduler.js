// src/services/taskScheduler.js
import { getNextBusinessDay, addDays, isHoliday, toYMD } from './dateUtils';

// Difficulty Scaling
const difficultyScales = { Easy: 1, Medium: 1.5, Hard: 2 };

// Calculates tasks dynamically based on dependencies and duration increments
export const calculateTaskPositions = (tasks, startDate, difficulty, holidays = []) => {
  const positions = {};
  const scale = difficultyScales[difficulty] || 1;
  const incrementDays = 3.5; // Half-week increments

  tasks.forEach(task => {
    const earliestStart = task.dependencies.reduce((latest, depId) => {
      const depEnd = positions[depId].endDate;
      return depEnd > latest ? depEnd : latest;
    }, startDate);

    let start = getNextBusinessDay(new Date(earliestStart), holidays);
    let durationDays = task.duration * incrementDays * scale;

    let end = addDays(start, durationDays - 1);
    end = adjustForHolidays(start, end, holidays);

    positions[task.id] = {
      startDate: toYMD(start),
      endDate: toYMD(end),
      task
    };
  });

  return positions;
};

// Adjusts end date for holidays spanning task duration
const adjustForHolidays = (start, end, holidays) => {
  let current = new Date(start);
  let extraDays = 0;
  while (current <= end) {
    if (isHoliday(current, holidays)) extraDays++;
    current = addDays(current, 1);
  }
  return addDays(end, extraDays);
};
