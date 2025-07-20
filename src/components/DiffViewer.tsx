import React from 'react';
import { DiffLine } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface DiffViewerProps {
  diffLines: DiffLine[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffLines }) => {
  const { theme } = useTheme();

  // Group lines for side-by-side display
  const groupedLines = React.useMemo(() => {
    const groups: Array<{
      preContent: string | null;
      postContent: string | null;
      preLineNum: number | null;
      postLineNum: number | null;
      type: 'added' | 'removed' | 'unchanged' | 'modified';
    }> = [];

    let i = 0;
    while (i < diffLines.length) {
      const line = diffLines[i];
      
      if (line.type === 'unchanged') {
        groups.push({
          preContent: line.content,
          postContent: line.content,
          preLineNum: line.preLineNum,
          postLineNum: line.postLineNum,
          type: 'unchanged'
        });
        i++;
      } else if (line.type === 'removed') {
        // Check if next line is added (modification)
        const nextLine = diffLines[i + 1];
        if (nextLine && nextLine.type === 'added') {
          groups.push({
            preContent: line.content,
            postContent: nextLine.content,
            preLineNum: line.preLineNum,
            postLineNum: nextLine.postLineNum,
            type: 'modified'
          });
          i += 2;
        } else {
          groups.push({
            preContent: line.content,
            postContent: null,
            preLineNum: line.preLineNum,
            postLineNum: null,
            type: 'removed'
          });
          i++;
        }
      } else if (line.type === 'added') {
        groups.push({
          preContent: null,
          postContent: line.content,
          preLineNum: null,
          postLineNum: line.postLineNum,
          type: 'added'
        });
        i++;
      }
    }
    
    return groups;
  }, [diffLines]);

  const getLineStyle = (type: 'added' | 'removed' | 'unchanged' | 'modified', side: 'pre' | 'post') => {
    if (type === 'unchanged') {
      return {
        backgroundColor: theme.colors.unchangedBg,
        color: theme.colors.unchanged
      };
    }
    
    if (type === 'modified') {
      return {
        backgroundColor: side === 'pre' ? theme.colors.removedBg : theme.colors.addedBg,
        color: side === 'pre' ? theme.colors.removed : theme.colors.added
      };
    }
    
    if (type === 'removed' && side === 'pre') {
      return {
        backgroundColor: theme.colors.removedBg,
        color: theme.colors.removed
      };
    }
    
    if (type === 'added' && side === 'post') {
      return {
        backgroundColor: theme.colors.addedBg,
        color: theme.colors.added
      };
    }
    
    return {
      backgroundColor: theme.colors.surface,
      color: theme.colors.textSecondary
    };
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <h3 style={{ color: theme.colors.text, marginTop: 0, marginBottom: '20px' }}>
        Configuration Differences
      </h3>
      
      <div style={{ display: 'flex', gap: '1px', marginBottom: '10px' }}>
        <div style={{ 
          flex: 1, 
          padding: '8px 12px', 
          backgroundColor: theme.colors.removedBg,
          color: theme.colors.removed,
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          Before (Pre-Configuration)
        </div>
        <div style={{ 
          flex: 1, 
          padding: '8px 12px', 
          backgroundColor: theme.colors.addedBg,
          color: theme.colors.added,
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          After (Post-Configuration)
        </div>
      </div>
      
      <div
        style={{
          maxHeight: '600px',
          overflowY: 'auto',
          backgroundColor: theme.colors.background,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '4px',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: '14px'
        }}
      >
        {groupedLines.map((group, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              borderBottom: `1px solid ${theme.colors.border}`
            }}
          >
            {/* Pre (Before) Column */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                ...getLineStyle(group.type, 'pre'),
                borderRight: `1px solid ${theme.colors.border}`
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  minWidth: '40px',
                  padding: '2px 8px',
                  borderRight: `1px solid ${theme.colors.border}`,
                  textAlign: 'right',
                  color: theme.colors.textSecondary,
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }}
              >
                {group.preLineNum || ''}
              </span>
              <span style={{ 
                flex: 1, 
                padding: '2px 8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {group.preContent || ''}
              </span>
            </div>
            
            {/* Post (After) Column */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                ...getLineStyle(group.type, 'post')
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  minWidth: '40px',
                  padding: '2px 8px',
                  borderRight: `1px solid ${theme.colors.border}`,
                  textAlign: 'right',
                  color: theme.colors.textSecondary,
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }}
              >
                {group.postLineNum || ''}
              </span>
              <span style={{ 
                flex: 1, 
                padding: '2px 8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {group.postContent || ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};