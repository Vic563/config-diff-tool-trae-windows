// Import the diff library with proper types
import { diffLines, Change } from 'diff';

// Import types from our types module
import type {
  DiffLine,
  DiffStats,
  InvalidConfigError as InvalidConfigErrorType,
  ParseError as ParseErrorType,
  DiffCalculationError as DiffCalculationErrorType
} from '../types';

import { ValidationError } from '../types';

// Import validation utilities
import { validateConfigContent, validateDiffOptions } from './validation';

// Type guards for DiffLine variants
type AddedLine = Extract<DiffLine, { type: 'added' }>;
type RemovedLine = Extract<DiffLine, { type: 'removed' }>;
type UnchangedLine = Extract<DiffLine, { type: 'unchanged' }>;
type ModifiedLine = Extract<DiffLine, { type: 'modified' }>;

// Type guard implementations
const isAddedLine = (line: DiffLine): line is AddedLine => line.type === 'added';
const isRemovedLine = (line: DiffLine): line is RemovedLine => line.type === 'removed';
const isUnchangedLine = (line: DiffLine): line is UnchangedLine => line.type === 'unchanged';
const isModifiedLine = (line: DiffLine): line is ModifiedLine => line.type === 'modified';

// Error type guards
interface DiffError extends Error {
  code: string;
  details?: unknown;
}

const isError = (error: unknown): error is Error => 
  error instanceof Error;

const isDiffError = (error: unknown): error is DiffError => 
  isError(error) && 
  'code' in error && 
  typeof (error as { code: unknown }).code === 'string' && 
  ['INVALID_CONFIG', 'PARSE_ERROR', 'DIFF_CALCULATION_ERROR'].includes(
    (error as { code: string }).code
  );


// Error classes that implement the expected interfaces
class InvalidConfigError extends Error implements InvalidConfigErrorType {
  public readonly code = 'INVALID_CONFIG';
  
