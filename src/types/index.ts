export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  preLineNum: number | null;
  postLineNum: number | null;
  content: string;
}

export interface DiffStats {
  totalLinesPre: number;
  totalLinesPost: number;
  added: number;
  removed: number;
  unchanged: number;
}

export type ExportFormat = 'text' | 'csv' | 'pdf' | 'markdown';

export interface Theme {
  name: 'light' | 'dark';
  colors: {
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
    border: string;
  };
}