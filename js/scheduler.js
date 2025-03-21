/**
 * scheduler.js
 *
 * Provides utility functions for scheduling journeys,
 * including date calculations, holiday detection, and sorting.
 * This updated version maintains both the initial (planned) dates and the updated scheduled dates.
 */

let HOLIDAYS = [];

/**
 * Replaces the current in‑memory holidays/breaks with the provided array.
 * @param {Array} holidayArray - Array of objects [{ date: "YYYY-MM-DD", name: "Holiday" }, ...].
 */
export function setHolidays(holidayArray) {
  HOLIDAYS = holidayArray;
  console.log(`Holidays/Breaks stored in memory: ${HOLIDAYS.length} entries.`);
}

/**
 * Retrieves the in‑memory list of holidays/breaks.
 * @returns {Array} The array of holiday objects.
 */
export function getHolidays() {
  return HOLIDAYS;
}

/**
 * Checks if a given date is a holiday.
 * @param {Date} date - The date to check.
 * @returns {boolean} True if the date is a holiday.
 */
function isHoliday(date) {
  const ymd = toYMD(date);
  return HOLIDAYS.some(h => h.date === ymd);
}

/**
 * Parses a date string (YYYY-MM-DD) into a Date object.
 * @param {string} str - Date string.
 * @returns {Date} Parsed date.
 */
export function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Converts a Date object to a string (YYYY-MM-DD).
 * @param {Date} date - The date.
 * @returns {string} Formatted string.
 */
