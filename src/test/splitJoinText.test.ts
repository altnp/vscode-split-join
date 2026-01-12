import assert from "node:assert/strict";
import test from "node:test";
import { joinRegionText, splitRegionText, type DetectConfig } from "../core/splitJoinText";

const detect: DetectConfig = {
  brackets: ["()", "[]", "{}"],
  separator: ",",
  excludeRegions: ["()", "[]", "{}", '""', "''"],
};

test("splitRegionText: splits only at top-level separators", () => {
  const input = '{ "a": 1, "b": [1, 2, 3], "c": { "d": 4, "e": 5 } }';
  const out = splitRegionText(input, { baseIndent: "", indentUnit: "  " }, detect);

  assert.equal(
    out,
    '{\n  "a": 1,\n  "b": [1, 2, 3],\n  "c": { "d": 4, "e": 5 }\n}'
  );
});

test("splitRegionText: does not split on commas inside quotes", () => {
  const input = '("1,2,3", x)';
  const out = splitRegionText(input, { baseIndent: "", indentUnit: "  " }, detect);

  assert.equal(out, '(\n  "1,2,3",\n  x\n)');
});

test("splitRegionText: excludes trailing separator", () => {
  const input = "(a, b,)";
  const out = splitRegionText(input, { baseIndent: "", indentUnit: "  " }, detect);

  assert.equal(out, "(\n  a,\n  b,\n)");
});

test("splitRegionText: splits empty brackets onto two lines", () => {
  const input = "()";
  const out = splitRegionText(input, { baseIndent: "", indentUnit: "  " }, detect);

  assert.equal(out, "(\n)");
});

test("joinRegionText: joins with no outer bracket padding", () => {
  const input = "(\n  a,\n  b,\n  c\n)";
  const out = joinRegionText(input);
  assert.equal(out, "(a, b, c)");
});

test("joinRegionText: joins newlines inside strings", () => {
  const input = '{\n  "hello\nworld",\n  "test"\n}';
  const out = joinRegionText(input);

  assert.equal(out, '{"hello world", "test"}');
});
