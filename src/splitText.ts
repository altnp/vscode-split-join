import * as vscode from "vscode";
import { Interval } from "./Interval";
import { BracketStyle } from "./BracketStyle";
import { WhitespaceBuffer } from "./WhitespaceBuffer";

function getIndentString(): string {
  try {
    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
      const options = activeEditor.options;
      const insertSpaces = options.insertSpaces;
      const tabSize = options.tabSize;

      if (insertSpaces && typeof tabSize === "number") {
        return " ".repeat(tabSize);
      } else {
        return "\t";
      }
    }

    const editorConfig = vscode.workspace.getConfiguration("editor");
    const insertSpaces = editorConfig.get("insertSpaces", true);
    const tabSize = editorConfig.get("tabSize", 2);
    if (insertSpaces) {
      return " ".repeat(tabSize);
    } else {
      return "\t";
    }
  } catch {
    return "  ";
  }
}

function indentString(level: number): string {
  const indent = getIndentString();
  return indent.repeat(level);
}

function findLineStart(text: string, start: number): number {
  if (start === 0) {
    return 0;
  }

  for (let i = start - 1; i >= 0; i--) {
    const char = text[i];
    if (char === "\n") {
      return i + 1;
    }
  }

  return 0;
}

function getIndentLevel(line: string): number {
  let indent = getIndentString();
  let count = 0;

  while (line.startsWith(indent.repeat(count + 1))) {
    count++;
  }

  return count;
}

export function splitText(
  text: string,
  range: { start: number; end: number },
  ignoreRanges: Interval[] = [],
  delimiters: string[] = [",", ";"],
  bracketPairs: string[] = ["()", "[]", "{}"],
  bracketStyle: BracketStyle = "one-true-brace"
): string {
  const { start, end } = range;
  let result = "";

  let lineStart = findLineStart(text, start);
  const line = text.slice(lineStart, start);

  let indentationLevel = getIndentLevel(line);

  const bracketMap = new Map<string, string>();
  for (const pair of bracketPairs) {
    if (pair.length === 2) {
      bracketMap.set(pair[0], pair[1]);
    }
  }

  let openBrackets: string[] = [];
  let whitespace = new WhitespaceBuffer();
  let suppressWhitespace = false;

  for (let i = start; i <= end; i++) {
    if (ignoreRanges.some((r) => i >= r.start && i < r.end)) {
      result += whitespace.retrieve() + text[i];

      if (suppressWhitespace) {
        suppressWhitespace = false;
      }

      continue;
    }

    if (/\s/.test(text[i])) {
      if (!suppressWhitespace) {
        whitespace.append(text[i]);
      }

      continue;
    }

    if (bracketMap.has(text[i])) {
      if (bracketStyle === "allman" && result.length > 0) {
        whitespace.set("\n" + indentString(indentationLevel));
      }

      result += whitespace.retrieve() + text[i];
      openBrackets.push(text[i]);
      indentationLevel++;

      whitespace.set("\n" + indentString(indentationLevel));
      suppressWhitespace = true;
      continue;
    }

    if (openBrackets.length > 0 && bracketMap.get(openBrackets[openBrackets.length - 1]) === text[i]) {
      openBrackets.pop();
      indentationLevel--;
      whitespace.clear();

      result += "\n";
      result += indentString(indentationLevel) + text[i];
      if (i < end && !delimiters.includes(text[i + 1])) {
        whitespace.set("\n" + indentString(indentationLevel));
      }
      suppressWhitespace = true;
      continue;
    }

    if (delimiters.includes(text[i])) {
      result += text[i];
      whitespace.set("\n" + indentString(indentationLevel));
      suppressWhitespace = true;
      continue;
    }

    if (suppressWhitespace) {
      suppressWhitespace = false;
    }
    result += whitespace.retrieve() + text[i];
  }

  if (bracketStyle === "allman" && lineStart < start) {
    result = "\n" + result;
  }

  return result;
}
