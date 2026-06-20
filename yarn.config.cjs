// @ts-check

const { defineConfig } = require("@yarnpkg/types");

/** Fields copied verbatim from the root workspace to every other workspace. */
const FIELDS_TO_COPY = ["type", "author", "license", "repository", "bugs"];

module.exports = defineConfig({
  async constraints({ Yarn }) {
    const root = Yarn.workspace({ cwd: "." });
    if (!root) return;

    // Copy fields from the root workspace
    for (const workspace of Yarn.workspaces()) {
      if (workspace.cwd === ".") continue;
      for (const field of FIELDS_TO_COPY) {
        workspace.set(field, root.manifest[field]);
      }
    }

    // If a workspace has the same dependency as the root, use the same version
    for (const dependency of Yarn.dependencies()) {
      const rootDependency = Yarn.dependency({
        workspace: root,
        ident: dependency.ident,
      });
      if (!rootDependency) continue;
      dependency.update(rootDependency.range);
    }

    // Keep peerDependencies in sync with the version declared in
    // devDependencies or dependencies (those are the source of truth)
    for (const peerDependency of Yarn.dependencies({
      type: "peerDependencies",
    })) {
      const sourceDependency =
        Yarn.dependency({
          workspace: peerDependency.workspace,
          ident: peerDependency.ident,
          type: "devDependencies",
        }) ??
        Yarn.dependency({
          workspace: peerDependency.workspace,
          ident: peerDependency.ident,
          type: "dependencies",
        });
      if (!sourceDependency) continue;
      // A `workspace:*` source becomes `workspace:^` as a peerDep, so consumers
      // get a semver range instead of an exact pin
      peerDependency.update(
        sourceDependency.range === "workspace:*"
          ? "workspace:^"
          : sourceDependency.range,
      );
    }
  },
});
