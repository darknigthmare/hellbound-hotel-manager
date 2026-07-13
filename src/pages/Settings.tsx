import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Cloud, Download, HardDrive, History, RotateCcw, Settings2, ShieldCheck, Upload } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { db, StorageStatus } from '../db/localDb';
import { DatabaseBackupState, ExportImport, MAX_BACKUP_BYTES } from '../lib/export-import';
import { AppSettings, AuditLog } from '../types';

interface SettingsProps {
  state: {
    auditLogs: AuditLog[];
    settings: AppSettings;
  };
  onStateChange: () => void;
}

type Notice = { success: boolean; msg: string } | null;
type PendingImport = {
  fileName: string;
  state: DatabaseBackupState;
  migrated: boolean;
  warnings: string[];
} | null;

export const Settings: React.FC<SettingsProps> = ({ state, onStateChange }) => {
  const { auditLogs, settings } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(() => db.getStorageStatus());
  const recoveryKeys = db.getRecoveryKeys();

  useEffect(() => db.subscribeToStorageErrors(() => setStorageStatus(db.getStorageStatus())), []);

  const refresh = () => {
    setStorageStatus(db.getStorageStatus());
    onStateChange();
  };

  const handleExportDb = () => {
    try {
      const json = ExportImport.exportToJson(db.getFullState());
      const blobUrl = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `hellbound_hotel_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      db.logAction('DATABASE_EXPORT', 'User downloaded a complete versioned JSON backup including inventory.');
      setNotice({ success: true, msg: 'Complete versioned backup exported, including facility inventory.' });
      refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The backup could not be created.';
      setNotice({ success: false, msg: message });
    }
  };

  const handleImportDb = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';

    if (file.size > MAX_BACKUP_BYTES) {
      setNotice({ success: false, msg: 'Backup exceeds the 2 MiB import limit.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const validation = ExportImport.validateBackup(String(loadEvent.target?.result ?? ''), { requireInventory: true });
      if (!validation.isValid || !validation.parsedState) {
        setNotice({ success: false, msg: validation.error || 'Invalid backup file.' });
        return;
      }
      setPendingImport({
        fileName: file.name,
        state: validation.parsedState,
        migrated: Boolean(validation.migrated),
        warnings: validation.warnings || []
      });
      setNotice({ success: true, msg: 'Backup validated. Confirm the replacement to finish the import.' });
    };
    reader.onerror = () => setNotice({ success: false, msg: 'The selected file could not be read.' });
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    const pending = pendingImport;
    setPendingImport(null);
    if (!db.importState(pending.state)) {
      setNotice({ success: false, msg: db.getStorageStatus().lastError?.message || 'Backup could not be restored.' });
      refresh();
      return;
    }

    const migrationNote = pending.migrated ? ' Legacy data was migrated safely.' : '';
    const warnings = pending.warnings.length ? ` ${pending.warnings.join(' ')}` : '';
    setNotice({ success: true, msg: `Backup restored successfully.${migrationNote}${warnings}` });
    refresh();
  };

  const handleResetDb = () => {
    const success = db.resetToSeed();
    setIsResetConfirmOpen(false);
    setNotice(success
      ? { success: true, msg: 'Database and facility inventory reset to the verified seed.' }
      : { success: false, msg: db.getStorageStatus().lastError?.message || 'Reset failed.' });
    refresh();
  };

  const handlePurgeLogs = () => {
    if (db.clearAuditLogs()) {
      setNotice({ success: true, msg: 'Audit history cleared; the purge action remains recorded.' });
    }
    refresh();
  };

  const handleSettingsChange = (next: Partial<AppSettings>) => {
    if (!db.saveSettings({ ...settings, ...next })) {
      setNotice({ success: false, msg: db.getStorageStatus().lastError?.message || 'Settings could not be saved.' });
    }
    refresh();
  };

  const handleRestoreRecovery = (key: string) => {
    const success = db.restoreRecovery(key);
    setNotice(success
      ? { success: true, msg: 'Recovery snapshot validated and restored.' }
      : { success: false, msg: db.getStorageStatus().lastError?.message || 'Recovery snapshot is not valid.' });
    refresh();
  };

  const handleDownloadRecovery = (key: string) => {
    const raw = db.getRecoverySnapshot(key);
    if (raw === null) {
      setNotice({ success: false, msg: db.getStorageStatus().lastError?.message || 'Recovery snapshot could not be read.' });
      setStorageStatus(db.getStorageStatus());
      return;
    }

    const suffix = key.replace('hellbound_hotel_db_state_recovery_', '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const blobUrl = URL.createObjectURL(new Blob([raw], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `hellbound_hotel_recovery_raw_${suffix}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
    setNotice({ success: true, msg: 'Raw recovery snapshot downloaded without modifying it.' });
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-heading">
        <div>
          <h1>System Settings & Privacy</h1>
          <p>Manage versioned backups, simulation settings, recovery snapshots and optional cloud storage.</p>
        </div>
      </div>

      {notice && (
        <div className={`settings-notice${notice.success ? ' is-success' : ' is-error'}`} role="status">
          {notice.msg}
        </div>
      )}

      {!storageStatus.ok && storageStatus.lastError && (
        <div className="settings-notice is-error" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>Local storage write failed during {storageStatus.lastError.operation}.</strong>
            <span>{storageStatus.lastError.message} Your latest change may not persist after reload.</span>
          </div>
        </div>
      )}

      {!storageStatus.persistent && (
        <div className="settings-notice is-error" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>Session-only storage is active.</strong>
            <span>The browser denied persistent storage. Changes exist only in memory and will be lost when this tab reloads or closes.</span>
          </div>
        </div>
      )}

      {recoveryKeys.length > 0 && (
        <div className="settings-notice is-error" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>A raw recovery copy was created.</strong>
            <span>The previous local data needed migration or failed validation. Download the untouched copy below before restoring or clearing browser data.</span>
          </div>
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-column">
          <section className="glass-panel settings-card" aria-labelledby="backup-title">
            <h2 id="backup-title"><HardDrive size={19} aria-hidden="true" /> Local backups & recovery</h2>
            <p>Exports are schema-versioned, fully validated, and include the bar, cleaning and food inventory.</p>

            <div className="settings-actions">
              <button type="button" className="btn btn-gold" onClick={handleExportDb} id="export-json-btn">
                <Download size={16} aria-hidden="true" /> Export complete backup
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} id="import-json-btn">
                <Upload size={16} aria-hidden="true" /> Import validated backup
              </button>
              <input
                className="sr-only"
                type="file"
                ref={fileInputRef}
                onChange={handleImportDb}
                accept="application/json,.json"
                aria-label="Choose a Hellbound Hotel JSON backup"
              />
            </div>

            {recoveryKeys.length > 0 && (
              <div className="recovery-list">
                <h3>Automatic recovery snapshots</h3>
                <p>Invalid or legacy local data is preserved before repair instead of being silently destroyed.</p>
                {recoveryKeys.slice(0, 5).map((key) => (
                  <div key={key}>
                    <code>{key.replace('hellbound_hotel_db_state_recovery_', '')}</code>
                    <div className="settings-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => handleDownloadRecovery(key)}>
                        <Download size={15} aria-hidden="true" /> Download raw copy
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => handleRestoreRecovery(key)}>
                        Validate & restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="settings-danger-zone">
              <h3>Reset database to seed</h3>
              <p>Restores roster, rooms, lore, logs and all inventory counters to the bundled baseline.</p>
              <button type="button" className="btn btn-danger" onClick={() => setIsResetConfirmOpen(true)} id="reset-db-btn">
                <RotateCcw size={16} aria-hidden="true" /> Reset database and inventory
              </button>
            </div>
          </section>

          <section className="glass-panel settings-card" aria-labelledby="simulation-title">
            <h2 id="simulation-title"><Settings2 size={19} aria-hidden="true" /> Simulation preferences</h2>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.randomEventsEnabled}
                onChange={(event) => handleSettingsChange({ randomEventsEnabled: event.target.checked })}
              />
              <span>
                <strong>Allow narrative events</strong>
                <small>When disabled, the dashboard dispatcher cannot create random operational events.</small>
              </span>
            </label>

            <label htmlFor="theme-select">Display theme</label>
            <select
              id="theme-select"
              value={settings.theme}
              onChange={(event) => handleSettingsChange({ theme: event.target.value })}
            >
              <option value="default-artdeco">Cabernet Art Deco</option>
              <option value="high-contrast">High contrast</option>
            </select>
          </section>

          <section className="glass-panel settings-card" aria-labelledby="privacy-title">
            <h2 id="privacy-title"><ShieldCheck size={19} aria-hidden="true" /> Privacy & data charter</h2>
            <div className="privacy-facts">
              <p><strong>Local-first core:</strong> hotel management works offline and stores its primary state in this browser. No analytics, advertising or telemetry is installed.</p>
              <p><strong>Optional cloud backup:</strong> the account panel can send only the main hotel database and three inventory keys to Supabase after you explicitly choose Sync cloud. Recovery copies and unrelated storage stay local.</p>
              <p><strong>Account data:</strong> signing in sends the supplied email and password to Supabase Auth. Access and refresh tokens are stored locally so the session can be renewed.</p>
              <p><strong>Control:</strong> local JSON export remains available without an account. Cloud loading replaces the captured app snapshot only after confirmation.</p>
            </div>
            <div className="cloud-disclosure">
              <Cloud size={20} aria-hidden="true" />
              <span>The cloud account is optional. Use the “Compte local/cloud” control to connect, sync, load or sign out.</span>
            </div>
          </section>
        </div>

        <section className="glass-panel settings-card audit-card" aria-labelledby="audit-title">
          <div className="audit-card-heading">
            <h2 id="audit-title"><History size={19} aria-hidden="true" /> System audit ledger</h2>
            <button type="button" className="btn btn-secondary" onClick={handlePurgeLogs} id="purge-audit-logs-btn">
              Purge logs
            </button>
          </div>

          <div className="audit-list">
            {auditLogs.length === 0 ? (
              <p className="empty-state">No historical operations registered.</p>
            ) : auditLogs.map((log) => (
              <article key={log.id}>
                <div>
                  <strong>{log.action}</strong>
                  <time dateTime={log.timestamp}>{log.timestamp.replace('T', ' ').substring(0, 19)}</time>
                </div>
                <p>{log.details}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={pendingImport !== null}
        title="Replace local database and inventory?"
        message={`The validated file “${pendingImport?.fileName || ''}” will replace the current hotel database and all three inventory counters. This cannot be undone unless you export the current save first.`}
        onConfirm={handleConfirmImport}
        onCancel={() => setPendingImport(null)}
      />

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset all local hotel data?"
        message="This restores the verified seed and resets every inventory counter. An exported backup is the only way to keep the current state."
        onConfirm={handleResetDb}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
