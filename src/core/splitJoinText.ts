import { findEnclosingBracketRegion } from "./findEnclosingBracketRegion";

export type DetectConfig = {
  brackets: string[];
  separator: string;
  excludeRegions: string[];
};

type SplitConfig = {
  baseIndent: string;
  indentUnit: string;
};

function makeOpenToCloseMap(brackets: string[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const pair of brackets) {
    if (typeof pair === "string" && pair.length === 2) {
      result.set(pair[0], pair[1]);
    }
  }
  return result;
}

function isWhitespaceOnly(text: string): boolean {
  return text.trim().length === 0;
}

function getIndentPart(line: string): string {
  const match = line.match(/^\s*/);
  return match ? match[0] : "";
}

function getExcludedKinds(excludeRegions: string[]) {
  const set = new Set(excludeRegions);
  return {
    parens: set.has("()"),
    brackets: set.has("[]"),
    braces: set.has("{}"),
    doubleQuotes: set.has('""'),
    singleQuotes: set.has("''"),
  };
}

function findTopLevelSeparatorMatchEnds(inner: string, detect: DetectConfig): number[] {
  if (detect.separator === "") {
    return [];
  }

  const excluded = getExcludedKinds(detect.excludeRegions);
  const bracketMap = makeOpenToCloseMap(detect.brackets);

  const bracketStack: Array<{ open: string; close: string; isExcluded: boolean }> = [];
  let excludedDepth = 0;
  let inQuote: '"' | "'" | null = null;
  let isEscape = false;

  const separatorRegex = new RegExp(detect.separator, "gy");
  const matchEnds: number[] = [];

  let index = 0;
  while (index < inner.length) {
    const char = inner[index];

    if (inQuote) {
      if (isEscape) {
        isEscape = false;
      } else if (char === "\\") {
        isEscape = true;
      } else if (char === inQuote) {
        inQuote = null;
      }
      index++;
      continue;
    } else {
      if (excluded.doubleQuotes && char === '"') {
        inQuote = '"';
        index++;
        continue;
      }
      if (excluded.singleQuotes && char === "'") {
        inQuote = "'";
        index++;
        continue;
      }
    }

    if (bracketMap.has(char)) {
      const close = bracketMap.get(char)!;
      const isExcluded =
        (excluded.parens && char === "(" && close === ")") ||
        (excluded.brackets && char === "[" && close === "]") ||
        (excluded.braces && char === "{" && close === "}");

      bracketStack.push({ open: char, close, isExcluded });
      if (isExcluded) {
        excludedDepth++;
      }
      index++;
      continue;
    }

    if (bracketStack.length > 0) {
      const top = bracketStack[bracketStack.length - 1];
      if (char === top.close) {
        bracketStack.pop();
        if (top.isExcluded) {
          excludedDepth--;
        }
        index++;
        continue;
      }
    }

    if (excludedDepth > 0) {
      index++;
      continue;
    }

    separatorRegex.lastIndex = index;
    const match = separatorRegex.exec(inner);
    if (match) {
      const matchLen = match[0].length;
      if (matchLen === 0) {
        index++;
        continue;
      }
      matchEnds.push(index + matchLen);
      index += matchLen;
      continue;
    }

    index++;
  }

  // Exclude trailing separator + optional whitespace before end.
  if (matchEnds.length > 0) {
    const lastEnd = matchEnds[matchEnds.length - 1];
    if (isWhitespaceOnly(inner.slice(lastEnd))) {
      matchEnds.pop();
    }
  }

  return matchEnds;
}

export function joinRegionText(regionText: string): string {
  const lines = regionText.split("\n");
  if (lines.length <= 1) {
    return regionText;
  }

  let result = lines[0].replace(/\s+$/, "");
  for (let i = 1; i < lines.length; i++) {
    const pad = i === 1 || i === lines.length - 1 ? "" : " ";
    const next = lines[i].replace(/^\s+/, "");
    result += pad + next;
  }

  return result;
}

export function splitRegionText(regionText: string, split: SplitConfig, detect: DetectConfig): string {
  if (regionText.length < 2) {
    return regionText;
  }

  const open = regionText[0];
  const close = regionText[regionText.length - 1];
  const inner = regionText.slice(1, -1);

  const baseIndent = split.baseIndent;
  const innerIndent = baseIndent + split.indentUnit;

  if (isWhitespaceOnly(inner)) {
    return `${open}\n${baseIndent}${close}`;
  }

  const matchEnds = findTopLevelSeparatorMatchEnds(inner, detect);
  const parts: string[] = [];
  let prev = 0;
  for (const end of matchEnds) {
    parts.push(inner.slice(prev, end));
    prev = end;
  }
  parts.push(inner.slice(prev));

  const lines = parts.map((part, index) => {
    const withoutLeading = part.replace(/^\s+/, "");
    const finalPart = index === parts.length - 1 ? withoutLeading.replace(/\s+$/, "") : withoutLeading;
    return `${innerIndent}${finalPart}`;
  });

  return `${open}\n${lines.join("\n")}\n${baseIndent}${close}`;
}

export function findBracketRegionAtOffset(text: string, offset: number, detect: Pick<DetectConfig, "brackets">) {
  return findEnclosingBracketRegion(text, offset, detect.brackets);
}

export function computeToggleReplacement(
  text: string,
  offset: number,
  detect: DetectConfig,
  split: SplitConfig
): { start: number; end: number; replacement: string } | null {
  const region = findEnclosingBracketRegion(text, offset, detect.brackets);
  if (!region) {
    return null;
  }

  const regionText = text.slice(region.start, region.end + 1);
  const replacement = regionText.includes("\n") ? joinRegionText(regionText) : splitRegionText(regionText, split, detect);

  return { start: region.start, end: region.end, replacement };
}

export function getBaseIndentFromLine(line: string): string {
  return getIndentPart(line);
}

