// src/components/FloatingLogConsole.jsx
import React, { useEffect, useState } from 'react';
import { getStoredLogs, clearStoredLogs } from '../services/logger';
import '../styles/global.css';

const FloatingLogConsole = () => {
  const [logs, setLogs] = useState(getStoredLogs());
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleNewLog = (e) => setLogs(prev => [e.detail, ...prev]);
    window.addEventListener('log-message', handleNewLog);
    return () => window.removeEventListener('log-message', handleNewLog);
  }, []);

  const filteredLogs = logs.filter(log =>
    search.trim() === '' || log.toLowerCase().includes(search.toLowerCase())
  );

  const styles = {
    overlay: {
      position: 'fixed', top: 0, right: 0, width: '350px', height: '100%',
      backgroundColor: 'rgba(34,34,34,0.9)', color: '#fff', padding: '1rem',
      overflowY: 'auto', zIndex: 1000
    },
    header: {
      display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'
    },
    headerText: { fontWeight: 'bold', fontSize: '1.1rem' },
    btn: { marginLeft: '0.5rem', padding: '0.25rem 0.5rem', cursor: 'pointer' },
    searchInput: { width: '100%', padding: '0.5rem', marginBottom: '0.5rem' },
    logContainer: { fontSize: '0.8rem', lineHeight: '1.2' },
    logEntry: { marginBottom: '0.25rem', wordWrap: 'break-word' },
    openBtn: {
      position: 'fixed', bottom: '1rem', right: '1rem', padding: '0.5rem 1rem',
      backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '4px',
      cursor: 'pointer', zIndex: 1000
    }
  };

  return (
    <>
      {isOpen ? (
        <div style={styles.overlay}>
          <div style={styles.header}>
            <span style={styles.headerText}>Log Console</span>
            <div>
              <button onClick={() => { clearStoredLogs(); setLogs([]); }} style={styles.btn}>Clear</button>
              <button onClick={() => setIsOpen(false)} style={styles.btn}>Close</button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.logContainer}>
            {filteredLogs.map((log, i) => (
              <div key={i} style={styles.logEntry}>{log}</div>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} style={styles.openBtn}>
          Open Log
        </button>
      )}
    </>
  );
};

export default FloatingLogConsole;
