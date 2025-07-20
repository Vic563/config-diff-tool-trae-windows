import React from 'react';
import { ExportFormat, DiffLine, DiffStats } from '../types';
import { DiffExporter } from '../utils/exporters';
import { useTheme } from '../contexts/ThemeContext';

interface ExportButtonsProps {
  diffLines: DiffLine[];
  stats: DiffStats;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ diffLines, stats }) => {
  const { theme } = useTheme();

  const handleExport = (format: ExportFormat) => {
    const exporter = new DiffExporter(diffLines, stats);

    switch (format) {
      case 'text':
        exporter.download('text', exporter.exportText());
        break;
      case 'csv':
        exporter.download('csv', exporter.exportCSV());
        break;
      case 'markdown':
        exporter.download('markdown', exporter.exportMarkdown());
        break;
      case 'pdf':
        exporter.exportPDF();
        break;
    }
  };

  const buttons: { format: ExportFormat; label: string; color: string }[] = [
    { format: 'text', label: 'Text', color: theme.colors.primary },
    { format: 'csv', label: 'CSV', color: '#4caf50' },
    { format: 'pdf', label: 'PDF', color: '#f44336' },
    { format: 'markdown', label: 'Markdown', color: '#9c27b0' }
  ];

  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '20px',
        padding: '20px',
        backgroundColor: theme.colors.surface,
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <h4 style={{ color: theme.colors.text, marginBottom: '15px' }}>Export Options</h4>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {buttons.map(({ format, label, color }) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              border: `2px solid ${color}`,
              backgroundColor: 'transparent',
              color: color,
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = color;
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = color;
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};