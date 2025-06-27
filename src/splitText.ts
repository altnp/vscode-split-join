import * as vscode from "vscode";
import { Interval } from "./interval";
import { BracketStyle } from "./BracketStyle";

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

function indentString(text: string, level: number): string {
  const indent = getIndentString();

  let result = "";
  for (let i = 0; i < level; i++) {
    result += indent;
  }
  result += text;

  return result;
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

function getIndentLevel(line: string, indent: string): number {
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

  let indent = getIndentString();
  let lineStart = findLineStart(text, start);
  const line = text.slice(lineStart, start);

  let indentationLevel = getIndentLevel(line, indent);

  const bracketMap = new Map<string, string>();
  for (const pair of bracketPairs) {
    if (pair.length === 2) {
      bracketMap.set(pair[0], pair[1]);
    }
  }

  let openBrackets: string[] = [];
  let pendingWhitespace = "";
  let suppressWhitespace = false;

  for (let i = start; i <= end; i++) {
    if (ignoreRanges.some((r) => i >= r.start && i < r.end)) {
      result += pendingWhitespace + text[i];
      pendingWhitespace = "";

      if (suppressWhitespace) {
        suppressWhitespace = false;
      }

      continue;
    }

    if (/\s/.test(text[i])) {
      if (!suppressWhitespace) {
        pendingWhitespace += text[i];
      }

      continue;
    }

    if (bracketMap.has(text[i])) {
      if (bracketStyle === "allman") {
        if (result.length > 0 && !/\n\s*$/.test(result)) {
          result += "\n" + indentString("", indentationLevel);
        }
        result += text[i];
      } else {
        result += pendingWhitespace + text[i];
      }
      openBrackets.push(text[i]);
      indentationLevel++;

      pendingWhitespace = "";

      result += "\n" + indentString("", indentationLevel);
      suppressWhitespace = true;
      continue;
    }

    if (openBrackets.length > 0 && bracketMap.get(openBrackets[openBrackets.length - 1]) === text[i]) {
      openBrackets.pop();
      indentationLevel--;
      pendingWhitespace = "";

      if (!/\n\s*$/.test(result)) {
        result += "\n";
      }
      result += indentString(text[i], indentationLevel);
      if (i < end && !delimiters.includes(text[i + 1])) {
        result += "\n";
        pendingWhitespace += indentString("", indentationLevel);
      }
      suppressWhitespace = true;
      continue;
    }

    if (delimiters.includes(text[i])) {
      result += text[i] + "\n" + indentString("", indentationLevel);
      suppressWhitespace = true;
      continue;
    }

    if (suppressWhitespace) {
      suppressWhitespace = false;
    }

    result += pendingWhitespace + text[i];
    pendingWhitespace = "";
  }

  if (bracketStyle === "allman" && lineStart < start) {
    result = "\n" + result;
  }

  return result;
}
