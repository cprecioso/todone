# @todone/plugin-figma

A {@link todone} plugin that will alert you when a comment in a Figma file has been resolved.

## Options

- `token`: The Figma API token to use for authentication. You can generate a personal access token from your Figma account settings. If using environment variables, set `FIGMA_TOKEN` to your token value.

## Usage

Add a `@TODO` comment with a link to a Figma comment:

```css
.box {
  /*
    @TODO https://www.figma.com/design/ABCDEFGHJ123124?node-id=193-21#1021383481
    The designer mentioned this color is too strong and should be changed.
  */
  background-color: #f00;
}
```
