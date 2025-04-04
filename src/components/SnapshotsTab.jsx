// src/components/SnapshotsTab.jsx
import React, { useEffect, useState } from 'react';
import { createSnapshot, listSnapshots, restoreSnapshot, deleteSnapshot } from '../services/snapshotService';
import { Button } from './ui/button';

const SnapshotsTab = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [newName, setNewName] = useState('');

  const refresh = async () => setSnapshots(await listSnapshots());

  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input placeholder="Snapshot name" value={newName} onChange={e => setNewName(e.target.value)} className="border p-1 flex-grow"/>
        <Button onClick={async () => { await createSnapshot(newName); setNewName(''); refresh(); }}>Create</Button>
      </div>
      <ul>
        {snapshots.map(snap => (
          <li key={snap.id} className="flex justify-between items-center">
            <span>{snap.name} - {new Date(snap.createdAt).toLocaleString()}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => restoreSnapshot(snap.id)}>Restore</Button>
              <Button variant="destructive" size="sm" onClick={() => { deleteSnapshot(snap.id); refresh(); }}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SnapshotsTab;
