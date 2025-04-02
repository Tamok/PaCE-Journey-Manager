// src/components/FloatingLogConsole.jsx
import React, { useEffect, useState } from 'react';
import { getStoredLogs, clearStoredLogs } from '../services/logger';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from '../services/firebaseService';
import '../styles/global.css';

const FloatingLogConsole = () => {
  const [localLogs, setLocalLogs] = useState(getStoredLogs());
  const [remoteLogs, setRemoteLogs] = useState([]);
  const [showLocal, setShowLocal] = useState(true);
  const [showRemote, setShowRemote] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Subscribe to local log changes (using the custom event)
  useEffect(() => {
    const handleNewLog = (e) => {
      setLocalLogs(prev => [e.detail, ...prev]);
    };
    window.addEventListener('log-message', handleNewLog);
    return () => window.removeEventListener('log-message', handleNewLog);
  }, []);

  // Subscribe to remote logs via Firestore realtime listener.
  useEffect(() => {
    const logsRef = collection(db, "logs");
    const q = query(logsRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        logs.push(`[${data.timestamp ? data.timestamp.toDate().toISOString() : "N/A"}][${data.tag}] ${data.message} (User: ${data.userEmail || ""})`);
      });
      setRemoteLogs(logs);
    });
    return () => unsubscribe();
  }, []);

  // Combine logs based on toggles and filter text.
  let combinedLogs = [];
  if (showLocal) {
    combinedLogs = combinedLogs.concat(localLogs.map(log => `[Local] ${log}`));
  }
  if (showRemote) {
    combinedLogs = combinedLogs.concat(remoteLogs.map(log => `[Remote] ${log}`));
  }
  if (filterText.trim() !== "") {
    combinedLogs = combinedLogs.filter(l => l.toLowerCase().includes(filterText.toLowerCase()));
  }

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      right: 0,
      width: '350px',
      height: '100%',
      backgroundColor: 'rgba(34,34,34,0.95)',
      color: '#fff',
      padding: '1rem',
      overflowY: 'auto',
      zIndex: 1000
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem'
    },
    headerText: { fontWeight: 'bold', fontSize: '1.1rem' },
    btn: { marginLeft: '0.5rem', padding: '0.25rem 0.5rem', cursor: 'pointer' },
    searchInput: { width: '100%', padding: '0.5rem', marginBottom: '0.5rem' },
    logContainer: { fontSize: '0.8rem', lineHeight: '1.2' },
    logEntry: { marginBottom: '0.25rem', wordWrap: 'break-word' },
    openBtn: {
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#222',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      zIndex: 1000
    }
  };

  return (
    <>
      {isOpen ? (
        <div style={styles.overlay}>
          <div style={styles.header}>
            <span style={styles.headerText}>Log Console</span>
            <div>
              <button onClick={() => { clearStoredLogs(); setLocalLogs([]); }} style={styles.btn}>Clear</button>
              <button onClick={() => setIsOpen(false)} style={styles.btn}>Close</button>
            </div>
          </div>
          <div style={{ marginBottom: "0.5rem", fontSize: "0.8rem" }}>
            <label>
              <input type="checkbox" checked={showLocal} onChange={() => setShowLocal(!showLocal)} /> Local Logs
            </label>{" "}
            <label>
              <input type="checkbox" checked={showRemote} onChange={() => setShowRemote(!showRemote)} /> Remote Logs
            </label>
          </div>
          <input
            type="text"
            placeholder="Filter logs..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.logContainer}>
            {combinedLogs.length === 0 ? (
              <p>No logs to display.</p>
            ) : (
              combinedLogs.map((log, i) => (
                <div key={i} style={styles.logEntry}>{log}</div>
              ))
            )}
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} style={styles.openBtn}>Open Log</button>
      )}
    </>
  );
};

export default FloatingLogConsole;
