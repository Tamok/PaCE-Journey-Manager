// src/services/__tests__/holidayGenerator.test.js
import { generateUCSBHolidaysAndBreaks } from '../holidayGenerator';

// Mock dateUtils
jest.mock('../dateUtils', () => ({
  toYMD: jest.fn((date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  }),
  addDays: jest.fn((date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }),
  parseDate: jest.fn((str) => new Date(str)),
}));

describe('holidayGenerator', () => {
  describe('generateUCSBHolidaysAndBreaks', () => {
    it('should generate holidays for a single year', () => {
      const result = generateUCSBHolidaysAndBreaks(2024, 2024);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that all entries have required properties
      result.forEach(holiday => {
        expect(holiday).toHaveProperty('date');
        expect(holiday).toHaveProperty('name');
        expect(typeof holiday.date).toBe('string');
        expect(typeof holiday.name).toBe('string');
      });
    });

    it('should generate holidays for multiple years', () => {
      const result = generateUCSBHolidaysAndBreaks(2024, 2025);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Should have holidays from both years
      const has2024 = result.some(h => h.date.includes('2024'));
      const has2025 = result.some(h => h.date.includes('2025'));
      expect(has2024).toBe(true);
      expect(has2025).toBe(true);
    });

    it('should return sorted holidays by date', () => {
      const result = generateUCSBHolidaysAndBreaks(2024, 2025);
      
      for (let i = 1; i < result.length; i++) {
        const prevDate = new Date(result[i - 1].date);
        const currentDate = new Date(result[i].date);
        expect(currentDate >= prevDate).toBe(true);
      }
    });

    it('should handle single year range', () => {
      const result = generateUCSBHolidaysAndBreaks(2024, 2024);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Most holidays should be from 2024 (academic breaks may span into next year)
      const holidays2024 = result.filter(h => h.date.startsWith('2024'));
      expect(holidays2024.length).toBeGreaterThan(0);
    });

    it('should handle reverse year range gracefully', () => {
      const result = generateUCSBHolidaysAndBreaks(2025, 2024);
      
      // Should still return an array, even if empty or with limited results
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include common US holidays', () => {
      const result = generateUCSBHolidaysAndBreaks(2024, 2024);
      
      // Should include some common holidays
      const holidayNames = result.map(h => h.name.toLowerCase());
      const commonHolidays = ['christmas', 'new year', 'thanksgiving', 'labor day'];
      
      commonHolidays.forEach(holiday => {
        const hasHoliday = holidayNames.some(name => name.includes(holiday));
        expect(hasHoliday).toBe(true);
      });
    });

    it('should include academic breaks', () => {
      const result = generateUCSBHolidaysAndBreaks(2024, 2024);
      
      // Should include some academic breaks
      const breakNames = result.map(h => h.name.toLowerCase());
      const academicBreaks = ['break', 'recess'];
      
      const hasAcademicBreaks = breakNames.some(name => 
        academicBreaks.some(breakType => name.includes(breakType))
      );
      expect(hasAcademicBreaks).toBe(true);
    });

    it('should handle edge case years', () => {
      // Test with years at boundaries
      const result1 = generateUCSBHolidaysAndBreaks(2000, 2000);
      const result2 = generateUCSBHolidaysAndBreaks(2050, 2050);
      
      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });

    it('should not have duplicate holidays', () => {
      const result = generateUCSBHolidaysAndBreaks(2024, 2024);
      
      const dateSet = new Set();
      const duplicates = [];
      
      result.forEach(holiday => {
        const key = `${holiday.date}-${holiday.name}`;
        if (dateSet.has(key)) {
          duplicates.push(holiday);
        } else {
          dateSet.add(key);
        }
      });
      
      expect(duplicates).toHaveLength(0);
    });

    it('should have valid date formats', () => {
      const result = generateUCSBHolidaysAndBreaks(2024, 2024);
      
      result.forEach(holiday => {
        // Check YYYY-MM-DD format
        expect(holiday.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        // Check that date is valid
        const date = new Date(holiday.date);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2024);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025); // Academic breaks may span into next year
        expect(date.getMonth()).toBeGreaterThanOrEqual(0);
        expect(date.getMonth()).toBeLessThan(12);
        expect(date.getDate()).toBeGreaterThan(0);
        expect(date.getDate()).toBeLessThanOrEqual(31);
      });
    });

    it('should log holiday generation info', () => {
      const originalLog = console.log;
      const logs = [];
      console.log = (...args) => logs.push(args.join(' '));
      
      generateUCSBHolidaysAndBreaks(2024, 2024);
      
      console.log = originalLog;
      
      // Should have logged generation info
      const hasGenerationLog = logs.some(log => 
        log.includes('Generated') && log.includes('holiday entries')
      );
      expect(hasGenerationLog).toBe(true);
    });
  });
});