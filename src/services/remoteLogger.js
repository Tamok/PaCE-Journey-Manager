// src/services/remoteLogger.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseService";

/**
 * Stores a log entry in Firestore.
 * Each entry includes a timestamp, tag, message, and optional user identifier.
 * 
 * @param {string} tag - The log level/tag (e.g., INFO, WARN, ERROR).
 * @param {string} message - The log message.
 * @param {string} [userEmail] - Optional email of the user (if available).
 * @returns {Promise<void>}
 */
export async function storeLogToFirestore(tag, message, userEmail = "") {
  try {
    const colRef = collection(db, "logs");
    await addDoc(colRef, {
      timestamp: serverTimestamp(),
      tag,
      message,
      userEmail
    });
    console.log("Remote log stored successfully.");
  } catch (error) {
    console.error("Error storing remote log:", error);
  }
}
