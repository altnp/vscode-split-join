import * as assert from "assert";
import * as vscode from "vscode";
import { findCurrentBracketPair } from "../findCurrentBracketPair";

const TEST_BRACKET_PAIRS = ["()", "[]", "{}"];
const TEST_MAX_SCAN_LENGTH = 0;

suite("Find Nearest Braket Pair", () => {
  test("Finds enclosing () pair for function signature inside of parens", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "function test(abc,xyz) {\n  let x = (1 + 2);\n}",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 14);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "(");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), ")");
  });

  test("Finds enclosing () pair for function signature, closing paren", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "function test(abc,xyz) {\n  let x = (1 + 2);\n}",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 21);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "(");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), ")");
  });

  test("Finds enclosing {} pair for function body", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "function test() {\n  let x = (1 + 2);\n}",
      language: "javascript",
    });
    const pos = new vscode.Position(2, 0);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "{");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "}");
  });

  test("Finds enclosing [] pair for array", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "let arr = [1, 2, 3];",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 12);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "[");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "]");
  });

  test("Finds enclosing {} pair for object", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "let obj = { a: 1, b: 2 };",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 12);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "{");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "}");
  });

  test("Finds innermost () pair for nested brackets", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "let nested = (a, (b, c));",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 20);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "(");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), ")");
    assert.strictEqual(doc.offsetAt(result.start), doc.getText().indexOf("(b, c)"));
  });

  test("Returns null if no bracket pair is found", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "let x = 123;",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 0);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.strictEqual(result, null);
  });

  test("Finds enclosing [ for mixed brackets", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "let mixed = [ { ( ) } ];",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 13);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "[");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "]");
  });

  test("Finds enclosing { for mixed brackets", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "let mixed = [ { ( ) } ];",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 19);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "{");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "}");
  });

  test("Finds enclosing ( for mixed brackets", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "let mixed = [ { ( ) } ];",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 17);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "(");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), ")");
  });

  test("Finds enclosing [ for mixed brackets with cursor on closing bracket", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "let mixed = [{()}];",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 17);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "[");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "]");
  });

  test("Finds enclosing { for mixed brackets with cursor on closing bracket", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "let mixed = [{()}];",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 16);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "{");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "}");
  });

  test("Finds enclosing ( for mixed brackets with cursor on closing bracket", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "let mixed = [{()}];",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 15);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "(");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), ")");
  });

  test("Returns null for mismatched bracket", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "(words ( ) ...]",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 10);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.strictEqual(result, null);
  });

  test("Finds first { in mismatched brackets while on mismatched (", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "{ (]( [ ) ] }",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 2);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "{");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "}");
  });

  test("Finds first second ( for mismatched brackets", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "{ (]( [ ) ] }",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 4);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "(");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), ")");
    assert.strictEqual(doc.offsetAt(result.start), doc.getText().indexOf("( [ )"));
  });

  test("Finds first { in mismatched brackets", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "{ (]( [ ) ] }",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 1);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "{");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "}");
  });

  test("Finds first [ in mismatched brackets", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "{ (]( [ ) ] }",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 9);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "[");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "]");
  });

  test("Finds first { in mismatched brackets while on closing }", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "{ (]( [ ) ] }",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 12);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, TEST_MAX_SCAN_LENGTH);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "{");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), "}");
  });

  test("Finds bracket pair when within maxScanLength", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "abc (def) xyz",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 6);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, 10);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "(");
    assert.strictEqual(doc.getText(new vscode.Range(result.end, result.end.translate(0, 1))), ")");
  });

  test("Does not find bracket pair if start is out of maxScanLength range", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "abc (def) xyz",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 9);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, 2);
    assert.strictEqual(result, null);
  });

  test("Does not find bracket pair if end is out of maxScanLength range", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "abc (def) xyz",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 5);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, 2);
    assert.strictEqual(result, null);
  });

  test("Does not find bracket pair if both start and end are out of maxScanLength range", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "abc ( def ) xyz",
      language: "javascript",
    });
    const pos = new vscode.Position(0, 6);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, 2);
    assert.strictEqual(result, null);
  });

  test("Skips brackets inside ignore ranges", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "abc (def /* (not a bracket) */) xyz",
      language: "javascript",
    });
    const ignoreRanges = [
      { start: 9, end: 28 }, // covers /* (not a bracket) */
    ];
    const pos = new vscode.Position(0, 30);
    const result = findCurrentBracketPair(doc, pos, TEST_BRACKET_PAIRS, 0, ignoreRanges);
    assert.ok(result);
    assert.strictEqual(doc.getText(new vscode.Range(result.start, result.start.translate(0, 1))), "(");
    assert.ok(result.start.character < 9 || result.start.character >= 28);
  });
});
