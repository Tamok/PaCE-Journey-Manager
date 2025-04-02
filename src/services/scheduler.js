// src/services/scheduler.js
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
  
  export function getCalendarWeek(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
    return weekNumber;
  }
  
  // A simple scheduling function – extend as needed.
  export function scheduleJourneys(journeyData) {
    // In production, you would compute and assign start/end dates.
    // For this demo, we simply return the data unchanged.
    return journeyData;
  }
  