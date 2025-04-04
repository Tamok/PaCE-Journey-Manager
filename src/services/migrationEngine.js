// src/services/migrationEngine.js

import { logEvent } from './logger';
import { CURRENT_DB_VERSION } from '../constants';

// Define migrations by version step
const migrations = {
  '0.5.1': (goals) => {
    // Example: ensure all goals have UUID
    return goals.map(goal => ({
      ...goal,
      id: goal.id || crypto.randomUUID()
    }));
  },
  '0.5.2': (goals) => {
    // Add default "note" field if missing
    return goals.map(goal => ({
      ...goal,
      note: goal.note || ''
    }));
  }
};

// Run all migrations from oldVersion to CURRENT_DB_VERSION
export const migrateGoals = (goals, oldVersion = '0.0.0') => {
  const versionSteps = Object.keys(migrations).sort();

  let migrated = goals;
  for (const version of versionSteps) {
    if (version > oldVersion) {
      logEvent('INFO', `Applying migration ${version}`);
      migrated = migrations[version](migrated);
    }
  }

  logEvent('INFO', `Migration complete. Upgraded from ${oldVersion} to ${CURRENT_DB_VERSION}`);
  return migrated;
};
