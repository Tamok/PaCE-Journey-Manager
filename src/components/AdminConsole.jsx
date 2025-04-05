// src/components/AdminConsole.jsx
import React, { useEffect, useState } from 'react';
import { getStoredLogs, clearStoredLogs } from '../services/logger';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from '../services/firebaseService';
import SnapshotsTab from './SnapshotsTab';
import DataManagementTab from './DataManagementTab';
import { Button } from './ui/button';
import ImpersonationBanner from './ImpersonationBanner';

const AdminConsole = ({ setImpersonationMode }) => {
  const [activeTab, setActiveTab] = useState('Logs');
  const [localLogs, setLocalLogs] = useState(getStoredLogs());
  const [remoteLogs, setRemoteLogs] = useState([]);
  const [showLocal, setShowLocal] = useState(false);
  const [showRemote, setShowRemote] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [impersonating, setImpersonating] = useState(false);
  // New: default timezone state
  const [defaultTimezone, setDefaultTimezone] = useState(localStorage.getItem('defaultTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    const handleNewLog = (e) => setLocalLogs(prev => [e.detail, ...prev]);
    window.addEventListener('log-message', handleNewLog);
    return () => window.removeEventListener('log-message', handleNewLog);
  }, []);

  useEffect(() => {
    const logsRef = collection(db, "logs");
    const q = query(logsRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      setRemoteLogs(snapshot.docs.map(doc => {
        const data = doc.data();
        return `[${data.timestamp?.toDate().toLocaleString('en-US', { timeZone: defaultTimezone })}][${data.tag}] ${data.message} (User: ${data.userEmail})`;
      }));
    });
    return unsubscribe;
  }, [defaultTimezone]);

  const toggleImpersonation = () => {
    setImpersonating(prev => !prev);
    setImpersonationMode(prev => !prev);
  };

  const combinedLogs = [
    ...(showLocal ? localLogs.map(l => `[Local] ${l}`) : []),
    ...(showRemote ? remoteLogs.map(l => `[Remote] ${l}`) : [])
  ].filter(l => l.toLowerCase().includes(filterText.toLowerCase()));

  // Handler for timezone change
  const handleTimezoneChange = (e) => {
    setDefaultTimezone(e.target.value);
    localStorage.setItem('defaultTimezone', e.target.value);
  };

  return (
    <>
      {impersonating && <ImpersonationBanner />}
      {isOpen ? (
        <div className="fixed top-0 right-0 w-[600px] max-w-full h-full bg-gray-900 bg-opacity-90 text-white p-4 overflow-auto z-50 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg">Admin Console</span>
            <div>
              <Button variant="outline" size="sm"
                onClick={() => { clearStoredLogs(); setLocalLogs([]); }}>
                Clear Logs
              </Button>
              <Button variant="destructive" size="sm" className="ml-2" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </div>

          {/* New: Timezone selection */}
          <div className="mb-4">
            <label className="text-sm font-bold mr-2">Default Timezone:</label>
            <select value={defaultTimezone} onChange={handleTimezoneChange} className="text-black p-1 border">
              {/* Ideally, this list would be more comprehensive */}
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="America/New_York">America/New_York</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>

          <div className="flex gap-2 mb-3">
            <Button variant={activeTab === 'Logs' ? 'default' : 'outline'} size="sm"
              onClick={() => setActiveTab('Logs')}>
              Logs
            </Button>
            <Button variant={activeTab === 'Snapshots' ? 'default' : 'outline'} size="sm"
              onClick={() => setActiveTab('Snapshots')}>
              Snapshots
            </Button>
            <Button variant={activeTab === 'Data' ? 'default' : 'outline'} size="sm"
              onClick={() => setActiveTab('Data')}>
              Data
            </Button>
            <Button size="sm" variant="secondary" className="ml-auto" onClick={toggleImpersonation}>
              {impersonating ? 'Exit Reader View' : 'Reader View'}
            </Button>
          </div>

          {activeTab === 'Logs' && (
            <>
              <input
                className="w-full p-2 text-black mb-2"
                placeholder="Filter logs..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
              />
              <div className="text-xs mb-2">
                <label className="mr-2">
                  <input
                    type="checkbox"
                    checked={showLocal}
                    onChange={() => setShowLocal(!showLocal)}
                  /> Local Logs
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showRemote}
                    onChange={() => setShowRemote(!showRemote)}
                  /> Remote Logs
                </label>
              </div>
              <div className="overflow-auto h-[70vh] text-xs border border-gray-700 p-2">
                {combinedLogs.length > 0
                  ? combinedLogs.map((log, i) => <div key={i} className="mb-1 break-words">{log}</div>)
                  : <p>No logs to display.</p>
                }
              </div>
            </>
          )}

          {activeTab === 'Snapshots' && <SnapshotsTab />}
          {activeTab === 'Data' && <DataManagementTab />}
        </div>
      ) : (
        <Button className="fixed bottom-4 right-4 z-50" onClick={() => setIsOpen(true)}>
          Admin Console
        </Button>
      )}
    </>
  );
};

export default AdminConsole;
