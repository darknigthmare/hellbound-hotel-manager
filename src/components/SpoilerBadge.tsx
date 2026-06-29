import React from 'react';
import { SpoilerLevel } from '../types';

interface SpoilerBadgeProps {
  level: SpoilerLevel;
}

export const SpoilerBadge: React.FC<SpoilerBadgeProps> = ({ level }) => {
  const getStyle = () => {
    switch (level) {
      case 'none':
        return {
          backgroundColor: 'rgba(108, 117, 125, 0.12)',
          color: '#a39395',
          border: '1px solid rgba(108, 117, 125, 0.3)',
        };
      case 'season_1':
        return {
          backgroundColor: 'rgba(168, 32, 42, 0.15)',
          color: '#ff6b7a',
          border: '1px solid rgba(168, 32, 42, 0.4)',
        };
      case 'season_2':
        return {
          backgroundColor: 'rgba(212, 175, 55, 0.15)',
          color: '#eec247',
          border: '1px solid rgba(212, 175, 55, 0.4)',
        };
      case 'future':
        return {
          backgroundColor: 'rgba(114, 28, 36, 0.25)',
          color: '#ff808b',
          border: '1px solid rgba(168, 32, 42, 0.6)',
          fontWeight: 700,
        };
    }
  };

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
        fontWeight: 600,
        ...getStyle(),
      }}
    >
      Spoiler: {level.replace('_', ' ')}
    </span>
  );
};
