import * as vscode from "vscode";
import { splitJoin } from "./splitJoin";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("editor.splitJoin", async () => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      return;
    }

    const config = vscode.workspace.getConfiguration();

    const brackets: string[] = config.get("splitJoin.detect.brackets", ["()", "[]", "{}"]);
    const separator: string = config.get("splitJoin.detect.separator", ",");
    const excludeRegions: string[] = config.get("splitJoin.detect.excludeRegions", ["()", "[]", "{}", '""', "''"]);

    splitJoin(editor, { brackets, separator, excludeRegions });
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
