/**
 * scheduler.js
 *
 * Provides utility functions for scheduling journeys,
 * including date calculations, holiday detection, and sorting.
 *
 * Author: Your Name
 * Date: YYYY-MM-DD
 */

export const HOLIDAYS = [
    "2025-03-17",  // St. Patrick's Day
    "2025-04-01"   // April Fool's Day
  ];
  
  /**
   * Checks if a given date is a holiday.
   * @param {Date} date - The date to check.
   * @returns {boolean} True if the date is a holiday.
   */
  function isHoliday(date) {
    const ymd = toYMD(date);
    return HOLIDAYS.includes(ymd);
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
   * Returns task duration (in days) based on difficulty.
   * Difficulties are capitalized ("Easy", "Medium", "Hard").
   * @param {string} difficulty - Difficulty.
   * @returns {number} Duration.
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
    "Sometime Maybe": 4,
    "Child": 5
  };
  
  /**
   * Sorts journeys by explicit order if set; otherwise by priority and subpriority.
   * @param {Array} journeyData - Array of journeys.
   */
  export function sortJourneys(journeyData) {
    journeyData.sort((a, b) => {
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
        const na = a.priorityNumber || 9999;
        const nb = b.priorityNumber || 9999;
        return na - nb;
      }
      return 0;
    });
  }
  
  export const BASE_START_DATE = new Date("2025-03-03");
  
  /**
   * Schedules journeys by assigning start and end dates.
   * Child journeys are scheduled relative to their parent's start date.
   * @param {Array} journeyData - Array of journeys.
   */
  export function scheduleJourneys(journeyData) {
    sortJourneys(journeyData);
    let currentDate = getNextBusinessDay(BASE_START_DATE);
    journeyData.forEach(j => {
      if (j.parentId) {
        const parent = journeyData.find(p => p.id === j.parentId);
        if (parent) {
          j.startDate = addDays(parent.startDate, 2);
          j.endDate = addDays(j.startDate, getDuration(j.difficulty) - 1);
          console.log(`Scheduled child journey "${j.title}" relative to "${parent.title}".`);
        } else {
          j.startDate = getNextBusinessDay(currentDate);
          j.endDate = addDays(j.startDate, getDuration(j.difficulty) - 1);
          currentDate = addDays(j.endDate, 1);
          console.warn(`Parent for "${j.title}" not found; fallback scheduling.`);
        }
      } else {
        j.startDate = getNextBusinessDay(currentDate);
        j.endDate = addDays(j.startDate, getDuration(j.difficulty) - 1);
        currentDate = addDays(j.endDate, 1);
        console.log(`Scheduled "${j.title}" from ${toYMD(j.startDate)} to ${toYMD(j.endDate)}.`);
      }
    });
  }
  