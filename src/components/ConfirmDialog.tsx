import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        className="glass-panel art-deco-border"
        style={{
          width: '90%',
          maxWidth: '420px',
          padding: '24px',
          borderRadius: '8px',
        }}
      >
        <h3
          style={{
            marginBottom: '12px',
            borderBottom: '1px solid var(--color-gold-dark)',
            paddingBottom: '8px',
            color: 'var(--color-gold)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: 'var(--color-text-muted)',
            marginBottom: '24px',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            id="confirm-cancel-btn"
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            id="confirm-ok-btn"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
