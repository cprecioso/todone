// @ts-check

import assert from "node:assert";
import tsMorph from "ts-morph";

export const compile = (/** @type {string} */ code) => {
  const project = new tsMorph.Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      declaration: true,
      target: tsMorph.ScriptTarget.ESNext,
      module: tsMorph.ModuleKind.ESNext,
    },
  });

  project.createSourceFile("src/index.ts", code);

  const emitResult = project.emitToMemory({});
  const emittedFiles = emitResult.getFiles();

  assert.strictEqual(emittedFiles.length, 2, "Only 2 emitted files expected");

  const js = emittedFiles.find((file) => file.filePath.endsWith(".js"))?.text;

  const dts = emittedFiles.find((file) =>
    file.filePath.endsWith(".d.ts")
  )?.text;

  assert(js, "Expected .js file");
  assert(dts, "Expected .d.ts file");
  assert(js !== dts, ".js and .d.ts files should be different");

  return { js, dts };
};
