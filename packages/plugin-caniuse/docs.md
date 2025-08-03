# @todone/plugin-caniuse

A {@link todone} plugin that will alert you when a feature is supported by your target browsers.

## Options

- `browserslist`: A [browserslist](https://github.com/browserslist/browserslist#queries) query or array of browserslist queries. If using environment variables, set `BROWSERSLIST`.

## Usage

Add a `@TODO` comment with a link to a feature in the [caniuse.com](https://caniuse.com/) database:

```html
<!-- @TODO https://caniuse.com/webp -->
<!-- Use PNG images until we can use WebP ones. -->
<img src="/log.png" alt="Logo" />
```
