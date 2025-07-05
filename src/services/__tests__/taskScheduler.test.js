// src/services/__tests__/taskScheduler.test.js
import { calculateTaskPositions } from '../taskScheduler';

// Mock the dateUtils module
jest.mock('../dateUtils', () => ({
  getNextBusinessDay: jest.fn((date) => date),
  addDays: jest.fn((date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }),
  toYMD: jest.fn((date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  }),
}));

describe('taskScheduler', () => {
  describe('calculateTaskPositions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle empty tasks array', () => {
      const result = calculateTaskPositions([], '2024-01-01', 'Medium');
      expect(result).toEqual({});
    });

    it('should schedule tasks without dependencies', () => {
      const tasks = [
        { id: 'task1', name: 'Task 1', duration: 2, dependencies: [] },
        { id: 'task2', name: 'Task 2', duration: 1, dependencies: [] },
      ];
      const result = calculateTaskPositions(tasks, '2024-01-01', 'Medium');
      
      expect(result).toHaveProperty('task1');
      expect(result).toHaveProperty('task2');
      expect(result.task1.task).toEqual(tasks[0]);
      expect(result.task2.task).toEqual(tasks[1]);
    });

    it('should schedule tasks with dependencies in correct order', () => {
      const tasks = [
        { id: 'task1', name: 'Task 1', duration: 2, dependencies: [] },
        { id: 'task2', name: 'Task 2', duration: 1, dependencies: ['task1'] },
      ];
      const result = calculateTaskPositions(tasks, '2024-01-01', 'Medium');
      
      expect(result).toHaveProperty('task1');
      expect(result).toHaveProperty('task2');
      
      // Task 2 should start after task 1 ends
      const task1End = new Date(result.task1.endDate);
      const task2Start = new Date(result.task2.startDate);
      expect(task2Start >= task1End).toBe(true);
    });

    it('should handle multiple dependencies', () => {
      const tasks = [
        { id: 'task1', name: 'Task 1', duration: 1, dependencies: [] },
        { id: 'task2', name: 'Task 2', duration: 1, dependencies: [] },
        { id: 'task3', name: 'Task 3', duration: 1, dependencies: ['task1', 'task2'] },
      ];
      const result = calculateTaskPositions(tasks, '2024-01-01', 'Medium');
      
      expect(result).toHaveProperty('task3');
      expect(result.task3.task).toEqual(tasks[2]);
    });

    it('should apply difficulty scaling correctly', () => {
      const tasks = [
        { id: 'task1', name: 'Task 1', duration: 2, dependencies: [] },
      ];
      
      const easyResult = calculateTaskPositions(tasks, '2024-01-01', 'Easy');
      const hardResult = calculateTaskPositions(tasks, '2024-01-01', 'Hard');
      
      // Hard tasks should take longer than easy tasks
      const easyDuration = new Date(easyResult.task1.endDate) - new Date(easyResult.task1.startDate);
      const hardDuration = new Date(hardResult.task1.endDate) - new Date(hardResult.task1.startDate);
      expect(hardDuration).toBeGreaterThan(easyDuration);
    });

    it('should handle invalid start date', () => {
      const tasks = [
        { id: 'task1', name: 'Task 1', duration: 1, dependencies: [] },
      ];
      
      // Should not throw error with invalid date
      expect(() => {
        calculateTaskPositions(tasks, 'invalid-date', 'Medium');
      }).not.toThrow();
    });

    it('should handle missing dependencies gracefully', () => {
      const tasks = [
        { id: 'task1', name: 'Task 1', duration: 1, dependencies: ['nonexistent'] },
      ];
      
      const result = calculateTaskPositions(tasks, '2024-01-01', 'Medium');
      expect(result).toHaveProperty('task1');
      expect(result.task1.task).toEqual(tasks[0]);
    });

    it('should handle circular dependencies without infinite loop', () => {
      const tasks = [
        { id: 'task1', name: 'Task 1', duration: 1, dependencies: ['task2'] },
        { id: 'task2', name: 'Task 2', duration: 1, dependencies: ['task1'] },
      ];
      
      // Should complete in reasonable time (not infinite loop)
      const startTime = Date.now();
      const result = calculateTaskPositions(tasks, '2024-01-01', 'Medium');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result).toHaveProperty('task1');
      expect(result).toHaveProperty('task2');
    });

    it('should handle holidays parameter', () => {
      const tasks = [
        { id: 'task1', name: 'Task 1', duration: 1, dependencies: [] },
      ];
      const holidays = [
        { date: '2024-01-01', name: 'New Year' },
      ];
      
      const result = calculateTaskPositions(tasks, '2024-01-01', 'Medium', holidays);
      expect(result).toHaveProperty('task1');
    });

    it('should preserve task properties in result', () => {
      const tasks = [
        { 
          id: 'task1', 
          name: 'Task 1', 
          duration: 1, 
          dependencies: [],
          isApproval: true,
          customProperty: 'test' 
        },
      ];
      
      const result = calculateTaskPositions(tasks, '2024-01-01', 'Medium');
      expect(result.task1.task.isApproval).toBe(true);
      expect(result.task1.task.customProperty).toBe('test');
    });
  });
});