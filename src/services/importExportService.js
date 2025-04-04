
// src/services/importExportService.js
import { getDocs, collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebaseService';
import { logEvent } from './logger';
import { migrateGoals } from './migrationEngine';
import { createSnapshot } from './snapshotService';
import { CURRENT_DB_VERSION } from '../constants';

const GOALS_COLLECTION = 'pace-goals';

export const exportGoals = async () => {
  const snapshot = await getDocs(collection(db, GOALS_COLLECTION));
  const goals = snapshot.docs.map(d => d.data());
  const exportData = {
    version: CURRENT_DB_VERSION,
    exportedAt: new Date().toISOString(),
    goals,
  };
  logEvent('INFO', 'Exported goals data.');
  return exportData;
};

export const importGoals = async (parsed, mode = 'replace') => {
  const user = auth.currentUser?.email || 'unknown';

  if (!parsed || !parsed.goals) {
    logEvent('ERROR', 'Invalid import file: no goals array found.');
    throw new Error('Invalid import file');
  }

  await createSnapshot(`[Auto Before Import] ${new Date().toISOString()}`);

  const migrated = migrateGoals(parsed.goals, parsed.version);
  const batchGoals = mode === 'replace' ? migrated : await mergeGoals(migrated);

  for (const goal of batchGoals) {
    const ref = doc(db, GOALS_COLLECTION, goal.id);
    await setDoc(ref, goal);
  }

  logEvent('INFO', `Import complete (${mode} mode): ${batchGoals.length} goals.`);
};

const mergeGoals = async (importedGoals) => {
  const existing = (await getDocs(collection(db, GOALS_COLLECTION))).docs.map(d => d.data());
  const existingIds = new Set(existing.map(g => g.id));
  return [...existing, ...importedGoals.filter(g => !existingIds.has(g.id))];
};
