import React, { useState, useRef } from 'react';
import { Download, Upload, RotateCcw, ShieldCheck, History, FileText, AlertTriangle, ShieldAlert } from 'lucide-react';
import { db } from '../db/localDb';
import { ExportImport } from '../lib/export-import';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { AuditLog } from '../types';

interface SettingsProps {
  state: any;
  onStateChange: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ state, onStateChange }) => {
  const { auditLogs } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirm Reset dialog
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Import notifications
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Trigger Database JSON Export
  const handleExportDb = () => {
    const fullDbState = db.getFullState();
    const jsonStr = ExportImport.exportToJson(fullDbState);
    
    // Download link browser hook
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hellbound_hotel_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    db.logAction('DATABASE_EXPORT', 'User downloaded JSON database backup.');
  };

  // Trigger Database JSON Import
  const handleImportDb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const validation = ExportImport.validateBackup(text);

      if (validation.isValid && validation.parsedState) {
        const success = db.importState(validation.parsedState);
        if (success) {
          setImportStatus({ success: true, msg: 'Database state restored successfully!' });
          onStateChange();
        } else {
          setImportStatus({ success: false, msg: 'Error loading parsed state parameters.' });
        }
      } else {
        setImportStatus({ success: false, msg: validation.error || 'Invalid file format.' });
      }
    };
    reader.readAsText(file);

    // Reset file input value
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset to Seed
  const handleResetDb = () => {
    db.resetToSeed();
    setIsResetConfirmOpen(false);
    setImportStatus(null);
    onStateChange();
  };

  // Purge audit logs
  const handlePurgeLogs = () => {
    db.clearAuditLogs();
    onStateChange();
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>System Settings & Privacy</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Configure database backups, audit local transactions, and review security policies.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Backup & Privacy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Backup Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
              Database backups & Restores
            </h3>

            {importStatus && (
              <div 
                style={{ 
                  backgroundColor: importStatus.success ? 'rgba(40,167,69,0.12)' : 'rgba(220,53,69,0.12)', 
                  border: importStatus.success ? '1px solid rgba(40,167,69,0.3)' : '1px solid rgba(220,53,69,0.3)', 
                  color: importStatus.success ? '#4ce06c' : '#ff6b7a',
                  padding: '10px', 
                  borderRadius: '4px', 
                  marginBottom: '16px', 
                  fontSize: '0.85rem' 
                }}
              >
                {importStatus.msg}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <button className="btn btn-gold" onClick={handleExportDb} id="export-json-btn">
                <Download size={16} />
                Export JSON State
              </button>
              
              <button 
                className="btn btn-secondary" 
                onClick={() => fileInputRef.current?.click()}
                id="import-json-btn"
              >
                <Upload size={16} />
                Import JSON Backup
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportDb} 
                style={{ display: 'none' }} 
                accept=".json" 
              />
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Reset Database to Seed
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
                Purge all guest logs, room configurations, incidents, and relationships back to their default seed values.
              </p>
              <button className="btn btn-danger" onClick={() => setIsResetConfirmOpen(true)} id="reset-db-btn">
                <RotateCcw size={16} />
                Reset Database State
              </button>
            </div>
          </div>

          {/* Privacy Panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: '#28a745' }} />
              Local Privacy & Safety Charter
            </h3>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p>
                <strong>Offline-First Design:</strong> This application performs zero remote network operations. No analytics, tracking tags, telemetry, or cookies are sent to cloud storage accounts.
              </p>
              <p>
                <strong>Data Governance:</strong> All configurations, profiles, and logs remain strictly inside the browser sandbox using <code>localStorage</code>. Disconnecting the internet entirely will not affect database operation.
              </p>
              <p>
                <strong>Local File Storage:</strong> Backups are handled locally. To secure data permanently, export a JSON state file. If you wrap this application in Tauri or Electron, database storage translates automatically to a local SQLite file (<code>dev.db</code>).
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Audit Ledger */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
            <h3 style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} />
              System Audit log Ledger
            </h3>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={handlePurgeLogs} id="purge-audit-logs-btn">
              Purge Logs
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '480px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '24px 0', textAlign: 'center' }}>
                No historical operations registered.
              </p>
            ) : (
              auditLogs.map((log: AuditLog) => (
                <div key={log.id} style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: '4px', borderLeft: '3px solid var(--color-gold-dark)', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                    <span>{log.action}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', lineHeight: 1.4 }}>
                    {log.details}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Purge & Reset All Records?"
        message="Warning: This action will restore all character rosters, rooms registry, and codex entries back to their original seed settings. This will wipe any custom sinners or logs."
        onConfirm={handleResetDb}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