export function toYMD(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/**
 * Adds a number of days to a date.
 * @param {Date} date - The base date.
 * @param {number} n - Number of days.
 * @returns {Date} New date.
 */
export function addDays(date, n) {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

/**
 * Returns true if the date falls on a weekend.
 * @param {Date} date - Date to check.
 * @returns {boolean} True if weekend.
 */
export function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

/**
 * Returns the next business day, skipping weekends and holidays.
 * @param {Date} date - Starting date.
 * @returns {Date} Next business day.
 */
export function getNextBusinessDay(date) {
  let d = new Date(date);
  while (isWeekend(d) || isHoliday(d)) {
    d = addDays(d, 1);
  }
  return d;
}

/**
 * Computes the ISO week number for a given date.
 * @param {Date} date - The date object.
 * @returns {number} The ISO week number.
 */
export function getCalendarWeek(date) {
  const target = new Date(date.valueOf());
  // ISO week date weeks start on Monday, so adjust the day number
  const dayNr = (date.getDay() + 6) % 7;
  // Set the target to the Thursday in the current week
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  // January 1st of this year
  target.setMonth(0, 1);
  // Find the first Thursday of the year
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  // Calculate the ISO week number
  const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
  return weekNumber;
}

/**
 * Returns task duration (in days) based on difficulty.
 * @param {string} difficulty - "Easy", "Medium", or "Hard".
 * @returns {number} Duration in days.
 */
export function getDuration(difficulty) {
  if (difficulty === "Easy") return 30;
  if (difficulty === "Medium") return 45;
  if (difficulty === "Hard") return 60;
  return 30;
}

const priorityOrder = {
  "Critical": 1,
  "Important": 2,
  "Next": 3,
  "Sometime Maybe": 4
};

/**
 * Sorts journeys by various criteria (completed, explicit order, then by priority).
 * @param {Array} journeyData - The array of journeys.
 */
export function sortJourneys(journeyData) {
  journeyData.sort((a, b) => {
    if (a.completedDate && !b.completedDate) return -1;
    if (!a.completedDate && b.completedDate) return 1;
    if (typeof a.order === "number" && typeof b.order === "number") {
      return a.order - b.order;
    } else if (typeof a.order === "number") {
      return -1;
    } else if (typeof b.order === "number") {
      return 1;
    }
    const pa = priorityOrder[a.priority] || 99;
    const pb = priorityOrder[b.priority] || 99;
    if (pa !== pb) return pa - pb;
    if (a.priority === "Critical") {
      const na = (a.priorityNumber !== undefined && a.priorityNumber !== null) ? a.priorityNumber : 0;
      const nb = (b.priorityNumber !== undefined && b.priorityNumber !== null) ? b.priorityNumber : 0;
      return na - nb;
    }
    return 0;
  });
}

export const BASE_START_DATE = new Date("2025-03-03");

/**
 * Schedules journeys by assigning start and end dates.
 * Maintains initial (planned) dates and recalculates updated (scheduled) dates.
 * For top-level journeys:
 *  - If not already set, initialStartDate and initialEndDate are established.
 *  - If a journey is completed, its scheduledEndDate equals the actual completion date.
 *    Its scheduledStartDate is preserved if already set (to reflect the shifted date),
 *    otherwise it is computed from currentDate.
 *  - Otherwise, scheduled dates are recalculated from the currentDate.
 * Child journeys are scheduled relative to their parent's scheduled start date.
 *
 * Each new top‑level journey starts strictly on the next business day following the previous journey’s end date.
 * Logs are added to warn if duplicate start days are detected.
 *
 * @param {Array} journeyData - The array of journeys.
 */
export function scheduleJourneys(journeyData) {
  sortJourneys(journeyData);
  let currentDate = getNextBusinessDay(BASE_START_DATE);
  
  journeyData.forEach(j => {
    // For child journeys, schedule relative to parent's scheduled start date.
    if (j.parentId) {
      const parent = journeyData.find(p => p.id === j.parentId);
      if (parent && parent.scheduledStartDate) {
        j.scheduledStartDate = getNextBusinessDay(new Date(parent.scheduledStartDate));
      } else {
        j.scheduledStartDate = getNextBusinessDay(currentDate);
      }
      j.scheduledEndDate = addDays(j.scheduledStartDate, getDuration(j.difficulty) - 1);
      console.log(`Scheduled child journey "${j.title}" from ${toYMD(j.scheduledStartDate)} to ${toYMD(j.scheduledEndDate)}.`);
      return;
    }
    
    // For top-level journeys.
    if (!j.initialStartDate) {
      j.initialStartDate = getNextBusinessDay(currentDate);
      console.log(`Initial start date for "${j.title}" set to ${toYMD(j.initialStartDate)}.`);
    }
    if (!j.initialEndDate) {
      j.initialEndDate = addDays(j.initialStartDate, getDuration(j.difficulty) - 1);
      console.log(`Initial end date for "${j.title}" set to ${toYMD(j.initialEndDate)}.`);
    }
    
    if (j.completedDate) {
      // For completed journeys, if a shifted scheduledStartDate exists, keep it.
      if (!j.scheduledStartDate) {
         j.scheduledStartDate = getNextBusinessDay(currentDate);
      }
      j.scheduledEndDate = new Date(j.completedDate);
      console.log(`Journey "${j.title}" completed on ${toYMD(j.scheduledEndDate)} (planned end was ${toYMD(j.initialEndDate)}).`);
      // Advance to the next business day after the completion date.
      currentDate = getNextBusinessDay(addDays(j.scheduledEndDate, 1));
    } else {
      j.scheduledStartDate = getNextBusinessDay(currentDate);
      j.scheduledEndDate = addDays(j.scheduledStartDate, getDuration(j.difficulty) - 1);
      console.log(`Scheduled "${j.title}" from ${toYMD(j.scheduledStartDate)} to ${toYMD(j.scheduledEndDate)}.`);
      // Advance currentDate to the next business day following the scheduled end date.
      currentDate = getNextBusinessDay(addDays(j.scheduledEndDate, 1));
    }
  });

  // Logging check: Verify no two top-level journeys share the same scheduled start date.
  const startDates = {};
  journeyData.forEach(j => {
    if (!j.parentId && j.scheduledStartDate) {
      const dateStr = toYMD(j.scheduledStartDate);
      if (startDates[dateStr]) {
        console.warn(`Duplicate start date detected: Journeys "${startDates[dateStr]}" and "${j.title}" are both scheduled on ${dateStr}.`);
      } else {
        startDates[dateStr] = j.title;
      }
    }
  });
}
