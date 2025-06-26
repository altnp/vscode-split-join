import * as assert from "assert";
import { joinText } from "../splitJoin";

suite("Join Text", () => {
  test("Joins simple multi-line content", () => {
    const text = "{\n  a,\n  b,\n  c\n}";
    const range = { start: 0, end: text.length - 1 };
    const result = joinText(text, range);

    assert.strictEqual(result, "{ a, b, c }");
  });

  test("Joins newlines inside strings", () => {
    const text = '{\n  "hello\nworld",\n  "test"\n}';
    const range = { start: 0, end: text.length - 1 };
    const result = joinText(text, range);

    assert.strictEqual(result, '{ "hello world", "test" }');
  });

  test("Normalizes multiple consecutive whitespace", () => {
    const text = "{\n  a,\n\n    b,\n\t\tc\n}";
    const range = { start: 0, end: text.length - 1 };
    const result = joinText(text, range);

    assert.strictEqual(result, "{ a, b, c }");
  });

  test("Preserves spaces around brackets", () => {
    const text = "{\n  1,\n  2,\n  {\n    a,\n    b\n  }\n}";
    const range = { start: 0, end: text.length - 1 };
    const result = joinText(text, range);

    assert.strictEqual(result, "{ 1, 2, { a, b } }");
  });

  test("Joins nested structures", () => {
    const text = '{\n  name: "John\nDoe",\n  data: [\n    "line1\nline2",\n    42\n  ]\n}';
    const range = { start: 0, end: text.length - 1 };
    const result = joinText(text, range);

    assert.strictEqual(result, '{ name: "John Doe", data: [ "line1 line2", 42 ] }');
  });
});
