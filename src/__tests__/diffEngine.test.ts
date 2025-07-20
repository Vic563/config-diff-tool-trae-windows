import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigDiffEngine } from '../utils/diffEngine';
import { 
  isAddedLine, 
  isRemovedLine, 
  isUnchangedLine, 
  InvalidConfigError,
  ValidationError,
  isModifiedLine
} from '../types';

describe('ConfigDiffEngine', () => {
  let diffEngine: ConfigDiffEngine;

  beforeEach(() => {
    diffEngine = new ConfigDiffEngine();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      expect(diffEngine).toBeInstanceOf(ConfigDiffEngine);
      // Test through public API instead of accessing private properties
      diffEngine.setConfigs('test', 'test');
      const diff = diffEngine.getLineDiff();
      expect(diff).toHaveLength(1);
      if (isUnchangedLine(diff[0])) {
        expect(diff[0].content).toBe('test');
      }
    });

    it('should initialize with custom options', () => {
      const customEngine = new ConfigDiffEngine({
        ignoreWhitespace: false,
        ignoreCase: true,
        contextLines: 5,
      });
      
      // Test through public API
      customEngine.setConfigs('test', 'TEST');
      const diff = customEngine.getLineDiff();
      expect(diff).toHaveLength(1);
      if (isUnchangedLine(diff[0])) {
        expect(diff[0].content).toBe('test');
      }
    });

    it('should throw error for invalid options', () => {
      // Test with invalid contextLines
      expect(() => new ConfigDiffEngine({ contextLines: -1 } as any)).toThrow(InvalidConfigError);
      
      // Test with invalid ignoreWhitespace type
      expect(() => new ConfigDiffEngine({ ignoreWhitespace: 'true' } as any)).toThrow(ValidationError);
      
      // Test with invalid ignoreCase type
      expect(() => new ConfigDiffEngine({ ignoreCase: 'true' } as any)).toThrow(ValidationError);
      
      // Test with invalid ignoreEmptyLines type
      expect(() => new ConfigDiffEngine({ ignoreEmptyLines: 'true' } as any)).toThrow(ValidationError);
    });
  });

  describe('setConfigs', () => {
    it('should set valid configurations', () => {
      const preConfig = 'line1\nline2';
      const postConfig = 'line1\nline2\nline3';
      
      diffEngine.setConfigs(preConfig, postConfig);
      // Test by getting the diff and verifying the content
      const diff = diffEngine.getLineDiff();
      expect(diff).toHaveLength(3);
      if (isUnchangedLine(diff[0]) && isUnchangedLine(diff[1]) && isAddedLine(diff[2])) {
        expect(diff[0].content).toBe('line1');
        expect(diff[1].content).toBe('line2');
        expect(diff[2].content).toBe('line3');
      } else {
        throw new Error('Unexpected diff structure');
      }
    });

    it('should throw error for empty configurations', () => {
      expect(() => diffEngine.setConfigs('', 'test')).toThrow(InvalidConfigError);
      expect(() => diffEngine.setConfigs('test', '')).toThrow(InvalidConfigError);
      // Test with null preConfig
      expect(() => diffEngine.setConfigs(null as any, 'test')).toThrow(InvalidConfigError);
      
      // Test with undefined postConfig
      expect(() => diffEngine.setConfigs('test', undefined as any)).toThrow(InvalidConfigError);
      
      // Test with non-string inputs
      expect(() => diffEngine.setConfigs(123 as any, 'test')).toThrow(InvalidConfigError);
      expect(() => diffEngine.setConfigs('test', {} as any)).toThrow(InvalidConfigError);
    });
  });

  describe('getLineDiff', () => {
    it('should detect added lines', () => {
      const preConfig = 'line1\nline2';
      const postConfig = 'line1\nline2\nline3';
      
      diffEngine.setConfigs(preConfig, postConfig);
      const diff = diffEngine.getLineDiff();
      
      expect(diff).toHaveLength(3);
      expect(isUnchangedLine(diff[0])).toBe(true);
      expect(isUnchangedLine(diff[1])).toBe(true);
      expect(isAddedLine(diff[2])).toBe(true);
      
      if (isUnchangedLine(diff[0])) {
        expect(diff[0].content).toBe('line1');
      }
      
      if (isUnchangedLine(diff[1])) {
        expect(diff[1].content).toBe('line2');
      }
      
      if (isAddedLine(diff[2])) {
        expect(diff[2].content).toBe('line3');
      }
    });

    it('should detect removed lines', () => {
      const preConfig = 'line1\nline2\nline3';
      const postConfig = 'line1\nline3';
      
      diffEngine.setConfigs(preConfig, postConfig);
      const diff = diffEngine.getLineDiff();
      
      expect(diff).toHaveLength(3);
      expect(isUnchangedLine(diff[0])).toBe(true);
      expect(isRemovedLine(diff[1])).toBe(true);
      expect(isUnchangedLine(diff[2])).toBe(true);
      
      if (isRemovedLine(diff[1])) {
        expect(diff[1].content).toBe('line2');
      }
    });

    it('should ignore whitespace when configured', () => {
      const preConfig = 'line1\nline2  ';
      const postConfig = '  line1\nline2';
      
      // With ignoreWhitespace: true (default)
      diffEngine.setConfigs(preConfig, postConfig);
      let diff = diffEngine.getLineDiff();
      
      expect(diff).toHaveLength(2);
      expect(isUnchangedLine(diff[0])).toBe(true);
      expect(isUnchangedLine(diff[1])).toBe(true);
      
      // With ignoreWhitespace: false
      const customEngine = new ConfigDiffEngine({ ignoreWhitespace: false });
      customEngine.setConfigs(preConfig, postConfig);
      diff = customEngine.getLineDiff();
      
      expect(diff).toHaveLength(4); // Should show all lines as changed
    });

    it('should ignore case when configured', () => {
      const preConfig = 'Line1\nLine2';
      const postConfig = 'line1\nline2';
      
      // With ignoreCase: false (default)
      diffEngine.setConfigs(preConfig, postConfig);
      let diff = diffEngine.getLineDiff();
      
      expect(diff).toHaveLength(2);
      expect(isUnchangedLine(diff[0])).toBe(false);
      expect(isUnchangedLine(diff[1])).toBe(false);
      
      // With ignoreCase: true
      const customEngine = new ConfigDiffEngine({ ignoreCase: true });
      customEngine.setConfigs(preConfig, postConfig);
      diff = customEngine.getLineDiff();
      
      expect(diff).toHaveLength(2);
      expect(isUnchangedLine(diff[0])).toBe(true);
      expect(isUnchangedLine(diff[1])).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should calculate correct diff statistics', () => {
      const preConfig = 'line1\nline2\nline3\nline4';
      const postConfig = 'line1\nline2-changed\nline4\nline5';
      
      diffEngine.setConfigs(preConfig, postConfig);
      const stats = diffEngine.getStats();
      
      expect(stats).toEqual({
        totalLines: 4,
        added: 1,
        removed: 1,
        unchanged: 2,
        modified: 1,
        similarity: 50, // 2 unchanged out of 4 total lines = 50%
      });
    });

    it('should handle empty configurations', () => {
      // Empty pre-config
      diffEngine.setConfigs('', 'line1\nline2');
      let stats = diffEngine.getStats();
      expect(stats).toEqual({
        totalLines: 2,
        added: 2,
        removed: 0,
        unchanged: 0,
        modified: 0,
        similarity: 0,
      });
      
      // Empty post-config
      diffEngine.setConfigs('line1\nline2', '');
      stats = diffEngine.getStats();
      expect(stats).toEqual({
        totalLines: 2,
        added: 0,
        removed: 2,
        unchanged: 0,
        modified: 0,
        similarity: 0,
      });
      
      // Both empty
      diffEngine.setConfigs('', '');
      stats = diffEngine.getStats();
      expect(stats).toEqual({
        totalLines: 0,
        added: 0,
        removed: 0,
        unchanged: 0,
        modified: 0,
        similarity: 100, // Both empty = 100% similar
      });
    });
  });

  describe('getUnifiedDiff', () => {
    it('should generate a unified diff string', () => {
      const preConfig = 'line1\nline2\nline3';
      const postConfig = 'line1\nline2-changed\nline3\nline4';
      
      diffEngine.setConfigs(preConfig, postConfig);
      const unifiedDiff = diffEngine.getUnifiedDiff();
      
      // Basic validation of the unified diff format
      expect(unifiedDiff).toContain('--- original');
      expect(unifiedDiff).toContain('+++ modified');
      expect(unifiedDiff).toContain('-line2');
      expect(unifiedDiff).toContain('+line2-changed');
      expect(unifiedDiff).toContain('+line4');
    });
  });

  describe('getSimilarity', () => {
    it('should calculate similarity percentage correctly', () => {
      // 100% similar
      diffEngine.setConfigs('line1\nline2', 'line1\nline2');
      expect(diffEngine.getSimilarity()).toBe(100);
      
      // 50% similar
      diffEngine.setConfigs('line1\nline2', 'line1\nline3');
      expect(diffEngine.getSimilarity()).toBe(50);
      
      // 0% similar
      diffEngine.setConfigs('line1\nline2', 'line3\nline4');
      expect(diffEngine.getSimilarity()).toBe(0);
      
      // Empty configs
      diffEngine.setConfigs('', '');
      expect(diffEngine.getSimilarity()).toBe(100);
      
      // One empty config
      diffEngine.setConfigs('line1', '');
      expect(diffEngine.getSimilarity()).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when getting diff without setting configs', () => {
      // Create a new instance without setting configs
      const engine = new ConfigDiffEngine();
      
      // All these should throw because configs are not set
      expect(() => engine.getLineDiff()).toThrow(InvalidConfigError);
      expect(() => engine.getStats()).toThrow(InvalidConfigError);
      expect(() => engine.getUnifiedDiff()).toThrow(InvalidConfigError);
      expect(() => engine.getSimilarity()).toThrow(InvalidConfigError);
    });
  });
});
