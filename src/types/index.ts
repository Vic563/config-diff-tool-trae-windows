// Base types for diff operations
export type DiffOperation = 'added' | 'removed' | 'unchanged' | 'modified' | 'ellipsis';

// Discriminated union for diff lines
export type DiffLine = 
  | {
      type: 'added';
      preLineNum: null;
      postLineNum: number;
      content: string;
    }
  | {
      type: 'removed';
      preLineNum: number;
      postLineNum: null;
      content: string;
    }
  | {
      type: 'unchanged' | 'modified';
      preLineNum: number;
      postLineNum: number;
      content: string;
    }
  | {
      type: 'ellipsis';
      preLineNum: null;
      postLineNum: null;
      content: string;
    };

// Type guard functions for DiffLine
export const isAddedLine = (line: DiffLine): line is Extract<DiffLine, { type: 'added' }> => 
  line.type === 'added';

export const isRemovedLine = (line: DiffLine): line is Extract<DiffLine, { type: 'removed' }> => 
  line.type === 'removed';

export const isUnchangedLine = (line: DiffLine): line is Extract<DiffLine, { type: 'unchanged' }> => 
  line.type === 'unchanged';

export const isModifiedLine = (line: DiffLine): line is Extract<DiffLine, { type: 'modified' }> => 
  line.type === 'modified';

export const isEllipsisLine = (line: DiffLine): line is Extract<DiffLine, { type: 'ellipsis' }> => 
  line.type === 'ellipsis';

// Statistics about the diff
export interface DiffStats {
  totalLinesPre: number;
  totalLinesPost: number;
  added: number;
  removed: number;
  unchanged: number;
  modified: number;
  similarity: number; // 0-100 percentage of similarity between the two configs
}

// Error types
export class DiffError extends Error {
  constructor(message: string, public code: string, public details?: unknown) {
    super(message);
    this.name = 'DiffError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Specific error types
export class InvalidConfigError extends DiffError {
  constructor(message: string, public field?: string, details?: unknown) {
    super(message, 'INVALID_CONFIG', details);
    this.name = 'InvalidConfigError';
  }
}

export class ParseError extends DiffError {
  constructor(message: string, public configType: 'pre' | 'post', details?: unknown) {
    super(message, 'PARSE_ERROR', details);
    this.name = 'ParseError';
  }
}

export class DiffCalculationError extends DiffError {
  constructor(message: string, public diffPart?: any) {
    super(message, 'DIFF_CALCULATION_ERROR', diffPart);
    this.name = 'DiffCalculationError';
  }
}

export class ValidationError extends DiffError {
  constructor(message: string, public validationErrors: string[]) {
    super(message, 'VALIDATION_ERROR', validationErrors);
    this.name = 'ValidationError';
  }
}

// Type guard for DiffError
export function isDiffError(error: unknown): error is DiffError {
  return error instanceof Error && 'code' in error && error.name === 'DiffError';
}

// Type guard for specific error types
export function isSpecificDiffError<T extends DiffError>(
  error: unknown,
  errorType: new (...args: any[]) => T
): error is T {
  return error instanceof errorType;
}

// Export formats
export type ExportFormat = 'text' | 'csv' | 'pdf' | 'markdown';

// Theme configuration
export type ThemeName = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  added: string;
  addedBg: string;
  removed: string;
  removedBg: string;
  unchanged: string;
  unchangedBg: string;
  modified: string;
  modifiedBg: string;
  border: string;
  error: string;
  errorBg: string;
}

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
}

// Configuration for the diff engine
export interface DiffEngineConfig {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  ignoreEmptyLines?: boolean;
  contextLines?: number;
}

// Re-export component types
export * from './components';