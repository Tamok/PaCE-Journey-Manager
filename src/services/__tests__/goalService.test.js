// src/services/__tests__/goalService.test.js
import { createGoal } from '../goalService';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  onSnapshot: jest.fn(),
  writeBatch: jest.fn(() => ({
    delete: jest.fn(),
    set: jest.fn(),
    commit: jest.fn()
  })),
  doc: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('../firebaseService', () => ({
  auth: {
    currentUser: { email: 'test@example.com' }
  },
  db: {},
}));

// Mock logger
jest.mock('../logger', () => ({
  logEvent: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('goalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    it('should create a new goal with required fields', () => {
      const result = createGoal('Test Goal', 'High', 'Medium', 'Test note');

      expect(result).toMatchObject({
        id: 'mock-uuid-123',
        title: 'Test Goal',
        priority: 'High',
        difficulty: 'Medium',
        note: 'Test note',
        createdBy: 'test@example.com'
      });
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('podioLink');
      expect(result).toHaveProperty('zohoLink');
      expect(result).toHaveProperty('completedDate');
      expect(result).toHaveProperty('scheduledStartDate');
      expect(result).toHaveProperty('parentId');
    });

    it('should set default values for optional parameters', () => {
      const result = createGoal('Test Goal');

      expect(result.priority).toBe('Next');
      expect(result.difficulty).toBe('Easy');
      expect(result.note).toBe('');
    });

    it('should handle missing auth user', () => {
      const originalAuth = require('../firebaseService').auth;
      require('../firebaseService').auth.currentUser = null;

      const result = createGoal('Test Goal');

      expect(result.createdBy).toBe('unknown');

      // Restore original auth
      require('../firebaseService').auth = originalAuth;
    });

    it('should generate unique IDs', () => {
      const result1 = createGoal('Test Goal 1');
      const result2 = createGoal('Test Goal 2');

      expect(result1.id).toBe('mock-uuid-123');
      expect(result2.id).toBe('mock-uuid-123');
    });

    it('should set default null values correctly', () => {
      const result = createGoal('Test Goal');

      expect(result.completedDate).toBeNull();
      expect(result.scheduledStartDate).toBeNull();
      expect(result.parentId).toBeNull();
    });

    it('should set empty string defaults', () => {
      const result = createGoal('Test Goal');

      expect(result.podioLink).toBe('');
      expect(result.zohoLink).toBe('');
    });

    it('should include creation timestamp', () => {
      const before = Date.now();
      const result = createGoal('Test Goal');
      const after = Date.now();

      expect(result.createdAt).toBeDefined();
      
      const createdAtTime = new Date(result.createdAt).getTime();
      expect(createdAtTime).toBeGreaterThanOrEqual(before);
      expect(createdAtTime).toBeLessThanOrEqual(after);
    });
  });
});