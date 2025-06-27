import * as vscode from "vscode";
import { splitJoin } from "./splitJoin";
import { BracketStyle } from "./BracketStyle";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("editor.splitJoin", async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    const bracketPairs: string[] = vscode.workspace
      .getConfiguration()
      .get("splitJoin.bracketPairs", ["()", "[]", "{}"]);
    const maxScanLength: number = vscode.workspace.getConfiguration().get("splitJoin.maxScanLength", 0);
    const delimiters: string[] = vscode.workspace.getConfiguration().get("splitJoin.delimiters", [";", ","]);
    const bracketStyleSetting = vscode.workspace
      .getConfiguration()
      .get<Record<string, BracketStyle>>("splitJoin.bracketStyle", { "*": "one-true-brace", csharp: "allman" });

    splitJoin(editor, maxScanLength, bracketPairs, delimiters, bracketStyleSetting);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
