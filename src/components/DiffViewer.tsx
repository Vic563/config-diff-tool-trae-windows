import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { DiffLine } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface GroupedLine {
  preContent: string | null;
  postContent: string | null;
  preLineNum: number | null;
  postLineNum: number | null;
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  key: string;
}

interface DiffViewerProps {
  diffLines: DiffLine[];
  className?: string;
  maxHeight?: number | string;
  showLineNumbers?: boolean;
  lineHeight?: number;
  overscanCount?: number;
  highlightLine?: (line: DiffLine) => boolean;
  onLineClick?: (line: DiffLine, event: React.MouseEvent) => void;
}

// Default height for each line in pixels
const DEFAULT_LINE_HEIGHT = 24;
// Number of lines to render outside the visible area
const DEFAULT_OVERSCAN_COUNT = 5;

// Memoize the row component to prevent unnecessary re-renders
const Row = React.memo(({ 
  data, 
  index, 
  style 
}: { 
  data: { 
    lines: GroupedLine[]; 
    getLineStyle: (type: string, side: 'pre' | 'post') => React.CSSProperties;
    showLineNumbers: boolean;
  }; 
  index: number; 
  style: React.CSSProperties;
}) => {
  const { lines, getLineStyle, showLineNumbers } = data;
  const line = lines[index];
  
  const preLineStyle = getLineStyle(line.type, 'pre');
  const postLineStyle = getLineStyle(line.type, 'post');
  
  return (
    <div 
      style={{
        ...style,
        display: 'flex',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: '1.5',
      }}
      data-line-type={line.type}
      data-line-index={index}
    >
      {/* Pre-config column */}
      <div 
        style={{
          ...preLineStyle,
          flex: '1',
          padding: '0 10px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          borderRight: `1px solid ${preLineStyle.borderColor || '#e1e4e8'}`,
          display: 'flex',
          minWidth: 0, // Ensure flex-shrink works properly
        }}
      >
        {showLineNumbers && line.preLineNum !== null && (
          <span style={{ opacity: 0.6, marginRight: '10px', userSelect: 'none' }}>
            {line.preLineNum}
          </span>
        )}
        <span style={{ flex: 1 }}>{line.preContent || ''}</span>
      </div>
      
      {/* Post-config column */}
      <div 
        style={{
          ...postLineStyle,
          flex: '1',
          padding: '0 10px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          display: 'flex',
          minWidth: 0, // Ensure flex-shrink works properly
        }}
      >
        {showLineNumbers && line.postLineNum !== null && (
          <span style={{ opacity: 0.6, marginRight: '10px', userSelect: 'none' }}>
            {line.postLineNum}
          </span>
        )}
        <span style={{ flex: 1 }}>{line.postContent || ''}</span>
      </div>
    </div>
  );
});

// The main DiffViewer component
export const DiffViewer: React.FC<DiffViewerProps> = React.memo(({ 
  diffLines, 
  className = '',
  maxHeight = '60vh',
  showLineNumbers = true,
  lineHeight = DEFAULT_LINE_HEIGHT,
  overscanCount = DEFAULT_OVERSCAN_COUNT,
}) => {
  const { theme } = useTheme();

  // Memoize the grouped lines calculation
  const groupedLines = useMemo<GroupedLine[]>(() => {
    const groups: GroupedLine[] = [];
    let i = 0;
    
    while (i < diffLines.length) {
      const line = diffLines[i];
      const key = `${line.type}-${(line as any).preLineNum ?? ''}-${(line as any).postLineNum ?? ''}-${i}`;
      
      switch (line.type) {
        case 'unchanged':
        case 'modified':
          groups.push({
            preContent: line.content,
            postContent: line.content,
            preLineNum: line.preLineNum,
            postLineNum: line.postLineNum,
            type: line.type,
            key,
          });
          i++;
          break;
          
        case 'removed':
          // Check if next line is added (modification)
          const nextLine = diffLines[i + 1];
          if (nextLine && nextLine.type === 'added') {
            groups.push({
              preContent: line.content,
              postContent: nextLine.content,
              preLineNum: line.preLineNum,
              postLineNum: nextLine.postLineNum,
              type: 'modified',
              key,
            });
            i += 2;
          } else {
            groups.push({
              preContent: line.content,
              postContent: null,
              preLineNum: line.preLineNum,
              postLineNum: null,
              type: 'removed',
              key,
            });
            i++;
          }
          break;
          
        case 'added':
          groups.push({
            preContent: null,
            postContent: line.content,
            preLineNum: null,
            postLineNum: line.postLineNum,
            type: 'added',
            key,
          });
          i++;
          break;
          
        case 'ellipsis':
          groups.push({
            preContent: line.content,
            postContent: line.content,
            preLineNum: null,
            postLineNum: null,
            type: 'unchanged', // Display ellipsis as unchanged for styling
            key,
          });
          i++;
          break;
          
        default:
          // Handle any other cases (shouldn't happen with our types)
          i++;
          break;
      }
    }
    
    return groups;
  }, [diffLines]);

  // Memoize line style calculation
  const getLineStyle = useCallback((type: 'added' | 'removed' | 'unchanged' | 'modified', side: 'pre' | 'post'): React.CSSProperties => {
    if (type === 'unchanged') {
      return {
        backgroundColor: theme.colors.unchangedBg,
        color: theme.colors.unchanged,
        borderColor: theme.colors.border,
      };
    }
    
    if (type === 'modified') {
      return side === 'pre' 
        ? {
            backgroundColor: theme.colors.removedBg,
            color: theme.colors.removed,
            borderColor: theme.colors.removedBg,
          }
        : {
            backgroundColor: theme.colors.addedBg,
            color: theme.colors.added,
            borderColor: theme.colors.addedBg,
          };
    }
    
    if (type === 'removed' && side === 'pre') {
      return {
        backgroundColor: theme.colors.removedBg,
        color: theme.colors.removed,
        borderColor: theme.colors.removedBg,
      };
    }
    
    if (type === 'added' && side === 'post') {
      return {
        backgroundColor: theme.colors.addedBg,
        color: theme.colors.added,
        borderColor: theme.colors.addedBg,
      };
    }
    
    // Default/fallback styles
    return {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      borderColor: theme.colors.border,
    };
  }, [theme]);
  
  // Prepare the data for the virtualized list
  const itemData = useMemo(() => ({
    lines: groupedLines,
    getLineStyle: (type: string, side: 'pre' | 'post') => {
      // Type assertion is safe here because we control the input
      return getLineStyle(type as 'added' | 'removed' | 'unchanged' | 'modified', side);
    },
    showLineNumbers,
  }), [groupedLines, getLineStyle, showLineNumbers]);
  
  
  
  // Render the virtualized diff viewer
  return (
    <div 
      style={{
        width: '100%',
        height: maxHeight,
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '4px',
        overflow: 'hidden',
      }}
      className={`diff-viewer ${className}`}
    >
      <div style={{ flex: 1, minHeight: '200px' }}>
        <AutoSizer>
          {({ width, height }: { width: number; height: number }) => (
            <List
              height={height}
              itemCount={groupedLines.length}
              itemSize={lineHeight}
              width={width}
              itemData={itemData}
              overscanCount={overscanCount}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
});

// Set display name for better debugging
DiffViewer.displayName = 'DiffViewer';