import { useState, useCallback, useMemo } from 'react';
import { ConfigDiffEngine } from '../utils/diffEngine';
import { DiffLine, DiffStats, DiffError } from '../types';

export const useDiff = () => {
  const [preConfig, setPreConfig] = useState('');
  const [postConfig, setPostConfig] = useState('');
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [stats, setStats] = useState<DiffStats | null>(null);
  const [error, setError] = useState<DiffError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the diff engine to prevent recreating it on every render
  const diffEngine = useMemo(() => new ConfigDiffEngine(), []);

  /**
   * Calculate the diff between the pre and post configurations
   */
  const calculateDiff = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate inputs
      if (!preConfig.trim() || !postConfig.trim()) {
        const error = new Error('Please provide both pre and post configurations');
        (error as any).code = 'EMPTY_INPUT';
        setError(error as DiffError);
        return;
      }

      // Perform the diff
      diffEngine.setConfigs(preConfig, postConfig);
      const lines = diffEngine.getLineDiff();
      const diffStats = diffEngine.getStats();
      
      setDiffLines(lines);
      setStats(diffStats);
      return { lines, stats: diffStats };
    } catch (err) {
      if (err instanceof Error && 'code' in err) {
        setError(err as DiffError);
        throw err;
      } else {
        const error = new Error('An error occurred while calculating the diff');
        (error as any).code = 'UNKNOWN_ERROR';
        (error as any).details = err;
        setError(error as DiffError);
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  }, [preConfig, postConfig, diffEngine]);

  /**
   * Reset all states to their initial values
   */
  const reset = useCallback(() => {
    setPreConfig('');
    setPostConfig('');
    setDiffLines([]);
    setStats(null);
    setError(null);
  }, []);

  /**
   * Update the pre-configuration and optionally recalculate the diff
   */
  const updatePreConfig = useCallback((value: string, recalculate = false) => {
    setPreConfig(value);
    if (recalculate) {
      calculateDiff();
    }
  }, [calculateDiff]);

  /**
   * Update the post-configuration and optionally recalculate the diff
   */
  const updatePostConfig = useCallback((value: string, recalculate = false) => {
    setPostConfig(value);
    if (recalculate) {
      calculateDiff();
    }
  }, [calculateDiff]);

  return {
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
    
    // Setters
    setPreConfig,
    setPostConfig,
    setDiffLines,
    setStats,
    setError,
  };
};

export default useDiff;
