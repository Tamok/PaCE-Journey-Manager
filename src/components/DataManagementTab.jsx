// src/components/DataManagementTab.jsx

import React, { useEffect, useState } from 'react';
import { listSnapshots, createSnapshot, deleteSnapshot } from '../services/snapshotService';
import { exportGoals, importGoals } from '../services/importExportService';
import { Button } from './ui/button';
import { CURRENT_DB_VERSION } from '../constants';
import { logEvent } from '../services/logger';

const DataManagementTab = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState('replace');

  useEffect(() => { refresh(); }, []);
  const refresh = async () => setSnapshots(await listSnapshots());

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    const text = await file.text();
    const json = JSON.parse(text);
    setPreview(json);
    logEvent('INFO', `Loaded import file: ${file.name}`);
  };

  const handleImport = async () => {
    await importGoals(preview, mode);
    setPreview(null);
    refresh();
  };

  const handleDownload = async () => {
    const data = await exportGoals();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pace-goals-export-${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Button onClick={() => createSnapshot('Manual Snapshot').then(refresh)}>Save</Button>
        <Button onClick={handleDownload}>Export</Button>
        <label className="cursor-pointer border border-dashed p-2 rounded bg-white text-black"
               onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()}>
          Drop JSON Here
        </label>
      </div>

      {preview && (
        <div className="bg-yellow-100 text-black p-2 border">
          <p>Preview loaded file. Contains {preview.goals?.length || 0} goals. Version: {preview.version || 'N/A'}</p>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="replace">Replace</option>
            <option value="merge">Merge</option>
          </select>
          <Button onClick={handleImport}>Confirm Import</Button>
          <Button variant="outline" onClick={() => setPreview(null)}>Cancel</Button>
        </div>
      )}

      <table className="w-full text-sm mt-4">
        <thead>
          <tr><th></th><th>Name</th><th>Version</th><th>Date</th><th></th></tr>
        </thead>
        <tbody>
          {snapshots.map(s => (
            <tr key={s.id}>
              <td><input type="checkbox" checked={selected.has(s.id)} onChange={() => {
                const newSet = new Set(selected);
                newSet.has(s.id) ? newSet.delete(s.id) : newSet.add(s.id);
                setSelected(newSet);
              }} /></td>
              <td>{s.name}</td>
              <td>{s.version || 'unknown'}</td>
              <td>{new Date(s.createdAt).toLocaleString()}</td>
              <td><Button variant="destructive" size="sm" onClick={() => deleteSnapshot(s.id).then(refresh)}>Delete</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataManagementTab;
