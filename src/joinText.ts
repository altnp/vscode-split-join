export function joinText(text: string, range: { start: number; end: number }): string {
  const { start, end } = range;
  let result = text.slice(start, end + 1);

  result = result.replace(/\s+/g, " ");

  return result;
}
