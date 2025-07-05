// src/services/__tests__/dateUtils.test.js
import { parseDate, toYMD, addDays, isWeekend, isHoliday, getNextBusinessDay } from '../dateUtils';

describe('dateUtils', () => {
  describe('parseDate', () => {
    it('should parse valid date strings', () => {
      const result = parseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it('should parse ISO date strings', () => {
      const result = parseDate('2024-01-15T10:30:00.000Z');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
    });

    it('should handle invalid date strings', () => {
      const result = parseDate('invalid-date');
      expect(result).toBeInstanceOf(Date);
      expect(isNaN(result.getTime())).toBe(true);
    });
  });

  describe('toYMD', () => {
    it('should convert Date to YYYY-MM-DD format', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const result = toYMD(date);
      expect(result).toBe('2024-01-15');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2024-03-05T10:30:00.000Z');
      const result = toYMD(date);
      expect(result).toBe('2024-03-05');
    });

    it('should handle invalid dates', () => {
      const invalidDate = new Date('invalid');
      const result = toYMD(invalidDate);
      expect(result).toBe('');
    });

    it('should handle null/undefined input', () => {
      const result1 = toYMD(null);
      const result2 = toYMD(undefined);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });

    it('should handle non-Date objects', () => {
      const result = toYMD('not-a-date');
      expect(result).toBe('');
    });
  });

  describe('addDays', () => {
    it('should add positive days', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 5);
      expect(toYMD(result)).toBe('2024-01-20');
    });

    it('should add negative days', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, -5);
      expect(toYMD(result)).toBe('2024-01-10');
    });

    it('should handle zero days', () => {
      const date = new Date('2024-01-15');
      const result = addDays(date, 0);
      expect(toYMD(result)).toBe('2024-01-15');
    });

    it('should handle month boundaries', () => {
      const date = new Date('2024-01-31');
      const result = addDays(date, 1);
      expect(toYMD(result)).toBe('2024-02-01');
    });

    it('should handle year boundaries', () => {
      const date = new Date('2023-12-31');
      const result = addDays(date, 1);
      expect(toYMD(result)).toBe('2024-01-01');
    });

    it('should not modify the original date', () => {
      const date = new Date('2024-01-15');
      const originalTime = date.getTime();
      addDays(date, 5);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      const saturday = new Date('2024-01-13'); // Saturday
      expect(isWeekend(saturday)).toBe(true);
    });

    it('should return true for Sunday', () => {
      const sunday = new Date('2024-01-14'); // Sunday
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekdays', () => {
      const monday = new Date('2024-01-15'); // Monday
      const friday = new Date('2024-01-19'); // Friday
      expect(isWeekend(monday)).toBe(false);
      expect(isWeekend(friday)).toBe(false);
    });
  });

  describe('isHoliday', () => {
    const holidays = [
      { date: '2024-01-01', name: 'New Year' },
      { date: '2024-12-25', name: 'Christmas' },
    ];

    it('should return true for holiday dates', () => {
      const newYear = new Date('2024-01-01');
      const christmas = new Date('2024-12-25');
      expect(isHoliday(newYear, holidays)).toBe(true);
      expect(isHoliday(christmas, holidays)).toBe(true);
    });

    it('should return false for non-holiday dates', () => {
      const regularDay = new Date('2024-01-15');
      expect(isHoliday(regularDay, holidays)).toBe(false);
    });

    it('should handle empty holidays array', () => {
      const date = new Date('2024-01-01');
      expect(isHoliday(date, [])).toBe(false);
    });

    it('should handle undefined holidays', () => {
      const date = new Date('2024-01-01');
      expect(isHoliday(date)).toBe(false);
    });
  });

  describe('getNextBusinessDay', () => {
    const holidays = [
      { date: '2024-01-01', name: 'New Year' },
      { date: '2024-01-15', name: 'MLK Day' },
    ];

    it('should return same date if already a business day', () => {
      const monday = new Date('2024-01-08'); // Monday, not a holiday
      const result = getNextBusinessDay(monday, holidays);
      expect(toYMD(result)).toBe('2024-01-08');
    });

    it('should skip weekends', () => {
      const saturday = new Date('2024-01-13'); // Saturday
      const result = getNextBusinessDay(saturday, holidays);
      expect(toYMD(result)).toBe('2024-01-16'); // Next Tuesday (MLK Day is Monday)
    });

    it('should skip holidays', () => {
      const holiday = new Date('2024-01-01'); // New Year (Monday)
      const result = getNextBusinessDay(holiday, holidays);
      expect(toYMD(result)).toBe('2024-01-02'); // Next business day
    });

    it('should skip both weekends and holidays', () => {
      const friday = new Date('2024-01-12'); // Friday before MLK weekend
      const result = getNextBusinessDay(friday, holidays);
      expect(toYMD(result)).toBe('2024-01-12'); // Friday is business day
    });

    it('should handle empty holidays array', () => {
      const saturday = new Date('2024-01-13'); // Saturday
      const result = getNextBusinessDay(saturday, []);
      expect(toYMD(result)).toBe('2024-01-15'); // Next Monday
    });

    it('should handle multiple consecutive non-business days', () => {
      const holidays2 = [
        { date: '2024-01-15', name: 'Holiday 1' },
        { date: '2024-01-16', name: 'Holiday 2' },
      ];
      const saturday = new Date('2024-01-13'); // Saturday
      const result = getNextBusinessDay(saturday, holidays2);
      expect(toYMD(result)).toBe('2024-01-17'); // Next Wednesday
    });
  });
});