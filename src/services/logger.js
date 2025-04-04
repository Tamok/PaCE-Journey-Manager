// src/services/logger.js
const LOG_KEY = 'appLogs';
let remoteLogger = null;

export const setRemoteLogger = (fn) => remoteLogger = fn;

export const logEvent = async (tag, message, userEmail = "") => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}][${tag}] ${message}`;
  
  console.log(logEntry);
  saveLocalLog(logEntry);
  window.dispatchEvent(new CustomEvent('log-message', { detail: logEntry }));

  if (remoteLogger) {
    try {
      await remoteLogger(tag, message, userEmail);
    } catch (error) {
      console.error("Remote log failed:", error);
    }
  }
};

function saveLocalLog(entry) {
  const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  logs.unshift(entry);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 500)));
}

export const getStoredLogs = () => JSON.parse(localStorage.getItem(LOG_KEY) || '[]');

export const clearStoredLogs = () => localStorage.removeItem(LOG_KEY);
