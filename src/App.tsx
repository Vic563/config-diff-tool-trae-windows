import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { ConfigInput } from './components/ConfigInput';
import { DiffViewer } from './components/DiffViewer';
import { ExportButtons } from './components/ExportButtons';
import { ConfigDiffEngine } from './utils/diffEngine';
import { DiffLine, DiffStats as DiffStatsType } from './types';

function AppContent() {
  const [preConfig, setPreConfig] = useState('');
  const [postConfig, setPostConfig] = useState('');
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [stats, setStats] = useState<DiffStatsType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performDiff = () => {
    try {
      setError(null);

      if (!preConfig.trim() || !postConfig.trim()) {
        setError('Please provide both pre and post configurations');
        return;
      }

      const engine = new ConfigDiffEngine();
      engine.setConfigs(preConfig, postConfig);
      
      const lines = engine.getLineDiff();
      const diffStats = engine.getStats();
      
      setDiffLines(lines);
      setStats(diffStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while calculating diff');
    }
  };

  const clearAll = () => {
    setPreConfig('');
    setPostConfig('');
    setDiffLines([]);
    setStats(null);
    setError(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1, padding: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <ConfigInput
            title="Pre-Configuration"
            value={preConfig}
            onChange={setPreConfig}
          />
          <ConfigInput
            title="Post-Configuration"
            value={postConfig}
            onChange={setPostConfig}
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={performDiff}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginRight: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
          >
            Compare Configurations
          </button>
          <button
            onClick={clearAll}
            style={{
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#616161'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#757575'}
          >
            Clear All
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {diffLines.length > 0 && (
          <>
            <ExportButtons diffLines={diffLines} stats={stats!} />
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
