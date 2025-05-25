# @todone/plugin-caniuse

A {@link todone} plugin that will alert you when a feature is supported by your target browsers.

## Setup

It needs to be configured with a list of browsers you want to support through the regular [browserlist config](https://github.com/browserslist/browserslist).

## Usage

Add a `@TODO` comment with a link to a feature in the [caniuse.com](https://caniuse.com/) database:

```html
<!-- @TODO https://caniuse.com/webp -->
<!-- Use PNG images until we can use WebP ones. -->
<img src="/log.png" alt="Logo" />
```
