import { nodeCli, nodeLibrary } from "@todone/internal-build/tsdown";

export default [
  nodeLibrary({ entries: ["index", "config", "plugin", "types"] }),
  nodeCli(),
];
