import { Link } from 'react-router';
import { useState } from 'react';
import { StorageFactory } from '~/services/storage';
import { ImportService, ImportResult, ImportProgress as ImportProgressType } from '~/services/import';

type MigrationStep = 'intro' | 'configure' | 'confirm' | 'migrating' | 'complete';

export default function MigrationWizard() {
  const [step, setStep] = useState<MigrationStep>('intro');
  const [targetStorage, setTargetStorage] = useState<'cloud' | 'local'>('cloud');
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:8787');
  const [progress, setProgress] = useState<ImportProgressType | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleMigrate = async () => {
    setStep('migrating');
    setProgress(null);
    setResult(null);

    try {
      // Get current storage (assume local)
      const currentStorage = StorageFactory.createStorageService({ type: 'local' });
      
      // Create target storage
      const targetConfig = targetStorage === 'cloud' 
        ? { type: 'cloud' as const, apiBaseUrl, timeout: 10000 }
        : { type: 'local' as const };
      
      const newStorage = StorageFactory.createStorageService(targetConfig);
      
      // Create import service with current storage
      const importService = new ImportService(currentStorage);
      
      // Perform migration
      const migrationResult = await importService.migrateToCloud(newStorage, {
        mergeStrategy: 'merge',
        onProgress: (prog) => setProgress(prog)
      });
      
      setResult(migrationResult);
      setStep('complete');
    } catch (error) {
      setResult({
        success: false,
        imported: { users: 0, progress: 0, settings: 0 },
        skipped: { users: 0, progress: 0, settings: 0 },
        errors: [{
          type: 'storage',
          message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: false
        }]
      });
      setStep('complete');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <div className="wizard-step">
            <h2>Welcome to the Migration Wizard</h2>
            <p>This wizard will help you migrate your data between storage types:</p>
            <ul>
              <li><strong>Local Storage:</strong> Data stored on your device using IndexedDB</li>
              <li><strong>Cloud Storage:</strong> Data stored on a server for cross-device access</li>
            </ul>
            
            <div className="migration-options">
              <h3>What would you like to do?</h3>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="cloud"
                    checked={targetStorage === 'cloud'}
                    onChange={(e) => setTargetStorage(e.target.value as 'cloud')}
                  />
                  Migrate from Local to Cloud Storage
                  <p className="option-description">
                    Access your data from any device and automatic backup
                  </p>
                </label>
                <label>
                  <input
                    type="radio"
                    value="local"
                    checked={targetStorage === 'local'}
                    onChange={(e) => setTargetStorage(e.target.value as 'local')}
                  />
                  Migrate from Cloud to Local Storage
                  <p className="option-description">
                    Offline access and faster performance
                  </p>
                </label>
              </div>
            </div>

            <div className="wizard-actions">
              <button onClick={() => setStep('configure')} className="button primary">
                Next: Configure
              </button>
              <Link to="/settings" className="button secondary">Cancel</Link>
            </div>
          </div>
        );

      case 'configure':
        return (
          <div className="wizard-step">
            <h2>Configure Migration</h2>
            
            {targetStorage === 'cloud' && (
              <div className="config-section">
                <h3>Cloud Storage Configuration</h3>
                <div className="form-group">
                  <label htmlFor="apiBaseUrl">API Base URL:</label>
                  <input
                    id="apiBaseUrl"
                    type="text"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    placeholder="https://api.polyglottos.com"
                  />
                  <p className="help-text">
                    Enter the URL of your Polyglottos API server
                  </p>
                </div>
              </div>
            )}

            {targetStorage === 'local' && (
              <div className="config-section">
                <h3>Local Storage Configuration</h3>
                <p>No configuration needed for local storage. Your data will be stored using IndexedDB.</p>
              </div>
            )}

            <div className="wizard-actions">
              <button onClick={() => setStep('intro')} className="button secondary">
                Back
              </button>
              <button onClick={() => setStep('confirm')} className="button primary">
                Next: Confirm
              </button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="wizard-step">
            <h2>Confirm Migration</h2>
            
            <div className="confirmation-details">
              <h3>Migration Summary</h3>
              <ul>
                <li><strong>From:</strong> {targetStorage === 'cloud' ? 'Local Storage' : 'Cloud Storage'}</li>
                <li><strong>To:</strong> {targetStorage === 'cloud' ? 'Cloud Storage' : 'Local Storage'}</li>
                {targetStorage === 'cloud' && (
                  <li><strong>API URL:</strong> {apiBaseUrl}</li>
                )}
                <li><strong>Merge Strategy:</strong> Merge (combine existing data)</li>
              </ul>
            </div>

            <div className="warning-box">
              <h4>⚠️ Important Notes:</h4>
              <ul>
                <li>This will copy all your data to the new storage location</li>
                <li>Existing data in the target storage will be merged with your current data</li>
                <li>Your original data will remain unchanged</li>
                <li>The migration may take a few moments depending on data size</li>
              </ul>
            </div>

            <div className="wizard-actions">
              <button onClick={() => setStep('configure')} className="button secondary">
                Back
              </button>
              <button onClick={handleMigrate} className="button primary">
                Start Migration
              </button>
            </div>
          </div>
        );

      case 'migrating':
        return (
          <div className="wizard-step">
            <h2>Migrating Your Data...</h2>
            
            {progress && (
              <div className="migration-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="progress-message">{progress.message}</p>
                <p className="progress-stats">
                  Phase: {progress.phase} ({progress.current} / {progress.total})
                </p>
              </div>
            )}

            <p className="migration-status">Please wait while your data is being migrated...</p>
          </div>
        );

      case 'complete':
        return (
          <div className="wizard-step">
            <h2>{result?.success ? '✓ Migration Complete!' : '✗ Migration Failed'}</h2>
            
            {result && (
              <>
                {result.success ? (
                  <div className="success-message">
                    <p>Your data has been successfully migrated to {targetStorage} storage.</p>
                    
                    <div className="migration-stats">
                      <h3>Migration Summary</h3>
                      <ul>
                        <li>Users migrated: {result.imported.users}</li>
                        <li>Progress records migrated: {result.imported.progress}</li>
                        <li>Settings migrated: {result.imported.settings}</li>
                      </ul>
                    </div>

                    {result.skipped.users + result.skipped.progress + result.skipped.settings > 0 && (
                      <div className="skipped-items">
                        <h4>Skipped Items:</h4>
                        <ul>
                          {result.skipped.users > 0 && <li>Users: {result.skipped.users}</li>}
                          {result.skipped.progress > 0 && <li>Progress: {result.skipped.progress}</li>}
                          {result.skipped.settings > 0 && <li>Settings: {result.skipped.settings}</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="error-message">
                    <p>The migration encountered errors. Please review the details below.</p>
                    
                    {result.errors.length > 0 && (
                      <div className="error-list">
                        <h4>Errors:</h4>
                        <ul>
                          {result.errors.map((error, index) => (
                            <li key={index}>
                              <strong>{error.type}:</strong> {error.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="wizard-actions">
              {result?.success ? (
                <>
                  <Link to="/settings" className="button primary">
                    Go to Settings
                  </Link>
                  <Link to="/" className="button secondary">
                    Back to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <button onClick={() => setStep('intro')} className="button primary">
                    Try Again
                  </button>
                  <Link to="/settings" className="button secondary">
                    Back to Settings
                  </Link>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container migration-wizard">
      <h1>Storage Migration Wizard</h1>
      
      <div className="wizard-progress">
        <div className={`step ${step === 'intro' ? 'active' : ''}`}>
          1. Introduction
        </div>
        <div className={`step ${step === 'configure' ? 'active' : ['confirm', 'migrating', 'complete'].includes(step) ? 'complete' : ''}`}>
          2. Configure
        </div>
        <div className={`step ${step === 'confirm' ? 'active' : ['migrating', 'complete'].includes(step) ? 'complete' : ''}`}>
          3. Confirm
        </div>
        <div className={`step ${['migrating', 'complete'].includes(step) ? 'active' : ''}`}>
          4. Complete
        </div>
      </div>

      <div className="wizard-content">
        {renderStep()}
      </div>
    </div>
  );
}
