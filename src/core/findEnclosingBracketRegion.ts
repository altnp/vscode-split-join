export type BracketRegion = { start: number; end: number };

function isBracketPair(pair: string): pair is string {
  return typeof pair === "string" && pair.length === 2;
}

function getBracketChars(pair: string): [open: string, close: string] {
  return [pair[0], pair[1]];
}

function isProperlyNested(text: string, start: number, end: number, open: string, close: string): boolean {
  let depth = 0;
  for (let index = start + 1; index < end; index++) {
    if (text[index] === open) {
      depth++;
    }
    if (text[index] === close) {
      depth--;
    }
    if (depth < 0) {
      return false;
    }
  }
  return true;
}

// Find the smallest enclosing balanced pair containing `offset`.
// This intentionally focuses on "smallest bracketed region" behavior without
// trying to validate cross-bracket nesting of other bracket types.
export function findEnclosingBracketRegion(text: string, offset: number, bracketPairs: string[]): BracketRegion | null {
  if (offset < 0 || offset > text.length) {
    return null;
  }

  let best: { start: number; end: number } | null = null;

  for (const pair of bracketPairs) {
    if (!isBracketPair(pair)) {
      continue;
    }

    const [open, close] = getBracketChars(pair);
    const stack: number[] = [];

    for (let index = 0; index < text.length; index++) {
      const char = text[index];

      if (char === open) {
        stack.push(index);
      } else if (char === close && stack.length > 0) {
        const start = stack.pop()!;
        const end = index;

        if (!isProperlyNested(text, start, end, open, close)) {
          continue;
        }

        // Include both ends (i.e. `left <= ref <= right`).
        if (start <= offset && offset <= end) {
          if (!best || start > best.start) {
            best = { start, end };
          }
        }
      }
    }
  }

  return best;
}
