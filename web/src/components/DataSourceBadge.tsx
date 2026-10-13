import React from 'react';
import { DataSourceType } from '../types';

interface DataSourceBadgeProps {
  source: DataSourceType;
  detail?: string;
}

/**
 * DataSourceBadge — mandatory provenance badge for all charts and metric cards.
 * Adheres to RULES.md: "Data source badge must appear on every chart".
 * Styled for clean white decent theme with high-contrast text.
 */
export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({ source, detail }) => {
  const badgeColors: Record<DataSourceType, { bg: string; text: string; border: string; dot: string }> = {
    'live model': {
      bg: '#eff6ff',
      text: '#0284c7',
      border: '#bae6fd',
      dot: '#0284c7',
    },
    'replay bundle': {
      bg: '#f5f3ff',
      text: '#7c3aed',
      border: '#ddd6fe',
      dot: '#7c3aed',
    },
    'assumption': {
      bg: '#fffbeb',
      text: '#b45309',
      border: '#fde68a',
      dot: '#d97706',
    },
  };

  const style = badgeColors[source];

  return (
    <span
      className="data-source-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        fontSize: '0.68rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        userSelect: 'none',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      }}
      title={detail ?? `Data Source: ${source}`}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.dot,
        }}
      />
      <span>{source}</span>
    </span>
  );
};
