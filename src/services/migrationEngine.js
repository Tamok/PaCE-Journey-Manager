// src/services/migrationEngine.js

import { logEvent } from './logger';
import { CURRENT_DB_VERSION } from '../constants';

// Previous migration steps remain.
const migrations = {
  "0.5.1": (goals) => {
    return goals.map(goal => ({
      ...goal,
      id: goal.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random())
    }));
  },
  "0.5.2": (goals) => {
    return goals.map(goal => ({
      ...goal,
      note: goal.note || ''
    }));
  },
  "0.5.3": (goals) => {
    return goals.map(goal => {
      if (goal.childGoals) {
        goal.subGoals = goal.childGoals;
        delete goal.childGoals;
      }
      if (goal.isChild !== undefined) {
        delete goal.isChild;
      }
      if (goal.title && goal.title.toLowerCase().includes('child')) {
        goal.title = goal.title.replace(/child/gi, 'sub-goal');
      }
      return goal;
    });
  },
  "0.5.4": (goals) => {
    // New migration to process legacy import files
    // 1. For each goal, if fields id, createdAt, createdBy, difficulty, or taskTemplate are missing, set defaults.
    const processed = goals.map(goal => {
      const newGoal = { ...goal };
      if (!newGoal.id) {
        newGoal.id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
      }
      if (!newGoal.createdAt) {
        newGoal.createdAt = new Date().toISOString();
      }
      if (!newGoal.createdBy) {
        newGoal.createdBy = "import";
      }
      if (!newGoal.difficulty) {
        // If subOf exists, default to Hard; otherwise, Medium.
        newGoal.difficulty = newGoal.subOf ? "Hard" : "Medium";
      }
      if (!newGoal.taskTemplate) {
        newGoal.taskTemplate = "journeyTemplate";
      }
      return newGoal;
    });
    
    // 2. Link sub-goals: for any goal with a "subOf" field, find a parent goal in the processed array whose title matches.
    processed.forEach(goal => {
      if (goal.subOf) {
        const parent = processed.find(g => g.title === goal.subOf);
        if (parent) {
          goal.parentId = parent.id;
        }
        delete goal.subOf;
      }
    });
    
    return processed;
  }
};

export const migrateGoals = (goals, oldVersion = "0.0.0") => {
  const versionSteps = Object.keys(migrations).sort();
  let migrated = goals;
  for (const version of versionSteps) {
    if (version > oldVersion) {
      logEvent("INFO", `Applying migration ${version}`);
      migrated = migrations[version](migrated);
    }
  }
  logEvent("INFO", `Migration complete. Upgraded from ${oldVersion} to ${CURRENT_DB_VERSION}`);
  return migrated;
};
