import React from 'react';
import { DataSourceType } from '../types';

interface DataSourceBadgeProps {
  source: DataSourceType;
  detail?: string;
}

/**
 * DataSourceBadge — mandatory provenance badge for all charts and metric cards.
 * Adheres to RULES.md: "Data source badge must appear on every chart".
 */
export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({ source, detail }) => {
  const badgeColors: Record<DataSourceType, { bg: string; text: string; border: string }> = {
    'live model': {
      bg: 'rgba(59, 130, 246, 0.15)',
      text: '#60a5fa',
      border: 'rgba(59, 130, 246, 0.4)',
    },
    'replay bundle': {
      bg: 'rgba(168, 85, 247, 0.15)',
      text: '#c084fc',
      border: 'rgba(168, 85, 247, 0.4)',
    },
    'assumption': {
      bg: 'rgba(245, 158, 11, 0.15)',
      text: '#fbbf24',
      border: 'rgba(245, 158, 11, 0.4)',
    },
  };

  const style = badgeColors[source];

  return (
    <span
      className="data-source-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.725rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        userSelect: 'none',
      }}
      title={detail ?? `Data Source: ${source}`}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.text,
          boxShadow: `0 0 6px ${style.text}`,
        }}
      />
      <span>{source}</span>
    </span>
  );
};
