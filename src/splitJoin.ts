import { Range, TextEditor } from "vscode";
import {
  DetectConfig,
  findBracketRegionAtOffset,
  getBaseIndentFromLine,
  joinRegionText,
  splitRegionText,
} from "./core/splitJoinText";

function getIndentUnit(editor: TextEditor): string {
  const insertSpaces = editor.options.insertSpaces;
  const tabSize = editor.options.tabSize;

  if (insertSpaces && typeof tabSize === "number") {
    return " ".repeat(tabSize);
  }
  return "\t";
}

export async function splitJoin(editor: TextEditor, detect: DetectConfig) {
  const document = editor.document;
  const position = editor.selection.active;
  const text = document.getText();
  const offset = document.offsetAt(position);

  const region = findBracketRegionAtOffset(text, offset, { brackets: detect.brackets });
  if (!region) {
    return;
  }

  const regionText = text.slice(region.start, region.end + 1);
  const splitConfig = {
    baseIndent: getBaseIndentFromLine(document.lineAt(document.positionAt(region.start).line).text),
    indentUnit: getIndentUnit(editor),
  };

  const replacement = regionText.includes("\n")
    ? joinRegionText(regionText)
    : splitRegionText(regionText, splitConfig, detect);

  await editor.edit((editBuilder) => {
    editBuilder.replace(new Range(document.positionAt(region.start), document.positionAt(region.end + 1)), replacement);
  });
}
