// src/services/journeyService.js
import { collection, getDocs, writeBatch, doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseService";

const COLLECTION_NAME = "pace-journey-manager";

// One-time read function (still available if needed)
export async function loadJourneys() {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const journeys = [];
    snapshot.forEach(docSnap => {
      journeys.push(docSnap.data());
    });
    console.log("Loaded journey data from Firestore.");
    return journeys;
  } catch (error) {
    console.error("Error loading journeys:", error);
    return [];
  }
}

// Realtime subscription using onSnapshot.
export function subscribeToJourneys(callback) {
  const colRef = collection(db, COLLECTION_NAME);
  return onSnapshot(colRef, (snapshot) => {
    const journeys = [];
    snapshot.forEach(docSnap => {
      journeys.push(docSnap.data());
    });
    console.log("Realtime update: journey data updated.");
    callback(journeys);
  });
}

export async function saveJourneys(journeys) {
  try {
    console.log("Saving journeys to Firestore...");
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    journeys.forEach(journey => {
      const docRef = doc(db, COLLECTION_NAME, String(journey.id));
      batch.set(docRef, journey);
    });
    await batch.commit();
    console.log("Journeys saved successfully.");
  } catch (error) {
    console.error("Error saving journeys:", error);
  }
}

export async function resetJourneys() {
  try {
    console.log("Resetting journeys: clearing all data...");
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    console.log("All journeys have been removed.");
    return [];
  } catch (error) {
    console.error("Error resetting journeys:", error);
    return [];
  }
}
