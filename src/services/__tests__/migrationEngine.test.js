// src/services/__tests__/migrationEngine.test.js
import { migrateGoals } from '../migrationEngine';

// Mock the logger
jest.mock('../logger', () => ({
  logEvent: jest.fn(),
}));

// Mock crypto for uuid generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-123'),
  },
  writable: true,
});

describe('migrationEngine', () => {
  describe('migrateGoals', () => {
    it('should handle empty goals array', () => {
      const result = migrateGoals([], '0.0.0');
      expect(result).toEqual([]);
    });

    it('should not modify goals if already at current version', () => {
      const goals = [
        { id: 'goal1', title: 'Test Goal', version: '0.5.4' }
      ];
      const result = migrateGoals(goals, '0.5.4');
      expect(result).toEqual(goals);
    });

    it('should add missing IDs in version 0.5.1', () => {
      const goals = [
        { title: 'Goal without ID' }
      ];
      const result = migrateGoals(goals, '0.5.0');
      expect(result[0]).toHaveProperty('id');
      expect(result[0].id).toBe('mock-uuid-123');
    });

    it('should add missing note field in version 0.5.2', () => {
      const goals = [
        { id: 'goal1', title: 'Test Goal' }
      ];
      const result = migrateGoals(goals, '0.5.1');
      expect(result[0]).toHaveProperty('note');
      expect(result[0].note).toBe('');
    });

    it('should rename childGoals to subGoals in version 0.5.3', () => {
      const goals = [
        { 
          id: 'goal1', 
          title: 'Parent Goal',
          childGoals: [{ id: 'child1', title: 'Child Goal' }]
        }
      ];
      const result = migrateGoals(goals, '0.5.2');
      expect(result[0]).toHaveProperty('subGoals');
      expect(result[0]).not.toHaveProperty('childGoals');
      expect(result[0].subGoals).toEqual([{ id: 'child1', title: 'Child Goal' }]);
    });

    it('should remove isChild property in version 0.5.3', () => {
      const goals = [
        { id: 'goal1', title: 'Test Goal', isChild: true }
      ];
      const result = migrateGoals(goals, '0.5.2');
      expect(result[0]).not.toHaveProperty('isChild');
    });

    it('should replace "child" with "sub-goal" in titles in version 0.5.3', () => {
      const goals = [
        { id: 'goal1', title: 'This is a child goal' },
        { id: 'goal2', title: 'Child Goal Example' },
        { id: 'goal3', title: 'CHILD GOAL CAPS' }
      ];
      const result = migrateGoals(goals, '0.5.2');
      expect(result[0].title).toBe('This is a sub-goal goal');
      expect(result[1].title).toBe('sub-goal Goal Example');
      expect(result[2].title).toBe('sub-goal GOAL CAPS');
    });

    it('should add missing fields in version 0.5.4', () => {
      const goals = [
        { title: 'Goal without required fields' }
      ];
      const result = migrateGoals(goals, '0.5.3');
      const migratedGoal = result[0];
      
      expect(migratedGoal).toHaveProperty('id');
      expect(migratedGoal).toHaveProperty('createdAt');
      expect(migratedGoal).toHaveProperty('createdBy');
      expect(migratedGoal).toHaveProperty('difficulty');
      expect(migratedGoal).toHaveProperty('taskTemplate');
      
      expect(migratedGoal.createdBy).toBe('import');
      expect(migratedGoal.difficulty).toBe('Medium');
      expect(migratedGoal.taskTemplate).toBe('journeyTemplate');
    });

    it('should set difficulty to Hard for subgoals in version 0.5.4', () => {
      const goals = [
        { title: 'Goal with subOf', subOf: 'Parent Goal' }
      ];
      const result = migrateGoals(goals, '0.5.3');
      expect(result[0].difficulty).toBe('Hard');
    });

    it('should link sub-goals to parents by matching titles in version 0.5.4', () => {
      const goals = [
        { title: 'Parent Goal', id: 'parent-id' },
        { title: 'Sub Goal', subOf: 'Parent Goal' }
      ];
      const result = migrateGoals(goals, '0.5.3');
      
      expect(result[1]).toHaveProperty('parentId');
      expect(result[1].parentId).toBe('parent-id');
      expect(result[1]).not.toHaveProperty('subOf');
    });

    it('should handle subOf with no matching parent in version 0.5.4', () => {
      const goals = [
        { title: 'Sub Goal', subOf: 'Nonexistent Parent' }
      ];
      const result = migrateGoals(goals, '0.5.3');
      
      expect(result[0]).not.toHaveProperty('subOf');
      expect(result[0]).not.toHaveProperty('parentId');
    });

    it('should apply multiple migrations in sequence', () => {
      const goals = [
        { 
          title: 'Child goal without ID',
          childGoals: [{ title: 'Nested child' }],
          isChild: true
        }
      ];
      const result = migrateGoals(goals, '0.0.0');
      
      // Should have applied all migrations
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('note');
      expect(result[0]).toHaveProperty('subGoals');
      expect(result[0]).not.toHaveProperty('childGoals');
      expect(result[0]).not.toHaveProperty('isChild');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('createdBy');
      expect(result[0]).toHaveProperty('difficulty');
      expect(result[0]).toHaveProperty('taskTemplate');
      expect(result[0].title).toBe('sub-goal goal without ID');
    });

    it('should handle goals with existing required fields in version 0.5.4', () => {
      const goals = [
        { 
          id: 'existing-id',
          title: 'Existing Goal',
          createdAt: '2023-01-01T00:00:00.000Z',
          createdBy: 'user123',
          difficulty: 'Easy',
          taskTemplate: 'customTemplate'
        }
      ];
      const result = migrateGoals(goals, '0.5.3');
      
      // Should not overwrite existing values
      expect(result[0].id).toBe('existing-id');
      expect(result[0].createdAt).toBe('2023-01-01T00:00:00.000Z');
      expect(result[0].createdBy).toBe('user123');
      expect(result[0].difficulty).toBe('Easy');
      expect(result[0].taskTemplate).toBe('customTemplate');
    });

    it('should handle crypto.randomUUID not available', () => {
      const originalCrypto = global.crypto;
      global.crypto = {};
      
      const goals = [
        { title: 'Goal without ID' }
      ];
      
      const result = migrateGoals(goals, '0.5.0');
      expect(result[0]).toHaveProperty('id');
      expect(typeof result[0].id).toBe('string');
      expect(result[0].id.length).toBeGreaterThan(0);
      
      global.crypto = originalCrypto;
    });
  });
});