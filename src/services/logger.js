// src/services/logger.js
const LOG_KEY = 'appLogs';
let logListeners = new Set();
// Remote logger function can be set externally.
let remoteLogger = null;

/**
 * Set a remote logger function.
 * The function should accept (tag, message, userEmail) and return a Promise.
 */
export const setRemoteLogger = (fn) => {
  remoteLogger = fn;
};

/**
 * Load stored logs from localStorage.
 */
export const getStoredLogs = () => {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Store a new log entry in localStorage.
 * Limits stored logs to the 500 most recent entries.
 */
const storeLog = (entry) => {
  const logs = getStoredLogs();
  logs.unshift(entry);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 500)));
};

/**
 * Register a log listener (callback called with each new log entry).
 */
export const addLogListener = (fn) => logListeners.add(fn);

/**
 * Remove a registered log listener.
 */
export const removeLogListener = (fn) => logListeners.delete(fn);

/**
 * Clear all logs stored locally.
 */
export const clearStoredLogs = () => localStorage.removeItem(LOG_KEY);

/**
 * Log an event with a tag and message.
 * Logs to console, localStorage, and if remoteLogger is set, to Firestore.
 * Optionally pass a userEmail if available.
 */
export const logEvent = async (tag, message, userEmail = "") => {
  const ts = new Date().toISOString();
  const entry = `[${ts}][${tag}] ${message}`;
  console.log(entry);
  storeLog(entry);
  logListeners.forEach(fn => fn(entry));
  window.dispatchEvent(new CustomEvent('log-message', { detail: entry }));

  if (typeof remoteLogger === 'function') {
    try {
      await remoteLogger(tag, message, userEmail);
    } catch (e) {
      console.error('Remote logging failed:', e);
    }
  }
};
