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
  // Sorting state managed via header clicks
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(new Set());

  const refresh = async () => setSnapshots(await listSnapshots());

  useEffect(() => { refresh(); }, []);

  // Create a new snapshot
  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createSnapshot(newName);
    setNewName('');
    refresh();
  };

  // Restore a snapshot after confirmation
  const handleRestore = async (snap) => {
    if (!window.confirm(`Are you sure you want to restore snapshot "${snap.name}"?`)) return;
    await restoreSnapshot(snap.id);
    alert(`Snapshot "${snap.name}" restored successfully.`);
  };

  // Delete a snapshot after confirmation
  const handleDelete = async (snap) => {
    if (!window.confirm(`Delete snapshot "${snap.name}"? This cannot be undone.`)) return;
    await deleteSnapshot(snap.id);
    refresh();
  };

  // Download a snapshot as JSON
  const handleDownload = (snap) => {
    downloadSnapshotAsJson(snap);
  };

  // Handle select all checkbox in header
  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelected(new Set(snapshots.map(s => s.id)));
    } else {
      setSelected(new Set());
    }
  };

  // Toggle individual snapshot selection
  const toggleSelect = (id) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelected(newSet);
  };

  // Toggle sorting when clicking on header cells
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Bulk action handlers for selected snapshots
  const handleBulkDownload = () => {
    sorted.filter(s => selected.has(s.id)).forEach(snap => downloadSnapshotAsJson(snap));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the selected snapshots? This cannot be undone.")) return;
    for (let snap of sorted.filter(s => selected.has(s.id))) {
      await deleteSnapshot(snap.id);
    }
    refresh();
    setSelected(new Set());
  };

  // Sort snapshots based on the selected sort key and direction
  const sorted = [...snapshots].sort((a, b) => {
    if (sortKey === 'createdAt') {
      const ad = new Date(a.createdAt).getTime();
      const bd = new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? ad - bd : bd - ad;
    } else if (sortKey === 'version') {
      return sortDir === 'asc'
        ? (a.version || '').localeCompare(b.version || '')
        : (b.version || '').localeCompare(a.version || '');
    } else if (sortKey === 'name') {
      return sortDir === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  return (
    <div>
      {/* Snapshot creation */}
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Snapshot name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="border p-1 flex-grow"
        />
        <Button onClick={handleCreate}>Create</Button>
      </div>

      {/* Bulk action buttons shown when all snapshots are selected */}
      {selected.size === snapshots.length && snapshots.length > 0 && (
        <div className="flex gap-2 my-2">
          <Button variant="outline" onClick={handleBulkDownload}>
            Download All
          </Button>
          <Button variant="destructive" onClick={handleBulkDelete}>
            Delete All
          </Button>
        </div>
      )}

      <table className="w-full text-sm mt-2">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selected.size === snapshots.length && snapshots.length > 0}
                onChange={handleSelectAllChange}
              />
            </th>
            <th onClick={() => handleSort('name')} className="cursor-pointer">
              Name {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('version')} className="cursor-pointer">
              Version {sortKey === 'version' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th onClick={() => handleSort('createdAt')} className="cursor-pointer">
              Date {sortKey === 'createdAt' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(snap => (
            <tr key={snap.id} className="hover:bg-gray-100">
              <td>
                <input
                  type="checkbox"
                  checked={selected.has(snap.id)}
                  onChange={() => toggleSelect(snap.id)}
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
          {sorted.length === 0 && (
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
