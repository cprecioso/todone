# @todone/plugin-date

A {@link todone} plugin that will alert you when a date has passed.

## Setup

Call the plugin factory in your `todone.config.ts`:

```ts
import datePlugin from "@todone/plugin-date";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [datePlugin()],
});
```

## Usage

Add a `@TODO` comment with a date in the format `date:YYYY-MM-DD`:

```js
const foo = () => newImplementation();

// @TODO date:2023-10-01
// Remove the deprecated function once six months have passed.
/** @deprecated */
const deprecatedFoo = () => oldImplementation();
```

You can also pass a full ISO 8601 datetime, like `date:2023-10-01T09:30:00Z`.
