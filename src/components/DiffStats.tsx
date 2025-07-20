import React from 'react';
import { DiffStats as DiffStatsType } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface DiffStatsProps {
  stats: DiffStatsType | null;
}

export const DiffStats: React.FC<DiffStatsProps> = ({ stats }) => {
  const { theme } = useTheme();

  if (!stats) return null;

  const statItems = [
    { label: 'Total Lines (Pre)', value: stats.totalLinesPre, color: theme.colors.text },
    { label: 'Total Lines (Post)', value: stats.totalLinesPost, color: theme.colors.text },
    { label: 'Added', value: stats.added, color: theme.colors.added },
    { label: 'Removed', value: stats.removed, color: theme.colors.removed },
    { label: 'Unchanged', value: stats.unchanged, color: theme.colors.primary }
  ];

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <h3 style={{ color: theme.colors.text, marginTop: 0, marginBottom: '20px' }}>
        Diff Statistics
      </h3>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        {statItems.map((item, index) => (
          <div
            key={index}
            style={{
              textAlign: 'center',
              padding: '10px',
              minWidth: '120px'
            }}
          >
            <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
              {item.label}
            </div>
            <div style={{ 
              color: item.color, 
              fontSize: '2rem', 
              fontWeight: 'bold',
              marginTop: '5px'
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};