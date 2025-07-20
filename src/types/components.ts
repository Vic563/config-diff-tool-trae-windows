import React from 'react';
import { DiffLine } from './index';

// Props for the DiffViewer component
export interface DiffViewerProps {
  diffLines: DiffLine[];
  className?: string;
  maxHeight?: string | number;
  showLineNumbers?: boolean;
  highlightLine?: (line: DiffLine) => boolean;
  onLineClick?: (line: DiffLine, event: React.MouseEvent) => void;
}

// Props for the ConfigInput component
export interface ConfigInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string | null;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  rows?: number;
}
