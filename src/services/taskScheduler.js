// src/services/taskScheduler.js
import { getNextBusinessDay, addDays, toYMD } from './dateUtils';
import { TIMELINE_START_DATE } from '../constants';

/**
 * We use difficultyScales to scale durations from the tasks array.
 * The tasks array must contain: { id, name, duration, dependencies, isApproval? }
 */
const difficultyScales = { Easy: 1, Medium: 1.5, Hard: 2 };

const incrementDays = 3.5; // half-week increments

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
 * Calculates start/end positions for each task based on dependencies and difficulty.
 * Returns an object keyed by task.id => { startDate, endDate, task }
 */
export const calculateTaskPositions = (tasks, startDate, difficulty, holidays = []) => {
  const positions = {};
  const scale = difficultyScales[difficulty] || 1;

  let baseDate = new Date(startDate);
  if (isNaN(baseDate.getTime())) {
    console.error("Invalid start date in taskScheduler:", startDate, "Defaulting to TIMELINE_START_DATE");
    baseDate = new Date(TIMELINE_START_DATE);
  }

  // Process tasks in the order they appear in the array
  tasks.forEach(task => {
    // Determine earliest start based on dependencies
    const earliestDepEnd = task.dependencies.reduce((latest, depId) => {
      const depPos = positions[depId];
      if (!depPos) return latest;
      return depPos.endDate > latest ? depPos.endDate : latest;
    }, toYMD(baseDate));

    const earliestStartDate = getNextBusinessDay(new Date(earliestDepEnd), holidays);
    // Duration in days (each "duration" = 0.5 weeks => * 3.5 days, then scaled by difficulty)
    const totalDays = Math.round(task.duration * incrementDays * scale);

    let end = addDays(earliestStartDate, totalDays - 1);
    end = adjustForHolidays(earliestStartDate, end, holidays);

    positions[task.id] = {
      startDate: toYMD(earliestStartDate),
      endDate: toYMD(end),
      task
    };
  });

  return positions;
};
