import * as Diff from 'diff';
import { DiffLine, DiffStats } from '../types';

export class ConfigDiffEngine {
  private preConfig: string = '';
  private postConfig: string = '';

  setConfigs(preConfig: string, postConfig: string): void {
    this.preConfig = preConfig;
    this.postConfig = postConfig;
  }

  getLineDiff(): DiffLine[] {
    const diff = Diff.diffLines(this.preConfig, this.postConfig);
    const result: DiffLine[] = [];
    let preLineNum = 0;
    let postLineNum = 0;

    diff.forEach((part) => {
      const lines = part.value.split('\n').filter(line => line !== '');
      
      lines.forEach((line) => {
        if (part.added) {
          postLineNum++;
          result.push({
            type: 'added',
            preLineNum: null,
            postLineNum,
            content: line
          });
        } else if (part.removed) {
          preLineNum++;
          result.push({
            type: 'removed',
            preLineNum,
            postLineNum: null,
            content: line
          });
        } else {
          preLineNum++;
          postLineNum++;
          result.push({
            type: 'unchanged',
            preLineNum,
            postLineNum,
            content: line
          });
        }
      });
    });

    return result;
  }

  getStats(): DiffStats {
    const diffLines = this.getLineDiff();
    const preLines = this.preConfig.split('\n').filter(line => line !== '');
    const postLines = this.postConfig.split('\n').filter(line => line !== '');

    return {
      totalLinesPre: preLines.length,
      totalLinesPost: postLines.length,
      added: diffLines.filter(line => line.type === 'added').length,
      removed: diffLines.filter(line => line.type === 'removed').length,
      unchanged: diffLines.filter(line => line.type === 'unchanged').length
    };
  }
}