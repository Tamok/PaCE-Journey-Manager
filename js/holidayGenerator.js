/**
 * holidayGenerator.js
 *
 * This module dynamically generates standard U.S. holidays
 * and UCSB academic break closures for any year range based on
 * configurable formulas rather than hard-coded dates.
 *
 * Academic quarters are computed as follows (for a given academic year):
 *   • Fall Quarter begins on the last Monday of September.
 *   • Quarter end is defined as 77 days later (i.e. 10 full weeks of instruction,
 *     1 week of finals, and the following Saturday marking the official end).
 *   • Winter Quarter begins on January 2 of the following year (or the next business day)
 *   • Spring Quarter begins on the Monday immediately following a 1‑week break after
 *     Winter Quarter ends.
 *
 * From these computed boundaries, academic breaks are defined as:
 *   • Winter Break: from the day after Fall Quarter ends up to the day before Winter Quarter begins.
 *   • Spring Break: from the day after Winter Quarter ends up to the day before Spring Quarter begins.
 *
 * For any given year range the module returns an array of holiday objects,
 * one object per day for multi‑day breaks and single objects for one‑day holidays.
 *
 * Dependencies: scheduler.js exports utility functions: toYMD, addDays, getNextBusinessDay, and parseDate.
 */

import { toYMD, addDays, getNextBusinessDay, parseDate } from "./scheduler.js";

/**
 * Returns the date of the last occurrence of a given weekday in a specified month.
 * @param {number} year - Full year (e.g. 2024)
 * @param {number} month - Month number (1-12)
 * @param {number} weekday - Target weekday (0=Sun, 1=Mon, …, 6=Sat)
 * @returns {Date} Date of the last occurrence of weekday in that month.
 */
function getLastWeekdayOfMonth(year, month, weekday) {
  // Get last day of the month (month is 1-indexed; day 0 of next month gives last day)
  const lastDay = new Date(year, month, 0);
  const offset = (lastDay.getDay() - weekday + 7) % 7;
  lastDay.setDate(lastDay.getDate() - offset);
  return lastDay;
}

/**
 * Returns the date corresponding to the nth occurrence of a weekday in a month.
 * For example, the 3rd Monday in January.
 * @param {number} year - Full year (e.g. 2025)
 * @param {number} month - Month number (1-12)
 * @param {number} weekday - Desired weekday (0=Sun, 1=Mon, …, 6=Sat)
 * @param {number} n - The occurrence count (e.g. 3 for third occurrence)
 * @returns {Date} Matching date.
 */
function getNthWeekdayOfMonth(year, month, weekday, n) {
  const firstDay = new Date(year, month - 1, 1);
  const firstDayWeekday = firstDay.getDay();
  let offset = weekday - firstDayWeekday;
  if (offset < 0) offset += 7;
  const day = 1 + offset + 7 * (n - 1);
  return new Date(year, month - 1, day);
}

/**
 * Computes the Fall Quarter start date for an academic year.
 * According to the rules, Fall Quarter begins on the last Monday of September.
 * @param {number} fallYear - The starting year of the academic year (e.g., 2024 for 2024–2025)
 * @returns {Date} Fall Quarter start date.
 */
function getFallQuarterStart(fallYear) {
  return getLastWeekdayOfMonth(fallYear, 9, 1); // 1 = Monday
}

/**
 * Computes the quarter end date given the quarter start.
 * Here we assume a fixed quarter length of 78 days (10 weeks of instruction,
 * 1 week of finals, and the Saturday following finals).
 * @param {Date} startDate - Quarter start date.
 * @returns {Date} Quarter end date.
 */
function getQuarterEnd(startDate) {
  return addDays(startDate, 77);
}

/**
 * Computes the Winter Quarter start for the academic year.
 * Winter Quarter is set to begin on January 2 of the following year (or the next business day).
 * @param {number} fallYear - The starting year of the academic year.
 * @returns {Date} Winter Quarter start date.
 */
function getWinterQuarterStart(fallYear) {
  const jan2 = new Date(fallYear + 1, 0, 2);
  return getNextBusinessDay(jan2);
}

/**
 * Computes the Spring Quarter start for the academic year.
 * Spring Quarter is assumed to start on the Monday immediately following a 1‑week break after Winter Quarter ends.
 * For simplicity, we set Spring Quarter start = Winter Quarter end + 8 days,
 * then adjust forward until it falls on a Monday.
 * @param {number} fallYear - The starting year of the academic year.
 * @returns {Date} Spring Quarter start date.
 */
function getSpringQuarterStart(fallYear) {
  const winterStart = getWinterQuarterStart(fallYear);
  const winterEnd = getQuarterEnd(winterStart);
  let proposed = addDays(winterEnd, 8); // 1 day gap + 7-day break = 8 days later
  // Adjust forward to the next Monday if necessary.
  while (proposed.getDay() !== 1) {
    proposed = addDays(proposed, 1);
  }
  return proposed;
}

/**
 * Generates standard U.S. holidays for a given calendar year.
 * Returns an array of holiday objects { date: "YYYY-MM-DD", name: "Holiday" }.
 * @param {number} year - The calendar year.
 * @returns {Array} Array of U.S. holiday objects.
 */
