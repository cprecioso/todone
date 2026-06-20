import { nodeCli, nodeLibrary } from "@todone/internal-build/tsdown";

export default [nodeLibrary({ entries: ["plugin", "types"] }), nodeCli()];
