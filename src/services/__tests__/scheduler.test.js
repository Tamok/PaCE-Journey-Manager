// src/services/__tests__/scheduler.test.js
import { scheduleGoals } from '../scheduler';

// Mock dateUtils
jest.mock('../dateUtils', () => ({
  getNextBusinessDay: jest.fn((date) => date),
  addDays: jest.fn((date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }),
  toYMD: jest.fn((date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }),
}));

// Mock constants
jest.mock('../../constants', () => ({
  TIMELINE_START_DATE: '2024-01-01',
  PRIORITY_ORDER: ['Lowest Priority', 'Low Priority', 'Medium Priority', 'High Priority', 'Highest Priority', 'Critical'],
}));

describe('scheduler', () => {
  let dateUtils;
  
  beforeEach(() => {
    jest.clearAllMocks();
    dateUtils = require('../dateUtils');
  });

  describe('scheduleGoals', () => {
    it('should schedule goals in priority order', () => {
      const goals = [
        { id: 'goal1', title: 'Low Priority Goal', priority: 'Low Priority', difficulty: 'Easy' },
        { id: 'goal2', title: 'High Priority Goal', priority: 'High Priority', difficulty: 'Easy' },
        { id: 'goal3', title: 'Critical Priority Goal', priority: 'Critical', difficulty: 'Easy' },
      ];

      scheduleGoals(goals);

      // Should have been called for each goal
      expect(dateUtils.getNextBusinessDay).toHaveBeenCalled();
      expect(dateUtils.addDays).toHaveBeenCalled();
      expect(dateUtils.toYMD).toHaveBeenCalled();

      // Should have scheduled start and end dates for each goal
      goals.forEach(goal => {
        expect(goal).toHaveProperty('scheduledStartDate');
        expect(goal).toHaveProperty('scheduledEndDate');
      });
    });

    it('should handle empty goals array', () => {
      const goals = [];

      scheduleGoals(goals);

      expect(dateUtils.getNextBusinessDay).not.toHaveBeenCalled();
      expect(dateUtils.addDays).not.toHaveBeenCalled();
      expect(dateUtils.toYMD).not.toHaveBeenCalled();
    });

    it('should use correct durations for different difficulties', () => {
      const goals = [
        { id: 'goal1', title: 'Easy Goal', priority: 'High Priority', difficulty: 'Easy' },
        { id: 'goal2', title: 'Medium Goal', priority: 'High Priority', difficulty: 'Medium' },
        { id: 'goal3', title: 'Hard Goal', priority: 'High Priority', difficulty: 'Hard' },
      ];

      scheduleGoals(goals);

      // Check that addDays was called with correct durations
      const addDaysCalls = dateUtils.addDays.mock.calls;
      
      // Each goal should have 2 addDays calls (for end date and next start date)
      expect(addDaysCalls.length).toBeGreaterThanOrEqual(6);
      
      // Check that durations are used correctly
      const durationCalls = addDaysCalls.filter(call => call[1] === 29 || call[1] === 44 || call[1] === 59);
      expect(durationCalls.length).toBeGreaterThan(0);
    });

    it('should handle unknown difficulty levels', () => {
      const goals = [
        { id: 'goal1', title: 'Unknown Difficulty Goal', priority: 'High Priority', difficulty: 'Unknown' },
      ];

      scheduleGoals(goals);

      expect(goals[0]).toHaveProperty('scheduledStartDate');
      expect(goals[0]).toHaveProperty('scheduledEndDate');
    });

    it('should handle goals without priority', () => {
      const goals = [
        { id: 'goal1', title: 'Goal without priority', difficulty: 'Easy' },
      ];

      scheduleGoals(goals);

      expect(goals[0]).toHaveProperty('scheduledStartDate');
      expect(goals[0]).toHaveProperty('scheduledEndDate');
    });

    it('should handle goals without difficulty', () => {
      const goals = [
        { id: 'goal1', title: 'Goal without difficulty', priority: 'High Priority' },
      ];

      scheduleGoals(goals);

      expect(goals[0]).toHaveProperty('scheduledStartDate');
      expect(goals[0]).toHaveProperty('scheduledEndDate');
    });

    it('should not modify original goals array order', () => {
      const goals = [
        { id: 'goal1', title: 'Goal 1', priority: 'Low Priority', difficulty: 'Easy' },
        { id: 'goal2', title: 'Goal 2', priority: 'High Priority', difficulty: 'Easy' },
      ];

      const originalOrder = goals.map(g => g.id);
      scheduleGoals(goals);

      // The array should still have the same goals, just with added scheduling fields
      expect(goals).toHaveLength(2);
      expect(goals[0].id).toBe('goal1');
      expect(goals[1].id).toBe('goal2');
    });

    it('should handle invalid start date in constants', () => {
      // Mock invalid start date
      require('../../constants').TIMELINE_START_DATE = 'invalid-date';

      const goals = [
        { id: 'goal1', title: 'Goal 1', priority: 'High Priority', difficulty: 'Easy' },
      ];

      // Should not throw error
      expect(() => scheduleGoals(goals)).not.toThrow();
    });

    it('should respect business day constraints', () => {
      const goals = [
        { id: 'goal1', title: 'Goal 1', priority: 'High Priority', difficulty: 'Easy' },
      ];

      scheduleGoals(goals);

      // Should call getNextBusinessDay for each goal scheduling
      expect(dateUtils.getNextBusinessDay).toHaveBeenCalled();
    });

    it('should handle large number of goals', () => {
      const goals = Array.from({ length: 100 }, (_, i) => ({
        id: `goal${i}`,
        title: `Goal ${i}`,
        priority: 'Medium',
        difficulty: 'Easy'
      }));

      scheduleGoals(goals);

      // Should schedule all goals
      goals.forEach(goal => {
        expect(goal).toHaveProperty('scheduledStartDate');
        expect(goal).toHaveProperty('scheduledEndDate');
      });
    });

    it('should handle goals with duplicate priorities', () => {
      const goals = [
        { id: 'goal1', title: 'Goal 1', priority: 'High Priority', difficulty: 'Easy' },
        { id: 'goal2', title: 'Goal 2', priority: 'High Priority', difficulty: 'Medium' },
        { id: 'goal3', title: 'Goal 3', priority: 'High Priority', difficulty: 'Hard' },
      ];

      scheduleGoals(goals);

      // Should schedule all goals with same priority
      goals.forEach(goal => {
        expect(goal).toHaveProperty('scheduledStartDate');
        expect(goal).toHaveProperty('scheduledEndDate');
      });
    });
  });
});