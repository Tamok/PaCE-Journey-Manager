// src/services/__tests__/taskCompletion.test.js
import { canCompleteTask, calculateCompletion } from '../taskCompletion';

describe('taskCompletion', () => {
  describe('canCompleteTask', () => {
    const mockTaskPositions = {
      'task1': { task: { id: 'task1', dependencies: [] } },
      'task2': { task: { id: 'task2', dependencies: ['task1'] } },
      'task3': { task: { id: 'task3', dependencies: ['task1', 'task2'] } },
    };

    it('should return true when task has no dependencies', () => {
      const result = canCompleteTask('task1', mockTaskPositions, []);
      expect(result).toBe(true);
    });

    it('should return true when all dependencies are completed', () => {
      const result = canCompleteTask('task2', mockTaskPositions, ['task1']);
      expect(result).toBe(true);
    });

    it('should return false when dependencies are not completed', () => {
      const result = canCompleteTask('task2', mockTaskPositions, []);
      expect(result).toBe(false);
    });

    it('should return false when only some dependencies are completed', () => {
      const result = canCompleteTask('task3', mockTaskPositions, ['task1']);
      expect(result).toBe(false);
    });

    it('should return true when all multiple dependencies are completed', () => {
      const result = canCompleteTask('task3', mockTaskPositions, ['task1', 'task2']);
      expect(result).toBe(true);
    });
  });

  describe('calculateCompletion', () => {
    it('should return 0 for empty taskPositions', () => {
      const result = calculateCompletion({}, []);
      expect(result).toBe(0);
    });

    it('should return 0 for null taskPositions', () => {
      const result = calculateCompletion(null, []);
      expect(result).toBe(0);
    });

    it('should calculate completion percentage correctly with regular tasks', () => {
      const taskPositions = {
        'task1': { task: { id: 'task1', isApproval: false } },
        'task2': { task: { id: 'task2', isApproval: false } },
      };
      const completedTasks = ['task1'];
      const result = calculateCompletion(taskPositions, completedTasks);
      expect(result).toBe(50); // 1 out of 2 tasks completed
    });

    it('should calculate completion percentage correctly with approval tasks', () => {
      const taskPositions = {
        'task1': { task: { id: 'task1', isApproval: true } },
        'task2': { task: { id: 'task2', isApproval: false } },
      };
      const completedTasks = ['task1'];
      const result = calculateCompletion(taskPositions, completedTasks);
      expect(result).toBe(33); // 1 weight out of 3 total weight (1 approval + 2 regular)
    });

    it('should handle mixed task types correctly', () => {
      const taskPositions = {
        'approval1': { task: { id: 'approval1', isApproval: true } },
        'approval2': { task: { id: 'approval2', isApproval: true } },
        'regular1': { task: { id: 'regular1', isApproval: false } },
        'regular2': { task: { id: 'regular2', isApproval: false } },
      };
      const completedTasks = ['approval1', 'regular1'];
      const result = calculateCompletion(taskPositions, completedTasks);
      expect(result).toBe(50); // 3 weight out of 6 total weight (2 approvals + 4 regular)
    });

    it('should handle completed tasks not in taskPositions', () => {
      const taskPositions = {
        'task1': { task: { id: 'task1', isApproval: false } },
      };
      const completedTasks = ['task1', 'nonexistent'];
      const result = calculateCompletion(taskPositions, completedTasks);
      expect(result).toBe(100); // Only valid tasks count
    });

    it('should return 100 when all tasks are completed', () => {
      const taskPositions = {
        'task1': { task: { id: 'task1', isApproval: false } },
        'task2': { task: { id: 'task2', isApproval: true } },
      };
      const completedTasks = ['task1', 'task2'];
      const result = calculateCompletion(taskPositions, completedTasks);
      expect(result).toBe(100);
    });
  });
});