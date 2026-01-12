# Split Join VS Code Extension

Split Join is a Visual Studio Code extension that helps you quickly split or join arguments inside brackets. It finds the nearest enclosing bracket pair around your cursor and toggles between splitting (one argument per line) and joining (single line), modeled after `mini.splitjoin`.

## Features

- **Finds the nearest bracket pair** (parentheses, brackets, or braces) around your cursor

- **Join** makes the region a single line with minimal whitespace changes (no default padding inside the outer brackets)

- **Split** puts each top-level separator at end of line and indents inner lines by one level

- **Excludes separators** inside nested brackets and quotes during split detection

- **Configurable detection** (brackets, separator regexp, excluded regions)

## Command

- `Split/Join` (`editor.splitJoin`):

  Finds the nearest enclosing bracket pair at the cursor and toggles between splitting and joining. If the region is on a single line, it will be split. If it spans multiple lines, it will be joined.

  Available from the Command Palette and via the default keymap.

## Default Keymap

- `Ctrl+J` — Split or join the nearest bracketed content (when the editor is focused and not read-only)

## Example Usage

**Join Example:**

```
{
  a,
  b,
  c
}
```

becomes

```
{a, b, c}
```

**Split Example:**

```
(a, b, c)
```

becomes

```
(
  a,
  b,
  c
)
```

## Configuration

- `splitJoin.detect.brackets`: Array of bracket pairs to consider (default: `()`, `[]`, `{}`)
- `splitJoin.detect.separator`: JavaScript RegExp source used to detect argument separators (default: `,`)
- `splitJoin.detect.excludeRegions`: Array of region kinds in which separators are ignored (default: `()`, `[]`, `{}`, `""`, `''`)

## Getting Started

1. Install the extension from the VS Code Marketplace
2. Use the `Split/Join` command from the Command Palette or bind it to a keyboard shortcut

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md) for details.
