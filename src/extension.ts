import * as vscode from "vscode";
import { findStrings } from "./findStrings";
import { findCurrentBracketPair } from "./findCurrentBracketPair";
import { joinText, splitText } from "./splitJoin";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("editor.splitJoin", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;

    const bracketPairs: string[] = vscode.workspace.getConfiguration().get("splitJoin.bracketPairs", ["()", "[]", "{}"]);
    const maxScanLength: number = vscode.workspace.getConfiguration().get("splitJoin.maxScanLength", 0);
    const delimiters: string[] = vscode.workspace.getConfiguration().get("splitJoin.delimiters", [";", ","]);
    const bracketStyleSetting = vscode.workspace.getConfiguration().get<any>("splitJoin.bracketStyle", { "*": "one-true-brace", csharp: "allman" });

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
      let bracketStyle;

      if (typeof bracketStyleSetting === "object" && bracketStyleSetting !== null) {
        bracketStyle = bracketStyleSetting[languageId] || bracketStyleSetting["*"] || "one-true-brace";
      } else {
        bracketStyle = "one-true-brace";
      }

      if (startLine !== endLine) {
        text = joinText(document.getText(), { start: startOffset, end: endOffset });
      } else {
        text = splitText(document.getText(), { start: startOffset, end: endOffset }, ignoreRanges, delimiters, bracketPairs, bracketStyle);
      }

      await editor.edit((editBuilder) => {
        editBuilder.replace(new vscode.Range(document.positionAt(startOffset), document.positionAt(endOffset + 1)), text);
      });
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
