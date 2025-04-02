// src/services/logger.js
const LOG_KEY = 'appLogs';
let logListeners = new Set();
let remoteLogger = null;

export const setRemoteLogger = (fn) => {
  remoteLogger = fn;
};

export const getStoredLogs = () => {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const storeLog = (entry) => {
  const logs = getStoredLogs();
  logs.unshift(entry);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 500)));
};

export const addLogListener = (fn) => logListeners.add(fn);
export const removeLogListener = (fn) => logListeners.delete(fn);
export const clearStoredLogs = () => localStorage.removeItem(LOG_KEY);

export const logEvent = async (tag, message) => {
  const ts = new Date().toISOString();
  const entry = `[${ts}][${tag}] ${message}`;
  console.log(entry);
  storeLog(entry);
  logListeners.forEach(fn => fn(entry));
  window.dispatchEvent(new CustomEvent('log-message', { detail: entry }));
  if (typeof remoteLogger === 'function') {
    try {
      await remoteLogger(tag, message);
    } catch (e) {
      console.error('Remote logging failed:', e);
    }
  }
};
