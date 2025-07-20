import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ConfigInputProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ConfigInput: React.FC<ConfigInputProps> = ({
  title,
  value,
  onChange,
  placeholder = 'Paste your configuration here...',
  disabled = false
}) => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <h3 style={{ 
        color: theme.colors.text, 
        marginTop: 0,
        marginBottom: '12px',
        fontSize: '1.2rem'
      }}>
        {title}
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          flex: 1,
          minHeight: '400px',
          padding: '12px',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '4px',
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: '14px',
          resize: 'vertical',
          outline: 'none'
        }}
      />
    </div>
  );
};