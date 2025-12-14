import { Link } from 'react-router';
import { useState, useRef } from 'react';
import { getStorageService } from '~/services/storage';
import { ImportService, ImportResult, ImportProgress as ImportProgressType, ConflictInfo } from '~/services/import';

export default function ImportData() {
  const [importType, setImportType] = useState<'json' | 'csv'>('json');
  const [csvDataType, setCsvDataType] = useState<'users' | 'progress' | 'settings'>('progress');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState<ImportProgressType | null>(null);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [currentConflict, setCurrentConflict] = useState<ConflictInfo | null>(null);
  const [mergeStrategy, setMergeStrategy] = useState<'skip' | 'overwrite' | 'merge'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);
    setProgress(null);
    setConflicts([]);

    try {
      const content = await file.text();
      const storage = getStorageService();
      const importService = new ImportService(storage);

      let importResult: ImportResult;

      if (importType === 'json') {
        importResult = await importService.importJSON(content, {
          mergeStrategy,
          onProgress: (prog) => setProgress(prog),
          onConflict: async (conflict) => {
            return await new Promise((resolve) => {
              setCurrentConflict(conflict);
              setConflicts(prev => [...prev, conflict]);
              // Default resolution for now
              resolve(mergeStrategy);
            });
          }
        });
      } else {
        importResult = await importService.importCSV(content, csvDataType, {
          mergeStrategy,
          onProgress: (prog) => setProgress(prog),
          onConflict: async (conflict) => {
            return await new Promise((resolve) => {
              setCurrentConflict(conflict);
              setConflicts(prev => [...prev, conflict]);
              resolve(mergeStrategy);
            });
          }
        });
      }

      setResult(importResult);
    } catch (error) {
      setResult({
        success: false,
        imported: { users: 0, progress: 0, settings: 0 },
        skipped: { users: 0, progress: 0, settings: 0 },
        errors: [{
          type: 'validation',
          message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: false
        }]
      });
    } finally {
      setImporting(false);
      setCurrentConflict(null);
    }
  };

  const handleValidateOnly = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    const content = await file.text();
    const storage = getStorageService();
    const importService = new ImportService(storage);

    try {
      let importResult: ImportResult;
      
      if (importType === 'json') {
        importResult = await importService.importJSON(content, { validateOnly: true });
      } else {
        importResult = await importService.importCSV(content, csvDataType, { validateOnly: true });
      }

      setResult(importResult);
    } catch (error) {
      setResult({
        success: false,
        imported: { users: 0, progress: 0, settings: 0 },
        skipped: { users: 0, progress: 0, settings: 0 },
        errors: [{
          type: 'validation',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: false
        }]
      });
    }
  };

  return (
    <div className="container">
      <h1>Import Data</h1>
      
      <div className="import-section">
        <h2>Import Your Learning Data</h2>
        <p>Import previously exported data to restore or merge with your current progress.</p>
        
        <div className="import-options">
          <div className="import-type-selector">
            <h3>Select Import Format</h3>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="json"
                  checked={importType === 'json'}
                  onChange={(e) => setImportType(e.target.value as 'json')}
                  disabled={importing}
                />
                JSON Format (Complete data with all relationships)
              </label>
              <label>
                <input
                  type="radio"
                  value="csv"
                  checked={importType === 'csv'}
                  onChange={(e) => setImportType(e.target.value as 'csv')}
                  disabled={importing}
                />
                CSV Format (Spreadsheet data)
              </label>
            </div>
          </div>

          {importType === 'csv' && (
            <div className="csv-type-selector">
              <h3>Select Data Type</h3>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="progress"
                    checked={csvDataType === 'progress'}
                    onChange={(e) => setCsvDataType(e.target.value as 'progress')}
                    disabled={importing}
                  />
                  Progress Data
                </label>
                <label>
                  <input
                    type="radio"
                    value="users"
                    checked={csvDataType === 'users'}
                    onChange={(e) => setCsvDataType(e.target.value as 'users')}
                    disabled={importing}
                  />
                  User Data
                </label>
                <label>
                  <input
                    type="radio"
                    value="settings"
                    checked={csvDataType === 'settings'}
                    onChange={(e) => setCsvDataType(e.target.value as 'settings')}
                    disabled={importing}
                  />
                  Settings
                </label>
              </div>
            </div>
          )}

          <div className="merge-strategy-selector">
            <h3>Conflict Resolution Strategy</h3>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="merge"
                  checked={mergeStrategy === 'merge'}
                  onChange={(e) => setMergeStrategy(e.target.value as 'merge')}
                  disabled={importing}
                />
                Merge (Combine existing and imported data)
              </label>
              <label>
                <input
                  type="radio"
                  value="overwrite"
                  checked={mergeStrategy === 'overwrite'}
                  onChange={(e) => setMergeStrategy(e.target.value as 'overwrite')}
                  disabled={importing}
                />
                Overwrite (Replace existing with imported)
              </label>
              <label>
                <input
                  type="radio"
                  value="skip"
                  checked={mergeStrategy === 'skip'}
                  onChange={(e) => setMergeStrategy(e.target.value as 'skip')}
                  disabled={importing}
                />
                Skip (Keep existing, ignore imported duplicates)
              </label>
            </div>
          </div>

          <div className="file-upload">
            <h3>Select File to Import</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept={importType === 'json' ? '.json' : '.csv'}
              onChange={handleFileUpload}
              disabled={importing}
            />
            <button
              onClick={handleValidateOnly}
              disabled={importing || !fileInputRef.current?.files?.[0]}
              className="button secondary"
            >
              Validate Only (Don't Import)
            </button>
          </div>
        </div>

        {progress && (
          <div className="import-progress">
            <h3>Import Progress</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <p>{progress.message} ({progress.current} / {progress.total})</p>
            <p>Phase: {progress.phase}</p>
          </div>
        )}

        {result && (
          <div className={`import-result ${result.success ? 'success' : 'error'}`}>
            <h3>{result.success ? '✓ Import Successful' : '✗ Import Failed'}</h3>
            
            <div className="result-stats">
              <div className="stat-group">
                <h4>Imported</h4>
                <ul>
                  <li>Users: {result.imported.users}</li>
                  <li>Progress: {result.imported.progress}</li>
                  <li>Settings: {result.imported.settings}</li>
                </ul>
              </div>
              
              <div className="stat-group">
                <h4>Skipped</h4>
                <ul>
                  <li>Users: {result.skipped.users}</li>
                  <li>Progress: {result.skipped.progress}</li>
                  <li>Settings: {result.skipped.settings}</li>
                </ul>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="errors">
                <h4>Errors ({result.errors.length})</h4>
                <ul>
                  {result.errors.map((error, index) => (
                    <li key={index} className={error.recoverable ? 'warning' : 'error'}>
                      <strong>{error.type}:</strong> {error.message}
                      {error.field && <span> (Field: {error.field})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {conflicts.length > 0 && (
              <div className="conflicts">
                <h4>Conflicts Resolved ({conflicts.length})</h4>
                <p>All conflicts were resolved using the "{mergeStrategy}" strategy.</p>
              </div>
            )}
          </div>
        )}

        <div className="import-info">
          <h4>Import Guidelines:</h4>
          <ul>
            <li><strong>JSON Format:</strong> Import complete data exported from this application</li>
            <li><strong>CSV Format:</strong> Import data from spreadsheets or other applications</li>
            <li><strong>Merge Strategy:</strong> Choose how to handle existing data conflicts</li>
            <li><strong>Validation:</strong> Use "Validate Only" to check your file before importing</li>
            <li><strong>Backup:</strong> Consider exporting your current data before importing</li>
          </ul>
        </div>
      </div>

      <div className="navigation-actions">
        <Link to="/settings" className="button">Back to Settings</Link>
        <Link to="/" className="button">Back to Dashboard</Link>
      </div>
    </div>
  );
}
