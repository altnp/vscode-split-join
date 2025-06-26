import * as vscode from "vscode";
import { Interval } from "./interval";

export function findStrings(document: vscode.TextDocument, position: vscode.Position, maxScanLength: number = 0): Interval[] {
  const text = document.getText();
  let scanStart = 0;
  let scanEnd = text.length;

  if (maxScanLength > 0) {
    const offset = document.offsetAt(position);
    scanStart = Math.max(0, offset - Math.floor(maxScanLength));
    scanEnd = Math.min(text.length, offset + Math.ceil(maxScanLength));
  }

  const intervals: Interval[] = [];
  let i = scanStart;
  let inString: string | null = null;
  let start = -1;
  let escape = false;

  while (i < scanEnd) {
    const char = text[i];

    if (!inString) {
      if (char === '"' || char === "'" || char === "`") {
        inString = char;
        start = i;
        i++;
        continue;
      }
    } else {
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === "`" && inString !== "`") {
        escape = true;
      } else if (char === inString) {
        if (i + 1 <= scanEnd) {
          intervals.push({ start, end: i + 1 });
        }
        inString = null;
        start = -1;
      }
    }
    i++;
  }

  return intervals;
}
