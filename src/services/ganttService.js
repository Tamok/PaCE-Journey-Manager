// src/services/ganttService.js

import { addDays, toYMD, getNextBusinessDay } from './dateUtils';
import { TIMELINE_START_DATE } from '../constants';

const DEFAULT_TASKS = [
  { id: 'diagram', name: 'Diagram Building', durationWeeks: 1, dependencies: [] },
  { id: 'content', name: 'Content Creation', durationWeeks: 1, dependencies: ['diagram'] },
  { id: 'creative', name: 'Creative Development', durationWeeks: 1, dependencies: ['content'] },
  { id: 'pmApproval', name: 'PM Approval', durationWeeks: 1, dependencies: ['creative'], approval: true },
  { id: 'revision', name: 'Final Template Revision', durationWeeks: 1, dependencies: ['pmApproval'] },
];

export const generateGanttData = (goal, holidays = []) => {
  const baseDate = new Date(goal.scheduledStartDate || TIMELINE_START_DATE);
  const tasks = DEFAULT_TASKS.map((task) => {
    const startOffsetWeeks = DEFAULT_TASKS
      .slice(0, DEFAULT_TASKS.indexOf(task))
      .reduce((sum, t) => sum + t.durationWeeks, 0);

    const startDate = getNextBusinessDay(addDays(baseDate, startOffsetWeeks * 7), holidays);
    const endDate = addDays(startDate, task.durationWeeks * 7 - 1);

    return {
      ...task,
      startDate: toYMD(startDate),
      endDate: toYMD(endDate),
      approved: false,
    };
  });

  return tasks;
};
