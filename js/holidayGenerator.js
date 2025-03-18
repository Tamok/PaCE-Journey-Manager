/**
 * holidayGenerator.js
 *
 * Generates standard U.S. holidays and UCSB academic breaks programmatically
 * by analyzing quarter start/end data. Returns a list of objects
 * [{ date: "YYYY-MM-DD", name: "Holiday or Break" }, ...].
 *
 * This is intended to replace any static HOLIDAYS array with dynamic generation.
 * Store the results in memory so the rest of the app can reference them.
 */

import { parseDate, toYMD, addDays } from "./scheduler.js";

/**
 * Returns the Date corresponding to the nth occurrence of a particular weekday
 * in a given month and year. For example, the 3rd Monday in January 2025.
 * @param {number} year - The year (e.g. 2025).
 * @param {number} month - The month (1‑12).
 * @param {number} weekday - The desired weekday (0=Sun, 1=Mon, ... 6=Sat).
 * @param {number} n - The nth occurrence (1=first, 2=second, etc.).
 * @returns {Date} The matching date.
 */
function getNthWeekdayOfMonth(year, month, weekday, n) {
  const firstDay = new Date(year, month - 1, 1);
  const firstDayWeekday = firstDay.getDay();
  // Offset: how many days from the 1st to get the first desired weekday
  let offset = weekday - firstDayWeekday;
  if (offset < 0) offset += 7;
  // Now add (n-1) weeks (each 7 days)
  const day = 1 + offset + 7 * (n - 1);
  return new Date(year, month - 1, day);
}

/**
 * Returns the Date of the last Monday in May, for Memorial Day.
 * @param {number} year - The year.
 * @returns {Date} The last Monday of May for that year.
 */
function getLastMondayOfMay(year) {
  // Start at June 1st, go back until we find Monday in the last week of May.
  const juneFirst = new Date(year, 5, 1); // June is month 5 (0-based in JS)
  let day = new Date(juneFirst.getTime());
  day.setDate(day.getDate() - 1); // Move to May 31
  while (day.getDay() !== 1) {
    day.setDate(day.getDate() - 1);
  }
  return day;
}

/**
 * Generates standard U.S. holidays for a given year. 
 * Returns an array of objects with { date: "YYYY-MM-DD", name: "Holiday" }.
 * @param {number} year - The year.
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

  // Cesar Chavez Day (March 31, observed in CA)
  holidays.push({
    date: `${year}-03-31`,
    name: "Cesar Chavez Day"
  });

  // Memorial Day (last Monday in May)
  const memorial = getLastMondayOfMay(year);
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
 * Represents known quarter start/end dates by academic year.
 * This can be expanded or updated as needed to cover more years.
 * Each property is an object: { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }.
 */
const academicCalendar = {
  "2024-2025": {
    fall:   { start: "2024-09-22", end: "2024-12-14" },
    winter: { start: "2025-01-06", end: "2025-03-22" },
    spring: { start: "2025-03-31", end: "2025-06-14" },
    summer: { start: "2025-06-23", end: "2025-09-20" }
  },
  "2025-2026": {
    fall:   { start: "2025-09-28", end: "2025-12-13" },
    winter: { start: "2026-01-05", end: "2026-03-21" },
    spring: { start: "2026-03-30", end: "2026-06-13" },
    summer: { start: "2026-06-22", end: "2026-09-19" }
  },
  "2026-2027": {
    fall:   { start: "2026-09-27", end: "2026-12-12" },
    winter: { start: "2027-01-04", end: "2027-03-20" },
    spring: { start: "2027-03-29", end: "2027-06-12" },
    summer: { start: "2027-06-21", end: "2027-09-18" }
  },
  "2027-2028": {
    fall:   { start: "2027-09-26", end: "2027-12-11" },
    winter: { start: "2028-01-03", end: "2028-03-18" },
    spring: { start: "2028-03-27", end: "2028-06-10" },
    summer: { start: "2028-06-19", end: "2028-09-16" }
  }
};

/**
 * Generates day‑by‑day break entries between two dates (inclusive).
 * Each date in this range is returned as a separate holiday object.
 * @param {string} breakName - Name of the break (e.g. "Winter Break").
 * @param {Date} start - Start date object.
 * @param {Date} end - End date object.
 * @returns {Array} Array of { date: "YYYY-MM-DD", name: breakName }.
 */
