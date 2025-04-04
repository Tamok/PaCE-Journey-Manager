// src/services/dateUtils.js

/**
 * Parses a date string and returns a Date object.
 */
export const parseDate = (str) => new Date(str);

/**
 * Converts a Date object to YYYY-MM-DD format.
 * If the date is invalid, logs an error and returns an empty string.
 */
export const toYMD = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error("Invalid date passed to toYMD:", date);
    return "";
  }
  return date.toISOString().split('T')[0];
};

/**
 * Adds a number of days to a Date object.
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Checks if a date falls on a weekend.
 */
export const isWeekend = (date) => [0, 6].includes(date.getDay());

/**
 * Checks if a date is a holiday based on the provided holidays list.
 */
export const isHoliday = (date, holidays = []) =>
  holidays.some((h) => h.date === toYMD(date));

/**
 * Returns the next business day (skipping weekends and holidays).
 */
export const getNextBusinessDay = (date, holidays = []) => {
  let nextDay = new Date(date);
  while (isWeekend(nextDay) || isHoliday(nextDay, holidays)) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
};
