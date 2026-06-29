import React from 'react';
import { CanonStatus } from '../types';

interface CanonBadgeProps {
  status: CanonStatus;
  sourceRef?: string;
}

export const CanonBadge: React.FC<CanonBadgeProps> = ({ status, sourceRef }) => {
  const getStyle = () => {
    switch (status) {
      case 'canon':
        return {
          backgroundColor: 'rgba(212, 175, 55, 0.12)',
          color: '#eec247',
          border: '1px solid rgba(212, 175, 55, 0.4)',
        };
      case 'semi_canon':
        return {
          backgroundColor: 'rgba(200, 50, 50, 0.12)',
          color: '#ff7070',
          border: '1px solid rgba(200, 50, 50, 0.4)',
        };
      case 'headcanon':
        return {
          backgroundColor: 'rgba(150, 75, 230, 0.12)',
          color: '#c5a3ff',
          border: '1px solid rgba(150, 75, 230, 0.4)',
        };
      case 'user_note':
        return {
          backgroundColor: 'rgba(0, 150, 200, 0.12)',
          color: '#5cd6ff',
          border: '1px solid rgba(0, 150, 200, 0.4)',
        };
      default:
        return {
          backgroundColor: 'rgba(163, 147, 149, 0.12)',
          color: '#a39395',
          border: '1px solid rgba(163, 147, 149, 0.3)',
        };
    }
  };

  const isVerified = (status === 'canon' || status === 'semi_canon') && sourceRef && sourceRef.trim() !== '';

  return (
    <span
      style={{
        padding: '3px 8px',
        borderRadius: '3px',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 600,
        ...getStyle(),
      }}
      title={isVerified ? `Source Reference: ${sourceRef}` : 'Unconfirmed or Headcanon details'}
    >
      <span>{status.replace('_', ' ')}</span>
      {isVerified && (
        <span
          style={{
            fontSize: '0.75rem',
            color: '#eec247',
            marginLeft: '2px',
          }}
        >
          ✦
        </span>
      )}
    </span>
  );
};
