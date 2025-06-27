import { Range, TextEditor } from "vscode";
import { findStrings } from "./findStrings";
import { findCurrentBracketPair } from "./findCurrentBracketPair";
import { splitText } from "./splitText";
import { BracketStyle } from "./BracketStyle";
import { joinText } from "./joinText";

export async function splitJoin(
  editor: TextEditor,
  maxScanLength: number,
  bracketPairs: string[],
  delimiters: string[],
  bracketStyles: Record<string, BracketStyle>
) {
  const document = editor.document;
  const position = editor.selection.active;

  const stringRanges = findStrings(document, position, maxScanLength);
  const ignoreRanges = [...stringRanges];

  const currentPair = findCurrentBracketPair(document, position, bracketPairs, maxScanLength, ignoreRanges);

  if (currentPair) {
    const startLine = currentPair.start.line;
    const endLine = currentPair.end.line;
    let text: string;
    const startOffset = document.offsetAt(currentPair.start);
    const endOffset = document.offsetAt(currentPair.end);

    const languageId = document.languageId;
    let bracketStyle: BracketStyle;

    if (typeof bracketStyles === "object" && bracketStyles !== null) {
      bracketStyle = bracketStyles[languageId] || bracketStyles["*"] || "one-true-brace";
    } else {
      bracketStyle = "one-true-brace";
    }

    if (startLine !== endLine) {
      text = joinText(document.getText(), { start: startOffset, end: endOffset });
    } else {
      text = splitText(
        document.getText(),
        { start: startOffset, end: endOffset },
        ignoreRanges,
        delimiters,
        bracketPairs,
        bracketStyle
      );
    }

    await editor.edit((editBuilder) => {
      editBuilder.replace(new Range(document.positionAt(startOffset), document.positionAt(endOffset + 1)), text);
    });
  }
}