  constructor(
    message: string, 
    public field?: string, 
    public details?: unknown
  ) {
    super(message);
    this.name = 'InvalidConfigError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ParseError extends Error implements ParseErrorType {
  public readonly code = 'PARSE_ERROR';
  
  constructor(
    message: string, 
    public configType: 'pre' | 'post', 
    public details?: unknown
  ) {
    super(message);
    this.name = 'ParseError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class DiffCalculationError extends Error implements DiffCalculationErrorType {
  public readonly code = 'DIFF_CALCULATION_ERROR';
  
  constructor(
    message: string, 
    public diffPart?: unknown
  ) {
    super(message);
    this.name = 'DiffCalculationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// The diff module already has proper types imported above, no need to redeclare

// Configuration for the diff engine
interface DiffEngineOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  ignoreEmptyLines?: boolean;
  contextLines?: number;
}

export class ConfigDiffEngine {
  private preConfig: string = '';
  private postConfig: string = '';
  private options: Required<DiffEngineOptions>;

  constructor(options: DiffEngineOptions = {}) {
    // Set default options
    const defaultOptions: Required<DiffEngineOptions> = {
      ignoreWhitespace: true,
      ignoreCase: false,
      ignoreEmptyLines: true,
      contextLines: 3,
    };

    // Validate the provided options
    try {
      validateDiffOptions(options);
      this.options = { ...defaultOptions, ...options };
    } catch (error) {
      // Wrap the validation error in a more specific error type
      if (error instanceof ValidationError) {
        throw new InvalidConfigError(
          'Invalid diff options provided',
          'diffOptions',
          error.details
        );
      }
      // Re-throw any other errors
      throw error;
    }
  }

  /**
   * Set the configurations to be compared
   */
  setConfigs(preConfig: string, postConfig: string): void {
    try {
      // Validate both configurations
      validateConfigContent(preConfig, 'pre');
      validateConfigContent(postConfig, 'post');
      
      // If validation passes, set the configs
      this.preConfig = preConfig;
      this.postConfig = postConfig;
    } catch (error) {
      // Re-throw with additional context if it's already a DiffError
      if (isDiffError(error)) {
        throw error;
      }
      // Wrap any other errors in our custom error type
      throw new ParseError(
        'Failed to parse configuration',
        'pre',
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Get the diff between the pre and post configurations
   */
  getLineDiff(): DiffLine[] {
    if (!this.preConfig || !this.postConfig) {
      throw new InvalidConfigError(
        'Both pre and post configurations must be set before getting diff',
        !this.preConfig ? 'preConfig' : 'postConfig'
      );
    }

    try {
      const diff = diffLines(this.preConfig, this.postConfig, {
        ignoreWhitespace: this.options.ignoreWhitespace,
      } as any) || [];

      const result: DiffLine[] = [];
      let preLineNum = 1;
      let postLineNum = 1;

      diff.forEach((part: Change) => {
        const lines = part.value.split('\n');
        // Remove the last empty line if it exists (from the split)
        if (lines[lines.length - 1] === '') {
          lines.pop();
        }

        for (const line of lines) {
          if (this.options.ignoreEmptyLines && line.trim() === '') {
            continue;
          }

          if (part.added) {
            result.push({
              type: 'added',
              preLineNum: null,
              postLineNum: postLineNum++,
              content: line
            });
          } else if (part.removed) {
            result.push({
              type: 'removed',
              preLineNum: preLineNum++,
              postLineNum: null,
              content: line
            });
          } else {
            result.push({
              type: 'unchanged',
              preLineNum: preLineNum++,
              postLineNum: postLineNum++,
              content: line
            });
          }
        }
      });
      
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new DiffCalculationError(
          `Failed to calculate line diff: ${error.message}`,
          error
        );
      }
      throw new DiffCalculationError('An unknown error occurred while calculating line diff');
    }
  }

  /**
   * Get the diff between the pre and post configurations with context
   */
  getDiffWithContext(): DiffLine[] {
    const diff = this.getLineDiff();
    const result: DiffLine[] = [];
    let lastUnchangedBlock: DiffLine[] = [];

    const flushUnchangedBlock = (): void => {
      if (lastUnchangedBlock.length === 0) return;

      const { contextLines } = this.options;
      if (contextLines === undefined || lastUnchangedBlock.length <= contextLines * 2) {
        result.push(...lastUnchangedBlock);
        lastUnchangedBlock = [];
        return;
      }

      // Keep only the first and last context lines
      const firstContext = lastUnchangedBlock.slice(0, contextLines);
      const lastContext = lastUnchangedBlock.slice(-contextLines);
      
      // Add ellipsis if there are lines in between
      if (firstContext.length + lastContext.length < lastUnchangedBlock.length) {
        result.push(...firstContext, {
          type: 'ellipsis',
          preLineNum: null,
          postLineNum: null,
          content: '...'
        }, ...lastContext);
      } else {
        result.push(...lastUnchangedBlock);
      }
      
      lastUnchangedBlock = [];
    };

    // Process each line in the diff
    for (const line of diff) {
      if (isUnchangedLine(line)) {
        lastUnchangedBlock.push(line);
      } else {
        // Flush unchanged lines before this changed line
        flushUnchangedBlock();
        result.push(line);
      }
    }
    
    // Flush any remaining unchanged lines at the end
    flushUnchangedBlock();
    
    return result;
  }
  
  /**
   * Get statistics about the diff
   */
  getStats(): DiffStats {
    const diff = this.getLineDiff();
    const stats: DiffStats = {
      added: 0,
      removed: 0,
      unchanged: 0,
      modified: 0,
      totalLinesPre: 0,
      totalLinesPost: 0,
      similarity: 0
    };
    
    diff.forEach((line) => {
      if (isAddedLine(line)) {
        stats.added++;
        stats.totalLinesPost++;
      } else if (isRemovedLine(line)) {
        stats.removed++;
        stats.totalLinesPre++;
      } else if (isUnchangedLine(line)) {
        stats.unchanged++;
        stats.totalLinesPre++;
        stats.totalLinesPost++;
      } else if (isModifiedLine(line)) {
        stats.modified++;
        stats.totalLinesPre++;
        stats.totalLinesPost++;
      }
    });
    
    const totalLines = Math.max(stats.totalLinesPre, stats.totalLinesPost);
    stats.similarity = totalLines > 0 
      ? Math.round((stats.unchanged / totalLines) * 100) 
      : 100;
      
    return stats;
  }
  
  /**
   * Get the similarity percentage between the two configurations
   */
  getSimilarity(): number {
    return this.getStats().similarity;
  }
}