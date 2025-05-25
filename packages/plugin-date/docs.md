# @todone/plugin-date

A {@link todone} plugin that will alert you when a date has passed.

## Usage

Add a `@TODO` comment with a date in the format `date:YYYY-MM-DD`:

```js
const foo = () => newImplementation();

// @TODO date:2023-10-01
// Remove the deprecated function once six months have passed.
/** @deprecated */
const deprecatedFoo = () => oldImplementation();
```
