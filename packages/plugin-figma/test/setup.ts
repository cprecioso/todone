// A FIGMA_TOKEN inherited from the surrounding environment (e.g. a developer
// shell) would silently change the plugin's default behavior — tests must
// always provide credentials explicitly.
delete process.env.FIGMA_TOKEN;
