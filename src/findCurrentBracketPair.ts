import * as vscode from "vscode";
import { Interval } from "./interval";

function isBracketPair(pair: string): boolean {
  return pair.length === 2;
}

function getBracketChars(pair: string): [string, string] {
  return [pair[0], pair[1]];
}

function findBracketAtOffset(
  text: string,
  offset: number,
  open: string,
  close: string,
  scanEnd: number
): number | null {
  if (text[offset] === open) {
    let depth = 1;
    for (let j = offset + 1; j < scanEnd; j++) {
      if (text[j] === open) {
        depth++;
      }
      if (text[j] === close) {
        depth--;
      }
      if (depth === 0) {
        return offset;
      }
    }
  }
  return null;
}

function isProperlyNested(text: string, start: number, end: number, open: string, close: string): boolean {
  let depth = 0;
  for (let k = start + 1; k < end; k++) {
    if (text[k] === open) {
      depth++;
    }
    if (text[k] === close) {
      depth--;
    }
    if (depth < 0) {
      return false;
    }
  }
  return true;
}

function getIgnoreRange(
  i: number,
  ignoreRanges: { start: number; end: number }[]
): { start: number; end: number } | null {
  for (const range of ignoreRanges) {
    if (i >= range.start && i < range.end) {
      return range;
    }
  }
  return null;
}

export function findCurrentBracketPair(
  document: vscode.TextDocument,
  position: vscode.Position,
  bracketPairs: string[],
  maxScanLength: number = 0,
  ignoreRanges: Interval[] = []
): { start: vscode.Position; end: vscode.Position } | null {
  const text = document.getText();
  const offset = document.offsetAt(position);
  let best: { start: number; end: number; pair: string } | null = null;
  let scanStart = 0;
  let scanEnd = text.length;

  if (maxScanLength > 0) {
    scanStart = Math.max(0, offset - Math.floor(maxScanLength));
    scanEnd = Math.min(text.length, offset + Math.ceil(maxScanLength));
  }

  for (const pair of bracketPairs) {
    if (!isBracketPair(pair)) {
      continue;
    }
    const [open, close] = getBracketChars(pair);
    let stack: number[] = [];

    let i = scanStart;
    while (i < scanEnd) {
      const ignoreRange = getIgnoreRange(i, ignoreRanges);
      if (ignoreRange) {
        i = ignoreRange.end;
        continue;
      }
      const char = text[i];
      if (char === open) {
        stack.push(i);
        if (i === offset && findBracketAtOffset(text, i, open, close, scanEnd) !== null) {
          const startPos = document.positionAt(i);

          const closeIndex = (() => {
            let depth = 1;
            for (let j = i + 1; j < scanEnd; j++) {
              if (text[j] === open) {
                depth++;
              }
              if (text[j] === close) {
                depth--;
              }
              if (depth === 0) {
                return j;
              }
            }
            return -1;
          })();

          if (closeIndex !== -1) {
            const endPos = document.positionAt(closeIndex);

            return { start: startPos, end: endPos };
          }
        }
      } else if (char === close && stack.length > 0) {
        const start = stack.pop()!;
        const end = i;

        if (isProperlyNested(text, start, end, open, close) && start < offset && offset <= end) {
          if (!best || start > best.start) {
            best = { start, end, pair };
          }
        }
      }
      i++;
    }
  }

  return best ? { start: document.positionAt(best.start), end: document.positionAt(best.end) } : null;
}
