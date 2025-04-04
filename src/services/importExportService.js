// src/services/importExportService.js
import { getDocs, collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebaseService';
import { logEvent } from './logger';
import { migrateGoals } from './migrationEngine';
import { createSnapshot } from './snapshotService';
import { CURRENT_DB_VERSION } from '../constants';
import { wipeAllGoals } from './goalService';

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

  if (!parsed || !Array.isArray(parsed.goals)) {
    logEvent('ERROR', 'Invalid import file: no goals array found.');
    throw new Error('Invalid import file');
  }

  // Always create snapshot before import
  await createSnapshot(`[Auto Before Import] ${new Date().toISOString()}`);

  const migrated = migrateGoals(parsed.goals, parsed.version);

  if (mode === 'replace') {
    // If empty, we still wipe
    await wipeAllGoals();
    // Then re-add
    for (const goal of migrated) {
      const ref = doc(db, GOALS_COLLECTION, goal.id);
      await setDoc(ref, goal);
    }
    logEvent('INFO', `Import complete (replace mode): ${migrated.length} goals.`);
  } else {
    // Merge
    const existingSnap = await getDocs(collection(db, GOALS_COLLECTION));
    const existingGoals = existingSnap.docs.map(d => d.data());
    const existingIds = new Set(existingGoals.map(g => g.id));
    const newOnes = migrated.filter(g => !existingIds.has(g.id));
    for (const goal of newOnes) {
      const ref = doc(db, GOALS_COLLECTION, goal.id);
      await setDoc(ref, goal);
    }
    logEvent('INFO', `Import complete (merge mode): ${newOnes.length} new goals added.`);
  }
};
