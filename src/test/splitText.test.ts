import * as assert from "assert";
import { splitText } from "../splitJoin";

suite("Split Text", () => {
  test("Splits simple parens", () => {
    const text = "(a,b,c)";
    const range = { start: 0, end: text.length - 1 };
    const result = splitText(text, range);

    assert.strictEqual(result, "(\n    a,\n    b,\n    c\n)");
  });

  test("Splits simple brackets", () => {
    const text = "[ 1, 2, 3 ]";
    const range = { start: 0, end: text.length - 1 };
    const result = splitText(text, range);

    assert.strictEqual(result, "[\n    1,\n    2,\n    3\n]");
  });

  test("Splits simple object", () => {
    const text = '{ "a": 1, "b": 2, "c": 3 }';
    const range = { start: 0, end: text.length - 1 };
    const result = splitText(text, range);

    assert.strictEqual(result, '{\n    "a": 1,\n    "b": 2,\n    "c": 3\n}');
  });

  test("Splits object with string containing commas", () => {
    const text = '{ "abc": "1,2,3", "xyz": "4,5,6" }';
    const range = { start: 0, end: text.length - 1 };

    const ignoreRanges = [
      { start: text.indexOf('"1,2,3"'), end: text.indexOf('"1,2,3"') + '"1,2,3"'.length },
      { start: text.indexOf('"4,5,6"'), end: text.indexOf('"4,5,6"') + '"4,5,6"'.length },
    ];
    const resultWithIgnore = splitText(text, range, ignoreRanges);

    assert.strictEqual(resultWithIgnore, '{\n    "abc": "1,2,3",\n    "xyz": "4,5,6"\n}');
  });

  test("Splits function call with parens", () => {
    const text = "function (1,2,3)";
    const range = { start: 9, end: text.length - 1 };
    const result = splitText(text, range);

    assert.strictEqual(result, "(\n    1,\n    2,\n    3\n)");
  });

  test("Splits nested structures", () => {
    const text = '{ "a": 1, "b": [1, 2, 3], "c": { "d": 4, "e": 5 } }';
    const range = { start: 0, end: text.length - 1 };
    const result = splitText(text, range);

    assert.strictEqual(
      result,
      '{\n    "a": 1,\n    "b": [\n        1,\n        2,\n        3\n    ],\n    "c": {\n        "d": 4,\n        "e": 5\n    }\n}'
    );
  });

  test("Splits Allman style array object", () => {
    const text = '{"items": [{"id": 1, "value": "A"}, {"id": 2, "value": "B"}]}';
    const range = { start: 0, end: text.length - 1 };
    const result = splitText(text, range, [], [",", ";"], ["()", "[]", "{}"], "allman");

    assert.strictEqual(
      result,
      '{\n    "items":\n    [\n        {\n            "id": 1,\n            "value": "A"\n        },\n        {\n            "id": 2,\n            "value": "B"\n        }\n    ]\n}'
    );
  });

  test("Splits One True Brace style complex nested JSON", () => {
    const text =
      '{"user": {"name": "Alice", "roles": ["admin", "editor"], "meta": {"active": true, "groups": [{"id": 1, "name": "group1"}, {"id": 2, "name": "group2"}]}}}';
    const range = { start: 0, end: text.length - 1 };
    const result = splitText(text, range);

    assert.strictEqual(
      result,
      '{\n    "user": {\n        "name": "Alice",\n        "roles": [\n            "admin",\n            "editor"\n        ],\n        "meta": {\n            "active": true,\n            "groups": [\n                {\n                    "id": 1,\n                    "name": "group1"\n                },\n                {\n                    "id": 2,\n                    "name": "group2"\n                }\n            ]\n        }\n    }\n}'
    );
  });
});
