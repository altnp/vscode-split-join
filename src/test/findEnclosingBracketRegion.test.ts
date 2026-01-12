import assert from "node:assert/strict";
import test from "node:test";
import { findEnclosingBracketRegion } from "../core/findEnclosingBracketRegion";

test("findEnclosingBracketRegion: finds innermost region", () => {
  const text = "let nested = (a, (b, c));";
  const offsetInsideInner = text.indexOf("b");
  const region = findEnclosingBracketRegion(text, offsetInsideInner, ["()", "[]", "{}"]);
  assert.ok(region);
  assert.equal(text.slice(region.start, region.end + 1), "(b, c)");
});

test("findEnclosingBracketRegion: includes cursor on closing bracket", () => {
  const text = "fn(a, b)";
  const offsetOnClose = text.indexOf(")");
  const region = findEnclosingBracketRegion(text, offsetOnClose, ["()"]);
  assert.ok(region);
  assert.equal(region.start, text.indexOf("("));
  assert.equal(region.end, offsetOnClose);
});

test("findEnclosingBracketRegion: returns null when none", () => {
  const text = "no brackets here";
  const region = findEnclosingBracketRegion(text, 3, ["()", "[]", "{}"]);
  assert.equal(region, null);
});

