import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const getStyle = () => {
    switch (level) {
      case 'low':
        return {
          backgroundColor: 'rgba(40, 167, 69, 0.15)',
          color: '#4ce06c',
          border: '1px solid rgba(40, 167, 69, 0.4)',
        };
      case 'medium':
        return {
          backgroundColor: 'rgba(253, 126, 20, 0.15)',
          color: '#fca34d',
          border: '1px solid rgba(253, 126, 20, 0.4)',
        };
      case 'high':
        return {
          backgroundColor: 'rgba(220, 53, 69, 0.15)',
          color: '#ff6b7a',
          border: '1px solid rgba(220, 53, 69, 0.4)',
        };
      case 'catastrophic':
        return {
          backgroundColor: 'rgba(114, 28, 36, 0.35)',
          color: '#ff808b',
          border: '1px solid rgba(168, 32, 42, 0.6)',
          textShadow: '0 0 4px rgba(168, 32, 42, 0.6)',
          fontWeight: 'bold',
        };
      default:
        return {
          backgroundColor: 'rgba(163, 147, 149, 0.15)',
          color: '#a39395',
          border: '1px solid rgba(163, 147, 149, 0.3)',
        };
    }
  };

  return (
    <span
      style={{
        padding: '3px 8px',
        borderRadius: '3px',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 600,
        ...getStyle(),
      }}
    >
      {level}
    </span>
  );
};
