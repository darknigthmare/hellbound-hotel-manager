import React from 'react';
import { CanonStatus } from '../types';

interface CanonBadgeProps {
  status: CanonStatus;
  sourceRef?: string;
}

const BADGE_CONFIG: Record<CanonStatus, { label: string; backgroundColor: string; color: string; border: string }> = {
  canon: {
    label: 'Canon',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    color: '#eec247',
    border: '1px solid rgba(212, 175, 55, 0.4)'
  },
  semi_canon: {
    label: 'Semi-canon',
    backgroundColor: 'rgba(200, 50, 50, 0.12)',
    color: '#ff7070',
    border: '1px solid rgba(200, 50, 50, 0.4)'
  },
  simulation_au: {
    label: 'Simulation AU',
    backgroundColor: 'rgba(255, 145, 0, 0.12)',
    color: '#ffb454',
    border: '1px solid rgba(255, 145, 0, 0.4)'
  },
  headcanon: {
    label: 'Headcanon',
    backgroundColor: 'rgba(150, 75, 230, 0.12)',
    color: '#c5a3ff',
    border: '1px solid rgba(150, 75, 230, 0.4)'
  },
  user_note: {
    label: 'User note',
    backgroundColor: 'rgba(0, 150, 200, 0.12)',
    color: '#5cd6ff',
    border: '1px solid rgba(0, 150, 200, 0.4)'
  },
  unknown: {
    label: 'Unverified',
    backgroundColor: 'rgba(163, 147, 149, 0.12)',
    color: '#a39395',
    border: '1px solid rgba(163, 147, 149, 0.3)'
  }
};

export const CanonBadge: React.FC<CanonBadgeProps> = ({ status, sourceRef }) => {
  const config = BADGE_CONFIG[status];
  const isSourced = (status === 'canon' || status === 'semi_canon') && Boolean(sourceRef?.trim());

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
        ...config
      }}
      title={isSourced ? `Source: ${sourceRef}` : 'Not asserted as sourced series canon'}
      aria-label={`${config.label}${isSourced ? `, source ${sourceRef}` : ''}`}
    >
      <span>{config.label}</span>
      {isSourced && <span aria-hidden="true">✦</span>}
    </span>
  );
};