function generateBreakDays(breakName, start, end) {
  const days = [];
  let current = new Date(start.getTime());
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
 * Computes a single holiday event for a break period.
 * It calculates the midpoint between the break start and end dates,
 * then returns an object with that representative date and the break name.
 *
 * @param {string} breakName - Name of the break (e.g., "Spring Break").
 * @param {Date} start - Start date of the break.
 * @param {Date} end - End date of the break.
 * @returns {Object} Holiday object: { date: "YYYY-MM-DD", name: breakName }.
 */
function generateBreakHoliday(breakName, start, end) {
    const diffMs = end.getTime() - start.getTime();
    const midPoint = new Date(start.getTime() + diffMs / 2);
    return {
      date: toYMD(midPoint),
      name: breakName
    };
  }
  
  /**
   * Given the quarter data for a single academic year, generates single holiday events
   * for academic breaks:
   * - Winter Break: from day after fall end until day before winter start.
   * - Spring Break: from day after winter end until day before spring start.
   *
   * @param {Object} yearData - For example: 
   *   { fall: {start, end}, winter: {start, end}, spring: {start, end}, summer: {start, end} }
   * @returns {Array} An array containing one holiday object per break period.
   */
  function generateAcademicBreaks(yearData) {
    const results = [];
  
    // Convert date strings to Date objects
    const fallEnd = parseDate(yearData.fall.end);
    const winterStart = parseDate(yearData.winter.start);
    const winterEnd = parseDate(yearData.winter.end);
    const springStart = parseDate(yearData.spring.start);
  
    // Winter Break: from the day after fall end to the day before winter start
    const winterBreakStart = addDays(fallEnd, 1);
    const winterBreakEnd = addDays(winterStart, -1);
    if (winterBreakStart <= winterBreakEnd) {
      results.push(generateBreakHoliday("Winter Break", winterBreakStart, winterBreakEnd));
    }
  
    // Spring Break: from the day after winter end to the day before spring start
    const springBreakStart = addDays(winterEnd, 1);
    const springBreakEnd = addDays(springStart, -1);
    if (springBreakStart <= springBreakEnd) {
      results.push(generateBreakHoliday("Spring Break", springBreakStart, springBreakEnd));
    }
  
    // (Optional) Additional breaks can be added similarly if needed.
  
    return results;
  }  

/**
 * Generates a complete array of holidays and breaks for each academic year
 * in the specified range. This includes:
 * - All standard U.S. holidays for each calendar year in [yearStart..yearEnd].
 * - Quarter breaks from academicCalendar (where keys cross those years).
 * 
 * @param {number} yearStart - Starting year for holiday generation (e.g. 2024).
 * @param {number} yearEnd - Ending year for holiday generation (e.g. 2028).
 * @returns {Array} All holiday/break objects, each { date, name }.
 */
export function generateUCSBHolidaysAndBreaks(yearStart, yearEnd) {
  const allHolidays = [];

  // Generate standard U.S. holidays for each year
  for (let y = yearStart; y <= yearEnd; y++) {
    const yearHolidays = generateStandardUSHolidays(y);
    allHolidays.push(...yearHolidays);
  }

  // Generate academic breaks for each known academic year that overlaps [yearStart..yearEnd]
  for (const acadYearKey of Object.keys(academicCalendar)) {
    const [startY, endY] = acadYearKey.split("-").map(Number);
    // The "endY" is the year portion of "2024-2025", typically endY = startY+1
    // Check if the academic year is within or intersects [yearStart..yearEnd]
    if (startY >= yearStart - 1 && endY <= yearEnd + 1) {
      const yearData = academicCalendar[acadYearKey];
      const breaks = generateAcademicBreaks(yearData);
      allHolidays.push(...breaks);
    }
  }

  // Sort by date ascending
  allHolidays.sort((a, b) => {
    const da = parseDate(a.date).getTime();
    const db = parseDate(b.date).getTime();
    return da - db;
  });

  console.log(
    `Generated ${allHolidays.length} holiday/break entries for ${yearStart}‑${yearEnd}.`
  );
  return allHolidays;
}
