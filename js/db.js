// db.js
// Firestore-backed database layer for PaCE Journey Manager using the modular SDK.
// Includes a helper to sanitize data (removing undefined fields) for Firestore.

import { dbFirestore } from "./firebase-config.js";
import { defaultJourneyData } from "./defaultData.js";
import {
  collection,
  doc,
  getDocs,
  writeBatch
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const COLLECTION_NAME = "pace-journey-manager-list";

// Helper: Remove undefined fields using JSON serialization.
function sanitizeData(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Initialize default data in Firestore if empty.
export async function initializeDefaultData() {
  try {
    const colRef = collection(dbFirestore, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log("No journeys found in Firestore. Initializing with default data.");
      const batch = writeBatch(dbFirestore);
      defaultJourneyData.forEach(j => {
        const docRef = doc(dbFirestore, COLLECTION_NAME, String(j.id));
        batch.set(docRef, sanitizeData(j));
      });
      await batch.commit();
      return defaultJourneyData;
    } else {
      return loadJourneysFromFirestore();
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
    return defaultJourneyData;
  }
}

// Load journeys from Firestore.
export async function loadJourneysFromFirestore() {
  try {
    const colRef = collection(dbFirestore, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const journeys = [];
    snapshot.forEach(docSnap => {
      journeys.push(docSnap.data());
    });
    console.log("Journeys loaded from Firestore:", journeys);
    return journeys;
  } catch (error) {
    console.error("Error loading journeys:", error);
    return defaultJourneyData;
  }
}

// Save journey data to Firestore.
export async function saveJourneysToFirestore(journeys) {
  try {
    console.log("Saving journeys to Firestore...");
    const colRef = collection(dbFirestore, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(dbFirestore);
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    journeys.forEach(j => {
      const docRef = doc(dbFirestore, COLLECTION_NAME, String(j.id));
      batch.set(docRef, sanitizeData(j));
    });
    await batch.commit();
    console.log("Journeys saved to Firestore.");
  } catch (error) {
    console.error("Error saving journeys:", error);
  }
}

// Reset Firestore data to defaults.
export async function resetToDefaultData() {
  try {
    console.log("Resetting Firestore data to defaults...");
    const colRef = collection(dbFirestore, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(dbFirestore);
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    defaultJourneyData.forEach(j => {
      const docRef = doc(dbFirestore, COLLECTION_NAME, String(j.id));
      batch.set(docRef, sanitizeData(j));
    });
    await batch.commit();
    console.log("Successfully reset to default data.");
    return defaultJourneyData;
  } catch (error) {
    console.error("Error resetting to default data:", error);
    return defaultJourneyData;
  }
}
