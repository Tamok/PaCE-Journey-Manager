// db.js
// Firestore-backed database layer for PaCE Journey Manager using the modular SDK.

import { 
  collection,
  doc,
  getDocs,
  writeBatch,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import { dbFirestore } from "./firebase-config.js";  // from getFirestore(app)
import { defaultJourneyData } from "./defaultData.js";

const COLLECTION_NAME = "journeyTimeline";

/**
 * initializeDefaultData()
 * Checks if the collection is empty. If empty, inserts defaultJourneyData via batch.
 */
export async function initializeDefaultData() {
  try {
    const colRef = collection(dbFirestore, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log("No journeys found in Firestore. Initializing with default data.");
      const batch = writeBatch(dbFirestore);
      defaultJourneyData.forEach(j => {
        const docRef = doc(dbFirestore, COLLECTION_NAME, String(j.id));
        batch.set(docRef, j);
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

/**
 * loadJourneysFromFirestore()
 * Reads all docs from the collection and returns them as an array.
 */
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

/**
 * saveJourneysToFirestore(journeys)
 * Clears the collection, then writes the new journeys via batch.
 */
export async function saveJourneysToFirestore(journeys) {
  try {
    console.log("Saving journeys to Firestore...");
    const colRef = collection(dbFirestore, COLLECTION_NAME);
    // First read all docs so we can delete them
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(dbFirestore);

    // Delete all existing docs
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    // Add each item in journeys
    journeys.forEach(j => {
      const docRef = doc(dbFirestore, COLLECTION_NAME, String(j.id));
      batch.set(docRef, j);
    });

    await batch.commit();
    console.log("Journeys saved to Firestore.");
  } catch (error) {
    console.error("Error saving journeys:", error);
  }
}

/**
 * resetToDefaultData()
 * Similar to saveJourneysToFirestore but uses defaultJourneyData again.
 */
export async function resetToDefaultData() {
  try {
    console.log("Resetting Firestore data to defaults...");
    const colRef = collection(dbFirestore, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(dbFirestore);

    // Delete all existing docs
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    // Insert defaultJourneyData
    defaultJourneyData.forEach(j => {
      const docRef = doc(dbFirestore, COLLECTION_NAME, String(j.id));
      batch.set(docRef, j);
    });

    await batch.commit();
    console.log("Successfully reset to default data.");
    return defaultJourneyData;
  } catch (error) {
    console.error("Error resetting to default data:", error);
    return defaultJourneyData;
  }
}
