// src/services/taskScheduler.js
import { getNextBusinessDay, addDays, toYMD } from './dateUtils';
import { TIMELINE_START_DATE } from '../constants';

const difficultyScales = { Easy: 1, Medium: 1.5, Hard: 2 };

const adjustForHolidays = (start, end, holidays) => {
  let current = new Date(start);
  let extraDays = 0;
  while (current <= end) {
    if (holidays.length && holidays.some(h => h.date === toYMD(current))) extraDays++;
    current = addDays(current, 1);
  }
  return addDays(end, extraDays);
};

/**
 * Calculates task positions based on dependencies and difficulty.
 */
export const calculateTaskPositions = (tasks, startDate, difficulty, holidays = []) => {
  const positions = {};
  const scale = difficultyScales[difficulty] || 1;
  const incrementDays = 3.5; // Half-week increments

  // Validate startDate
  let baseDate = new Date(startDate);
  if (isNaN(baseDate.getTime())) {
    console.error("Invalid start date in taskScheduler:", startDate, "Defaulting to TIMELINE_START_DATE");
    baseDate = new Date(TIMELINE_START_DATE);
  }

  tasks.forEach(task => {
    // Determine earliest start based on dependencies
    const earliestStart = task.dependencies.reduce((latest, depId) => {
      if (positions[depId] && positions[depId].endDate) {
        // Compare as ISO strings; they are comparable when in YYYY-MM-DD format.
        return positions[depId].endDate > latest ? positions[depId].endDate : latest;
      }
      return latest;
    }, toYMD(baseDate));

    const start = getNextBusinessDay(new Date(earliestStart), holidays);
    const durationDays = task.duration * incrementDays * scale;
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
