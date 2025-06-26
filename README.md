# Split Join VS Code Extension

Split Join is a Visual Studio Code extension that helps you quickly split or join bracketed content in your code. It finds the nearest enclosing bracket pair in scope and either joins multi-line content into a single line or splits single-line content into multiple lines, maintaining logical formatting and indentation.

## Features

- **Finds the nearest bracket pair** (parentheses, brackets, or braces) around your cursor or selection

- **Joins** multi-line bracketed content into a single line, normalizing whitespace and preserving spaces around nested structures

- **Splits** single-line bracketed content into multiple lines, aligning elements and maintaining indentation

- **Handles nested structures** and string literals, avoiding splitting or joining inside strings

- **Configurable bracket pairs and delimiters** via settings

## Command

- `Split/Join` (`editor.splitJoin`):

  Finds the nearest enclosing bracket pair at the cursor or selection and toggles between splitting and joining the content. If the content is on a single line, it will be split into multiple lines. If the content is already split, it will be joined into a single line. Formatting and indentation are preserved.

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
{ a, b, c }
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

**One True Brace Style Join → Split:**

Before:

```
{"user": {"name": "Alice", "roles": ["admin", "editor"], "meta": {"active": true, "groups": [{"id": 1, "name": "group1"}, {"id": 2, "name": "group2"}]}}}
```

After:

```
{
  "user": {
    "name": "Alice",
    "roles": [
      "admin",
      "editor"
    ],
    "meta": {
      "active": true,
      "groups": [
        {
          "id": 1,
          "name": "group1"
        },
        {
          "id": 2,
          "name": "group2"
        }
      ]
    }
  }
}
```

**Allman Style Example Join → Split:**

Before:

```
{"items": [{"id": 1, "value": "A"}, {"id": 2, "value": "B"}]}
```

After:

```
{
  "items":
  [
    {
      "id": 1,
      "value": "A"
    },
    {
      "id": 2,
      "value": "B"
    }
  ]
}
```

## Configuration

- `splitJoin.bracketPairs`: Array of bracket pairs to consider (default: `()`, `[]`, `{}`)
- `splitJoin.delimiters`: Array of delimiters to split/join on (default: `,`, `;`)
- `splitJoin.bracketStyle`: Controls the bracket style for split/join. Object mapping language ids to styles. Use `*` for default. Styles: `allman`, `one-true-brace` (default: `{ "*": "one-true-brace", "csharp": "allman" }`)

## Getting Started

1. Install the extension from the VS Code Marketplace
2. Use the `Split/Join` command from the Command Palette or bind it to a keyboard shortcut

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md) for details.
