import { DiffLine, DiffStats } from '../types';
import jsPDF from 'jspdf';
import Papa from 'papaparse';

export class DiffExporter {
  constructor(
    private diffData: DiffLine[],
    private stats: DiffStats
  ) {}

  exportText(): string {
    const lines: string[] = [
      'Configuration Diff Report',
      '='.repeat(50),
      `Total lines (Pre): ${this.stats.totalLinesPre}`,
      `Total lines (Post): ${this.stats.totalLinesPost}`,
      `Added: ${this.stats.added} lines`,
      `Removed: ${this.stats.removed} lines`,
      `Unchanged: ${this.stats.unchanged} lines`,
      '='.repeat(50),
      ''
    ];

    this.diffData.forEach((line) => {
      let prefix = ' ';
      let lineInfo = '';

      if (line.type === 'removed') {
        prefix = '-';
        lineInfo = `L${line.preLineNum}`;
      } else if (line.type === 'added') {
        prefix = '+';
        lineInfo = `L${line.postLineNum}`;
      } else {
        lineInfo = `L${line.preLineNum}`;
      }

      lines.push(`${prefix} ${lineInfo}: ${line.content}`);
    });

    return lines.join('\n');
  }

  exportCSV(): string {
    const data = this.diffData.map((line) => ({
      'Change Type': line.type,
      'Pre Line #': line.preLineNum || '',
      'Post Line #': line.postLineNum || '',
      'Content': line.content
    }));

    return Papa.unparse(data);
  }

  exportMarkdown(): string {
    const lines: string[] = [
      '# Configuration Diff Report',
      '',
      '## Statistics',
      '',
      `- **Total lines (Pre):** ${this.stats.totalLinesPre}`,
      `- **Total lines (Post):** ${this.stats.totalLinesPost}`,
      `- **Added:** ${this.stats.added} lines`,
      `- **Removed:** ${this.stats.removed} lines`,
      `- **Unchanged:** ${this.stats.unchanged} lines`,
      '',
      '## Changes',
      '',
      '```diff'
    ];

    this.diffData.forEach((line) => {
      if (line.type === 'removed') {
        lines.push(`- ${line.content}`);
      } else if (line.type === 'added') {
        lines.push(`+ ${line.content}`);
      } else {
        lines.push(`  ${line.content}`);
      }
    });

    lines.push('```');
    return lines.join('\n');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    let yPosition = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    // Title
    doc.setFontSize(20);
    doc.text('Configuration Diff Report', 20, yPosition);
    yPosition += 15;

    // Statistics
    doc.setFontSize(14);
    doc.text('Statistics', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const stats = [
      `Total lines (Pre): ${this.stats.totalLinesPre}`,
      `Total lines (Post): ${this.stats.totalLinesPost}`,
      `Added: ${this.stats.added} lines`,
      `Removed: ${this.stats.removed} lines`,
      `Unchanged: ${this.stats.unchanged} lines`
    ];

    stats.forEach((stat) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(stat, 20, yPosition);
      yPosition += lineHeight;
    });

    yPosition += 10;

    // Changes
    doc.setFontSize(14);
    doc.text('Changes', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    const maxLines = Math.min(this.diffData.length, 200); // Limit for PDF

    for (let i = 0; i < maxLines; i++) {
      const line = this.diffData[i];
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      let prefix = ' ';
      let color = '#000000';

      if (line.type === 'removed') {
        prefix = '-';
        color = '#ff0000';
      } else if (line.type === 'added') {
        prefix = '+';
        color = '#008000';
      }

      doc.setTextColor(color);
      const text = `${prefix} ${line.content.substring(0, 80)}${line.content.length > 80 ? '...' : ''}`;
      doc.text(text, 20, yPosition);
      yPosition += lineHeight;
    }

    if (this.diffData.length > maxLines) {
      doc.text(`... and ${this.diffData.length - maxLines} more lines`, 20, yPosition);
    }

    doc.save('config_diff.pdf');
  }

  download(format: 'text' | 'csv' | 'markdown', content: string): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `config_diff.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}