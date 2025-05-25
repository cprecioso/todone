# todone

> Never forget to follow up on your code's TODOs, maintain code quality, and pay back your technical debt.

Todone analyzes your code for `@TODO` comments linked to external references and alerts you when they are due.
For example, it can alert you when an GitHub issue is resolved, a Figma comment is marked as resolved, a browser features is well-supported, or a date has passed.

```tsx
const Logo = () => (
  // @TODO https://caniuse.com/webp
  // Use PNG images until we can use WebP ones.
  <img src="/log.png" alt="Logo" />
);

// @TODO date:2023-10-01
// Remove the deprecated function once six months have passed.
/** @deprecated */
export const deprecatedFoo = () => oldImplementation();

const Title = () => (
  /*
    @TODO https://www.figma.com/design/ABCDEFGHJ123124?node-id=193-21#1021383481
    The designer mentioned this color is too strong and should be changed.
  */
  <h1 style={{ color: "#f00" }}>Hello World</h1>
);

/*
  @TODO https://github.com/org/repo/issues/42
  Remove workaround once upstream issue is resolved.
*/
setTimeout(() => processQueue(), 0);
```

When any of the links are resolved, `todone` will alert you so you can take action. The tool is built on a plugin system, allowing you to extend its functionality with ways to check for more kinds of TODO comments.

## Installation

```sh
$ npm install -D todone # if you use npm
$ yarn add -D todone    # if you use yarn
$ pnpm add -D todone    # if you use pnpm
```

## Usage

```
$ npx todone ./src

src/index.ts:1:5
        https://github.com/org/repo/issues/12
        EXPIRED
        expired on 5/13/2025

src/index.ts:3:5
        date:2026-06-21
        Not expired yet
        will expire on 6/21/2026


Analysis complete:
1 files found
2 matches found
2 results found
1 expired results found
```

You can check more options by running `npx todone --help`.

## Plugins

By default, `todone` comes bundled with the following plugins:

- {@link "@todone/plugin-caniuse"}
- {@link "@todone/plugin-date"}
- {@link "@todone/plugin-figma"}
- {@link "@todone/plugin-github"}

We'll add a system to load plugins from a configuration file in the future.
