// src/components/DataManagementTab.jsx
import React, { useState } from 'react';
import { exportGoals, importGoals } from '../services/importExportService';
import { wipeAllGoals } from '../services/goalService';
import { Button } from './ui/button';
import { logEvent } from '../services/logger';

const DataManagementTab = () => {
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState('replace');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    await readImportFile(file);
  };

  const handleFileClick = (e) => {
    e.preventDefault();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = async (evt) => {
      const f = evt.target.files[0];
      if (f) await readImportFile(f);
    };
    fileInput.click();
  };

  const readImportFile = async (file) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setPreview(json);
      logEvent('INFO', `Loaded import file: ${file.name}`);
    } catch (err) {
      alert(`Invalid JSON file: ${err.message}`);
    }
    setIsLoading(false);
  };

  const handleImport = async () => {
    if (!preview) return;
    setIsLoading(true);
    try {
      await importGoals(preview, mode);
      alert(`Import complete! (mode: ${mode})`);
    } catch (err) {
      alert(`Import error: ${err.message}`);
    } finally {
      setPreview(null);
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const data = await exportGoals();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pace-goals-export-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Download error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWipeAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL Goals data? This cannot be undone.")) return;
    setIsLoading(true);
    try {
      await wipeAllGoals();
      alert("All goals deleted successfully.");
    } catch (err) {
      alert(`Error wiping data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button onClick={handleDownload} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Download .JSON'}
        </Button>
        <Button variant="destructive" onClick={handleWipeAll} disabled={isLoading}>
          {isLoading ? 'Wiping...' : 'Wipe All Data'}
        </Button>
      </div>

      <div
        className="cursor-pointer border border-dashed p-4 rounded bg-white text-black text-center"
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleFileClick}
      >
        {isLoading
          ? 'Loading...'
          : 'Drop JSON Here or Click to Browse'
        }
      </div>

      {preview && (
        <div className="bg-yellow-100 text-black p-2 border mt-4">
          <p>
            Preview loaded file. Contains {preview.goals?.length || 0} goals.
            {preview.version && <> Version: {preview.version}</>}
          </p>
          <label className="mr-2">
            Mode:
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="ml-1 border"
            >
              <option value="replace">Replace</option>
              <option value="merge">Merge</option>
            </select>
          </label>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? 'Importing...' : 'Confirm Import'}
          </Button>
          <Button variant="outline" onClick={() => setPreview(null)} className="ml-2">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataManagementTab;
