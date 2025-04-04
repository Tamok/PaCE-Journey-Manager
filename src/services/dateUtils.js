// src/services/dateUtils.js
export const parseDate = (str) => new Date(str);

export const toYMD = (date) => date.toISOString().split('T')[0];

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isWeekend = (date) => [0, 6].includes(date.getDay());

export const isHoliday = (date, holidays = []) =>
  holidays.some((h) => h.date === toYMD(date));

export const getNextBusinessDay = (date, holidays = []) => {
  let nextDay = new Date(date);
  while (isWeekend(nextDay) || isHoliday(nextDay, holidays)) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
};
