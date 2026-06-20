import { nodeCli, nodeLibrary } from "@todone/internal-build/tsdown";

export default [
  nodeLibrary({ entries: ["index", "plugin", "types"] }),
  nodeCli(),
];
