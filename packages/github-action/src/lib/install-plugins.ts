import { promisify } from "node:util";
import npm from "npm";

const install = promisify(npm.commands.install.bind(npm.commands));

export const installPackages = () => {
  await install([]);
};
