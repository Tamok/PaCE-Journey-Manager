// src/services/goalService.js
import { v4 as uuidv4 } from 'uuid';
import { db, auth } from './firebaseService';
import {
  collection, onSnapshot, writeBatch, doc, getDocs, deleteDoc, setDoc
} from 'firebase/firestore';
import { logEvent } from './logger';

const COLLECTION_NAME = 'pace-goals';

// Realtime subscription to goals
export const subscribeToGoals = (callback) => {
  return onSnapshot(collection(db, COLLECTION_NAME), snapshot => {
    const goals = snapshot.docs.map(doc => doc.data());
    const userEmail = auth.currentUser?.email || 'unknown';
    logEvent("INFO", `Realtime goal data updated: ${goals.length} items.`, userEmail);
    callback(goals);
  }, error => {
    logEvent("ERROR", `Realtime subscription failed: ${error.message}`);
  });
};

// Persist an entire array of goals (batch replace)
export const persistGoals = async (goals) => {
  const userEmail = auth.currentUser?.email || 'unknown';
  const batch = writeBatch(db);
  const colRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(colRef);

  // Clear existing
  snapshot.forEach(docSnap => batch.delete(docSnap.ref));

  // Insert new
  goals.forEach(goal => {
    const goalRef = doc(db, COLLECTION_NAME, goal.id);
    batch.set(goalRef, goal);
  });

  try {
    await batch.commit();
    logEvent("INFO", "Goals persisted successfully.", userEmail);
  } catch (error) {
    logEvent("ERROR", `Failed to persist goals: ${error.message}`, userEmail);
  }
};

// Utility to create a new Goal
export const createGoal = (title, priority = 'Next', difficulty = 'Easy', note = '') => {
  return {
    id: uuidv4(),
    title,
    priority,
    difficulty,
    note,
    podioLink: '',
    zohoLink: '',
    completedDate: null,
    scheduledStartDate: null,
    parentId: null,
    createdAt: new Date().toISOString(),
    createdBy: auth.currentUser?.email || 'unknown'
  };
};

// Update a single goal in Firestore (overwrites the doc)
export const updateGoal = async (goal) => {
  const userEmail = auth.currentUser?.email || 'unknown';
  try {
    const ref = doc(db, COLLECTION_NAME, goal.id);
    await setDoc(ref, goal);
    logEvent("INFO", `Goal ${goal.id} updated successfully.`, userEmail);
  } catch (error) {
    logEvent("ERROR", `Failed to update goal ${goal.id}: ${error.message}`, userEmail);
    throw error;
  }
};

// Wipe all goals
export const wipeAllGoals = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  for (const docSnap of snapshot.docs) {
    await deleteDoc(docSnap.ref);
  }
  logEvent("INFO", "All goals wiped from Firestore.");
};
