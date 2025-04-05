// src/services/holidayGenerator.js
import { toYMD, addDays, parseDate } from "./dateUtils";

function getLastWeekdayOfMonth(year, month, weekday) {
  const lastDay = new Date(year, month, 0);
  const offset = (lastDay.getDay() - weekday + 7) % 7;
  lastDay.setDate(lastDay.getDate() - offset);
  return lastDay;
}

function getNthWeekdayOfMonth(year, month, weekday, n) {
  const firstDay = new Date(year, month - 1, 1);
  let offset = weekday - firstDay.getDay();
  if (offset < 0) offset += 7;
  const day = 1 + offset + 7 * (n - 1);
  return new Date(year, month - 1, day);
}

function generateStandardUSHolidays(year) {
  const holidays = [];
  holidays.push({ date: `${year}-01-01`, name: "New Year's Day" });
  holidays.push({ date: toYMD(getNthWeekdayOfMonth(year, 1, 1, 3)), name: "Martin Luther King Jr. Day" });
  holidays.push({ date: toYMD(getNthWeekdayOfMonth(year, 2, 1, 3)), name: "Presidents Day" });
  holidays.push({ date: `${year}-03-31`, name: "Cesar Chavez Day" });
  holidays.push({ date: toYMD(getLastWeekdayOfMonth(year, 5, 1)), name: "Memorial Day" });
  holidays.push({ date: `${year}-06-19`, name: "Juneteenth" });
  holidays.push({ date: `${year}-07-04`, name: "Independence Day" });
  holidays.push({ date: toYMD(getNthWeekdayOfMonth(year, 9, 1, 1)), name: "Labor Day" });
  holidays.push({ date: `${year}-11-11`, name: "Veterans Day" });
  holidays.push({ date: toYMD(getNthWeekdayOfMonth(year, 11, 4, 4)), name: "Thanksgiving" });
  holidays.push({ date: `${year}-12-25`, name: "Christmas Day" });
  return holidays;
}

function generateBreakDays(breakName, start, end) {
  const days = [];
  let current = new Date(start);
  while (current <= end) {
    days.push({ date: toYMD(current), name: breakName });
    current = addDays(current, 1);
  }
  return days;
}

function generateAcademicBreaksDynamic(fallYear) {
  const breaks = [];
  // For example: Fall Quarter starts last Monday of September.
  const fallStart = getLastWeekdayOfMonth(fallYear, 9, 1);
  const fallEnd = addDays(fallStart, 77);
  const winterStart = new Date(fallYear + 1, 0, 2);
  const winterBreak = generateBreakDays("Winter Break", addDays(fallEnd, 1), addDays(winterStart, -1));
  breaks.push(...winterBreak);
  const winterEnd = addDays(winterStart, 77);
  const springStart = addDays(winterEnd, 8);
  const springBreak = generateBreakDays("Spring Break", addDays(winterEnd, 1), addDays(springStart, -1));
  breaks.push(...springBreak);
  return breaks;
}

export function generateUCSBHolidaysAndBreaks(yearStart, yearEnd) {
  const allHolidays = [];
  for (let y = yearStart; y <= yearEnd; y++) {
    allHolidays.push(...generateStandardUSHolidays(y));
  }
  for (let fallYear = yearStart; fallYear <= yearEnd; fallYear++) {
    allHolidays.push(...generateAcademicBreaksDynamic(fallYear));
  }
  allHolidays.sort((a, b) => parseDate(a.date) - parseDate(b.date));
  console.log(`Generated ${allHolidays.length} holiday entries for ${yearStart}-${yearEnd}.`);
  return allHolidays;
}
