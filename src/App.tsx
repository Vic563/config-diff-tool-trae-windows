import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { ConfigInput } from './components/ConfigInput';
import { DiffViewer } from './components/DiffViewer';
import { ExportButtons } from './components/ExportButtons';
import { useDiff } from './hooks/useDiff';
import { isDiffError } from './types';

// Styled components for better organization (could be moved to a separate file)
const buttonStyles = {
  primary: {
    backgroundColor: '#1976d2',
    hoverColor: '#1565c0',
  },
  secondary: {
    backgroundColor: '#757575',
    hoverColor: '#616161',
  },
  base: {
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'all 0.3s ease',
  },
};

const Button: React.FC<{
  onClick: () => void;
  style: 'primary' | 'secondary';
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, style, children, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      ...buttonStyles.base,
      backgroundColor: buttonStyles[style].backgroundColor,
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
    onMouseEnter={(e) => 
      (e.currentTarget.style.backgroundColor = buttonStyles[style].hoverColor)
    }
    onMouseLeave={(e) => 
      (e.currentTarget.style.backgroundColor = buttonStyles[style].backgroundColor)
    }
  >
    {children}
  </button>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div
    style={{
      backgroundColor: '#f44336',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '4px',
      marginBottom: '20px',
      textAlign: 'center',
    }}
  >
    {message}
  </div>
);

function AppContent() {
  const {
    // State
    preConfig,
    postConfig,
    diffLines,
    stats,
    error,
    isLoading,
    
    // Actions
    calculateDiff,
    reset,
    updatePreConfig,
    updatePostConfig,
  } = useDiff();

  const handlePreConfigChange = (value: string) => {
    updatePreConfig(value);
  };

  const handlePostConfigChange = (value: string) => {
    updatePostConfig(value);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1, padding: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <ConfigInput
            title="Pre-Configuration"
            value={preConfig}
            onChange={handlePreConfigChange}
            disabled={isLoading}
          />
          <ConfigInput
            title="Post-Configuration"
            value={postConfig}
            onChange={handlePostConfigChange}
            disabled={isLoading}
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Button 
            onClick={calculateDiff}
            style="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Comparing...' : 'Compare Configurations'}
          </Button>
          <Button 
            onClick={reset}
            style="secondary"
            disabled={isLoading}
          >
            Clear All
          </Button>
        </div>

        {error && (
          <ErrorMessage message={
            isDiffError(error) ? error.message : 'An unknown error occurred'
          } />
        )}

        {diffLines.length > 0 && stats && (
          <>
            <ExportButtons diffLines={diffLines} stats={stats} />
            <DiffViewer diffLines={diffLines} />
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
