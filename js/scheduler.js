/**
 * scheduler.js
 *
 * Provides utility functions for scheduling journeys, including date calculations
 * and sorting logic.
 *
 * Author: Your Name
 * Date: YYYY-MM-DD
 */

// Utility functions
export function parseDate(str) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  
  export function toYMD(date) {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${mm}-${dd}`;
  }
  
  export function addDays(date, n) {
    const result = new Date(date);
    result.setDate(result.getDate() + n);
    return result;
  }
  
  export function isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 6;
  }
  
  export function getNextBusinessDay(date) {
    let d = new Date(date);
    while (isWeekend(d)) {
      d = addDays(d, 1);
    }
    return d;
  }
  
  // Duration based on difficulty.
  export function getDuration(difficulty) {
    if (difficulty === "easy") return 30;
    if (difficulty === "medium") return 45;
    if (difficulty === "hard") return 60;
    return 30;
  }
  
  // Priority order mapping – note "Priority" is removed since "Critical" has replaced it.
  const priorityOrder = {
    "Critical": 1,
    "Important": 2,
    "Next": 3,
    "Sometime Maybe": 4,
    "Child": 5
  };
  
  // Sort journeys using explicit order if set; otherwise, sort by priority and priorityNumber for Critical projects.
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
  
  // Base start date constant.
  export const BASE_START_DATE = new Date("2025-03-03");
  
  // Schedule journeys by assigning start and end dates.
  // Child journeys (identified by a parentId) are scheduled relative to their parent's start date.
  export function scheduleJourneys(journeyData) {
    sortJourneys(journeyData);
    let currentDate = getNextBusinessDay(BASE_START_DATE);
    journeyData.forEach(j => {
      if (j.parentId) {
        // Child journey: schedule relative to the parent.
        const parent = journeyData.find(p => p.id === j.parentId);
        if (parent) {
          j.startDate = addDays(parent.startDate, 2); // e.g., start 2 days after parent's start.
          j.endDate = addDays(j.startDate, getDuration(j.difficulty) - 1);
          console.log(`Scheduled child journey "${j.title}" relative to parent "${parent.title}".`);
        } else {
          // Fallback scheduling if parent is not found.
          j.startDate = getNextBusinessDay(currentDate);
          j.endDate = addDays(j.startDate, getDuration(j.difficulty) - 1);
          currentDate = addDays(j.endDate, 1);
          console.warn(`Parent for child journey "${j.title}" not found. Using fallback scheduling.`);
        }
      } else {
        // Standalone or parent journey.
        j.startDate = getNextBusinessDay(currentDate);
        j.endDate = addDays(j.startDate, getDuration(j.difficulty) - 1);
        currentDate = addDays(j.endDate, 1);
        console.log(`Scheduled journey "${j.title}" from ${toYMD(j.startDate)} to ${toYMD(j.endDate)}.`);
      }
    });
  }
  