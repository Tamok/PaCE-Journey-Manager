// src/services/scheduler.js
let HOLIDAYS = [];

export function setHolidays(holidayArray) {
  HOLIDAYS = holidayArray;
  console.log(`Holidays stored in memory: ${HOLIDAYS.length} entries.`);
}

export function getHolidays() {
  return HOLIDAYS;
}

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

function isHoliday(date) {
  const ymd = toYMD(date);
  return HOLIDAYS.some(h => h.date === ymd);
}

export function isWeekend(date) {
  return date.getDay() === 0 || date.getDay() === 6;
}

export function getNextBusinessDay(date) {
  let d = new Date(date);
  while (isWeekend(d) || isHoliday(d)) {
    d = addDays(d, 1);
  }
  return d;
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

export function getDuration(difficulty) {
  if (difficulty === "Easy") return 30;
  if (difficulty === "Medium") return 45;
  if (difficulty === "Hard") return 60;
  return 30;
}

// Schedules journeys by updating planned and scheduled dates.
export function scheduleJourneys(journeyData) {
  // (Implement scheduling logic similar to legacy code)
  // For brevity, we assume that each top-level journey gets scheduled starting from a base date.
  let currentDate = getNextBusinessDay(new Date("2025-03-03"));
  journeyData.forEach(j => {
    if (!j.parentId) {
      if (!j.completedDate) {
        j.initialStartDate = getNextBusinessDay(currentDate);
        j.initialEndDate = addDays(j.initialStartDate, getDuration(j.difficulty) - 1);
        j.scheduledStartDate = j.initialStartDate;
        j.scheduledEndDate = j.initialEndDate;
        currentDate = getNextBusinessDay(addDays(j.scheduledEndDate, 1));
      } else {
        j.scheduledEndDate = new Date(j.completedDate);
        if (!j.scheduledStartDate) {
          j.scheduledStartDate = getNextBusinessDay(currentDate);
        }
        currentDate = getNextBusinessDay(addDays(j.scheduledEndDate, 1));
      }
    } else {
      // For subjourneys, schedule relative to parent.
      const parent = journeyData.find(p => p.id === j.parentId);
      if (parent && parent.scheduledStartDate) {
        j.scheduledStartDate = getNextBusinessDay(new Date(parent.scheduledStartDate));
      } else {
        j.scheduledStartDate = getNextBusinessDay(currentDate);
      }
      j.scheduledEndDate = addDays(j.scheduledStartDate, getDuration(j.difficulty) - 1);
    }
  });
}
