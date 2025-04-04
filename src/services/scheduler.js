// src/services/scheduler.js
import { TIMELINE_START_DATE, PRIORITY_ORDER } from '../constants';
import { getNextBusinessDay, addDays, toYMD } from './dateUtils';

const goalDuration = {
  Easy: 30,
  Medium: 45,
  Hard: 60,
};

export const scheduleGoals = (goals) => {
  let currentDate = new Date(TIMELINE_START_DATE);

  const sortedGoals = goals.sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );

  sortedGoals.forEach((goal) => {
    goal.scheduledStartDate = toYMD(getNextBusinessDay(currentDate));
    const duration = goalDuration[goal.difficulty] || 30;
    goal.scheduledEndDate = toYMD(addDays(currentDate, duration - 1));
    currentDate = getNextBusinessDay(addDays(currentDate, duration));
  });
};
