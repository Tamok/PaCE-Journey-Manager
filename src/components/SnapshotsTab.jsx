// src/components/SnapshotsTab.jsx
import React, { useEffect, useState } from 'react';
import {
  createSnapshot,
  listSnapshots,
  restoreSnapshot,
  deleteSnapshot,
  downloadSnapshotAsJson
} from '../services/snapshotService';
import { Button } from './ui/button';

const SnapshotsTab = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [newName, setNewName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(new Set());

  const refresh = async () => setSnapshots(await listSnapshots());

  useEffect(() => { refresh(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createSnapshot(newName);
    setNewName('');
    refresh();
  };

  const handleRestore = async (snap) => {
    if (!window.confirm(`Are you sure you want to restore snapshot "${snap.name}"?`)) return;
    await restoreSnapshot(snap.id);
    alert(`Snapshot "${snap.name}" restored successfully.`);
  };

  const handleDelete = async (snap) => {
    if (!window.confirm(`Delete snapshot "${snap.name}"? This cannot be undone.`)) return;
    await deleteSnapshot(snap.id);
    refresh();
  };

  const handleDownload = (snap) => {
    downloadSnapshotAsJson(snap);
  };

  // Basic sorting
  const sorted = [...snapshots].sort((a, b) => {
    if (sortKey === 'createdAt') {
      const ad = new Date(a.createdAt).getTime();
      const bd = new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? ad - bd : bd - ad;
    } else if (sortKey === 'version') {
      return sortDir === 'asc'
        ? (a.version || '').localeCompare(b.version || '')
        : (b.version || '').localeCompare(a.version || '');
    } else {
      // fallback: name
      return sortDir === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
  });

  // Basic search filter
  const filtered = sorted.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (s.version || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selected.size < filtered.length) {
      setSelected(new Set(filtered.map(s => s.id)));
    } else {
      setSelected(new Set());
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          placeholder="Snapshot name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="border p-1 flex-grow"
        />
        <Button onClick={handleCreate}>Create</Button>
      </div>

      <div className="flex gap-2 mb-2 items-center">
        <input
          type="text"
          className="border p-1"
          placeholder="Search snapshots..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value)}
          className="border p-1"
        >
          <option value="createdAt">Date</option>
          <option value="name">Name</option>
          <option value="version">Version</option>
        </select>
        <select
          value={sortDir}
          onChange={e => setSortDir(e.target.value)}
          className="border p-1"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <Button variant="outline" onClick={toggleSelectAll}>Select All</Button>
      </div>

      <table className="w-full text-sm mt-2">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Version</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(snap => (
            <tr key={snap.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.has(snap.id)}
                  onChange={() => {
                    const newSet = new Set(selected);
                    newSet.has(snap.id)
                      ? newSet.delete(snap.id)
                      : newSet.add(snap.id);
                    setSelected(newSet);
                  }}
                />
              </td>
              <td>{snap.name}</td>
              <td>{snap.version || 'unknown'}</td>
              <td>{new Date(snap.createdAt).toLocaleString()}</td>
              <td className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => handleRestore(snap)}>
                  Restore
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload(snap)}>
                  Download
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(snap)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-gray-500 p-2">
                No snapshots found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SnapshotsTab;
