// src/services/snapshotService.js
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { db, auth } from './firebaseService';
import { CURRENT_DB_VERSION } from '../constants';
import { logEvent } from './logger';

const SNAPSHOT_COLLECTION = 'pace-goals-snapshots';
const GOALS_COLLECTION = 'pace-goals';

// Create a snapshot of current goals
export const createSnapshot = async (name) => {
  const userEmail = auth.currentUser?.email || 'unknown';
  const snapshot = await getDocs(collection(db, GOALS_COLLECTION));
  const goals = snapshot.docs.map(d => d.data());

  const docData = {
    name,
    createdAt: new Date().toISOString(),
    createdBy: userEmail,
    version: CURRENT_DB_VERSION,
    goals
  };

  await addDoc(collection(db, SNAPSHOT_COLLECTION), docData);
  logEvent('INFO', `Snapshot '${name}' created.`, userEmail);
};

// List all snapshots
export const listSnapshots = async () => {
  const snapshot = await getDocs(collection(db, SNAPSHOT_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Restore a snapshot
export const restoreSnapshot = async (snapshotId) => {
  const userEmail = auth.currentUser?.email || 'unknown';
  const docSnap = await getDoc(doc(db, SNAPSHOT_COLLECTION, snapshotId));
  if (!docSnap.exists()) {
    logEvent('ERROR', `Snapshot ${snapshotId} not found.`, userEmail);
    throw new Error('Snapshot not found');
  }

  const { goals } = docSnap.data();
  // Clear existing
  const existing = await getDocs(collection(db, GOALS_COLLECTION));
  for (const e of existing.docs) {
    await deleteDoc(doc(db, GOALS_COLLECTION, e.id));
  }
  // Then restore
  for (const goal of goals) {
    const ref = doc(db, GOALS_COLLECTION, goal.id);
    await setDoc(ref, goal);
  }

  logEvent('INFO', `Snapshot '${docSnap.data().name}' restored.`, userEmail);
};

// Delete a snapshot
export const deleteSnapshot = async (snapshotId) => {
  const userEmail = auth.currentUser?.email || 'unknown';
  await deleteDoc(doc(db, SNAPSHOT_COLLECTION, snapshotId));
  logEvent('INFO', `Snapshot ${snapshotId} deleted.`, userEmail);
};

// Download snapshot as JSON
export const downloadSnapshotAsJson = (snap) => {
  const { goals, name, createdAt, version } = snap;
  const data = {
    name,
    version,
    createdAt,
    goals
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
  logEvent('INFO', `Snapshot '${name}' downloaded.`);
};
