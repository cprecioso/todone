# @todone/core

The main logic for finding matches in files and running plugins against them.

It uses [`ReadableStream`s](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) heavily, so make sure to be acquainted with them.

> [!TIP]
> An easy way to create `ReadableStream`s is to use [`ReadableStream.from()`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/from_static). And an easy way to consume them is to use a [`for await...of` loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) or [`Array.fromAsync()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync).
