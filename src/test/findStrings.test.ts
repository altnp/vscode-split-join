import * as assert from "assert";
import * as vscode from "vscode";
import { findStrings } from "../findStrings";

suite("Find Strings", () => {
  test("Finds double quoted string", async () => {
    const doc = await vscode.workspace.openTextDocument({ content: 'abc "def" xyz', language: "javascript" });
    const intervals = findStrings(doc, new vscode.Position(0, 0), 100);
    assert.strictEqual(intervals.length, 1);
    assert.strictEqual(doc.getText().slice(intervals[0].start, intervals[0].end), '"def"');
  });

  test("Finds single quoted string", async () => {
    const doc = await vscode.workspace.openTextDocument({ content: "abc 'def' xyz", language: "javascript" });
    const intervals = findStrings(doc, new vscode.Position(0, 0), 100);
    assert.strictEqual(intervals.length, 1);
    assert.strictEqual(doc.getText().slice(intervals[0].start, intervals[0].end), "'def'");
  });

  test("Finds backtick quoted string", async () => {
    const doc = await vscode.workspace.openTextDocument({ content: "abc `def` xyz", language: "javascript" });
    const intervals = findStrings(doc, new vscode.Position(0, 0), 100);
    assert.strictEqual(intervals.length, 1);
    assert.strictEqual(doc.getText().slice(intervals[0].start, intervals[0].end), "`def`");
  });

  test("Ignores escaped quotes in string", async () => {
    const doc = await vscode.workspace.openTextDocument({ content: 'abc "d\\"ef" xyz', language: "javascript" });
    const intervals = findStrings(doc, new vscode.Position(0, 0), 100);
    assert.strictEqual(intervals.length, 1);
    assert.strictEqual(doc.getText().slice(intervals[0].start, intervals[0].end), '"d\\"ef"');
  });

  test("Ignores single inside double quotes", async () => {
    const doc = await vscode.workspace.openTextDocument({ content: 'abc "d\'ef" "x\'yz"', language: "javascript" });
    const intervals = findStrings(doc, new vscode.Position(0, 0), 100);
    assert.strictEqual(intervals.length, 2);
    assert.strictEqual(doc.getText().slice(intervals[0].start, intervals[0].end), '"d\'ef"');
    assert.strictEqual(doc.getText().slice(intervals[1].start, intervals[1].end), '"x\'yz"');
  });

  test("Ignores double inside single quotes", async () => {
    const doc = await vscode.workspace.openTextDocument({ content: "abc 'd\"ef' 'x\"yz'", language: "javascript" });
    const intervals = findStrings(doc, new vscode.Position(0, 0), 100);
    assert.strictEqual(intervals.length, 2);
    assert.strictEqual(doc.getText().slice(intervals[0].start, intervals[0].end), "'d\"ef'");
    assert.strictEqual(doc.getText().slice(intervals[1].start, intervals[1].end), "'x\"yz'");
  });

  test("Finds multiple strings", async () => {
    const doc = await vscode.workspace.openTextDocument({ content: '"a" "b" "c"', language: "javascript" });
    const intervals = findStrings(doc, new vscode.Position(0, 0), 100);
    assert.strictEqual(intervals.length, 3);
    assert.strictEqual(doc.getText().slice(intervals[0].start, intervals[0].end), '"a"');
    assert.strictEqual(doc.getText().slice(intervals[1].start, intervals[1].end), '"b"');
    assert.strictEqual(doc.getText().slice(intervals[2].start, intervals[2].end), '"c"');
  });

  test("Ignore out of range strings", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: 'abc     "out of range"',
      language: "javascript",
    });
    const intervals = findStrings(doc, new vscode.Position(0, 20), 3);
    assert.strictEqual(intervals.length, 0);
  });
});
