const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve React and Tamagui from the workspace root to avoid multiple instances
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.startsWith('react') ||
    moduleName.startsWith('@tamagui') ||
    moduleName.startsWith('tamagui')
  ) {
    try {
      // Resolve from workspace root to avoid context duplication
      return context.resolveRequest(context, moduleName, platform);
    } catch (e) {
      // Fallback to default
    }
  }
  // Optionally, we can resolve react-native this way too
  return context.resolveRequest(context, moduleName, platform);
};

// Next 2 lines are often needed for pnpm to resolve symlinks correctly:
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