function generateStandardUSHolidays(year) {
  const holidays = [];
  // New Year's Day (fixed)
  holidays.push({
    date: `${year}-01-01`,
    name: "New Year's Day"
  });
  // Martin Luther King Jr. Day (3rd Monday in January)
  const mlk = getNthWeekdayOfMonth(year, 1, 1, 3);
  holidays.push({
    date: toYMD(mlk),
    name: "Martin Luther King Jr. Day"
  });
  // Presidents Day (3rd Monday in February)
  const pres = getNthWeekdayOfMonth(year, 2, 1, 3);
  holidays.push({
    date: toYMD(pres),
    name: "Presidents Day"
  });
  // Cesar Chavez Day (March 31)
  holidays.push({
    date: `${year}-03-31`,
    name: "Cesar Chavez Day"
  });
  // Memorial Day (last Monday in May)
  const memorial = getLastWeekdayOfMonth(year, 5, 1);
  holidays.push({
    date: toYMD(memorial),
    name: "Memorial Day"
  });
  // Juneteenth (June 19)
  holidays.push({
    date: `${year}-06-19`,
    name: "Juneteenth"
  });
  // Independence Day (July 4)
  holidays.push({
    date: `${year}-07-04`,
    name: "Independence Day"
  });
  // Labor Day (1st Monday in September)
  const labor = getNthWeekdayOfMonth(year, 9, 1, 1);
  holidays.push({
    date: toYMD(labor),
    name: "Labor Day"
  });
  // Veterans Day (November 11)
  holidays.push({
    date: `${year}-11-11`,
    name: "Veterans Day"
  });
  // Thanksgiving (4th Thursday in November)
  const thanks = getNthWeekdayOfMonth(year, 11, 4, 4);
  holidays.push({
    date: toYMD(thanks),
    name: "Thanksgiving"
  });
  // Christmas Day (December 25)
  holidays.push({
    date: `${year}-12-25`,
    name: "Christmas Day"
  });
  return holidays;
}

/**
 * Generates day‑by‑day holiday objects for a break period.
 * Each day from start to end (inclusive) is returned as a separate holiday object.
 * @param {string} breakName - Name to label the break (e.g. "Winter Break").
 * @param {Date} start - Break start date.
 * @param {Date} end - Break end date.
 * @returns {Array} Array of holiday objects.
 */
function generateBreakDays(breakName, start, end) {
  const days = [];
  let current = new Date(start);
  while (current <= end) {
    days.push({
      date: toYMD(current),
      name: breakName
    });
    current = addDays(current, 1);
  }
  return days;
}

/**
 * Dynamically generates academic break entries (day-by-day) for the given academic year.
 * The academic year is specified by its fall (starting) year.
 * Two breaks are generated:
 *   • Winter Break: from the day after Fall Quarter ends up to the day before Winter Quarter begins.
 *   • Spring Break: from the day after Winter Quarter ends up to the day before Spring Quarter begins.
 *
 * @param {number} fallYear - The starting year of the academic year (e.g., 2024 for 2024–2025).
 * @returns {Array} Array of holiday objects for the academic breaks.
 */
function generateAcademicBreaksDynamic(fallYear) {
  const breaks = [];

  // Compute dynamic quarter boundaries.
  const fallStart = getFallQuarterStart(fallYear);
  const fallEnd = getQuarterEnd(fallStart);
  const winterStart = getWinterQuarterStart(fallYear);
  const springStart = getSpringQuarterStart(fallYear);

  // Winter Break: from day after Fall Quarter end to day before Winter Quarter start.
  const winterBreakStart = addDays(fallEnd, 1);
  const winterBreakEnd = addDays(winterStart, -1);
  if (winterBreakStart <= winterBreakEnd) {
    breaks.push(...generateBreakDays("Winter Break", winterBreakStart, winterBreakEnd));
  }

  // Compute Winter Quarter end.
  const winterEnd = getQuarterEnd(winterStart);
  // Spring Break: from day after Winter Quarter end to day before Spring Quarter start.
  const springBreakStart = addDays(winterEnd, 1);
  const springBreakEnd = addDays(springStart, -1);
  if (springBreakStart <= springBreakEnd) {
    breaks.push(...generateBreakDays("Spring Break", springBreakStart, springBreakEnd));
  }

  return breaks;
}

/**
 * Generates a complete array of holidays and academic breaks for a given year range.
 * This includes:
 *   • Standard U.S. holidays for every calendar year in the range.
 *   • Academic break days computed dynamically for each academic year.
 *
 * For academic breaks, each academic year is considered based on its fall (starting) year.
 *
 * @param {number} yearStart - The first calendar year (e.g., 2024).
 * @param {number} yearEnd - The last calendar year (e.g., 2028).
 * @returns {Array} Sorted array of holiday objects { date, name }.
 */
export function generateUCSBHolidaysAndBreaks(yearStart, yearEnd) {
  const allHolidays = [];

  // Add standard U.S. holidays for each calendar year.
  for (let y = yearStart; y <= yearEnd; y++) {
    allHolidays.push(...generateStandardUSHolidays(y));
  }

  // Generate academic break days for each academic year starting in each fall year.
  // (For example, academic year 2024–2025 is generated using fallYear = 2024.)
  for (let fallYear = yearStart; fallYear <= yearEnd; fallYear++) {
    const academicBreaks = generateAcademicBreaksDynamic(fallYear);
    allHolidays.push(...academicBreaks);
  }

  // Sort all holiday objects by date (ascending).
  allHolidays.sort((a, b) => parseDate(a.date) - parseDate(b.date));

  console.log(`Generated ${allHolidays.length} holiday/break entries for ${yearStart}-${yearEnd}.`);
  return allHolidays;
}
