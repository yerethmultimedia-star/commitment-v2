const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

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

// 3. Dual ESM/CJS package hazard. Several deps here (i18next, @tamagui/core)
// ship both a dist/esm and a dist/cjs build. Workspace packages built to
// CommonJS (e.g. @commitment/localization, @commitment/design-system's tsc
// output) resolve require() calls to the CJS build, while apps/mobile's own
// ESM source resolves the same package to the ESM build. Each file defines
// its own module-level state (i18next's singleton, Tamagui's internal
// context registry), so without this redirect the app silently ends up with
// two disconnected instances — one real, one dead — instead of an error.
// This is what caused ADR-017 (Hero card / every i18nKey Design System
// component rendering empty text, no console error).
//
// Redirecting by string-replacing "cjs" -> "esm" in the path only works when
// both builds share a filename (i18next's dist/cjs/i18next.js <->
// dist/esm/i18next.js). Tamagui's exports map CJS/ESM to differently-named
// files (dist/cjs/index.cjs vs dist/esm/index.mjs), so instead we re-run
// Metro's own conditional-exports resolution with the "require" condition
// dropped, letting Metro's real exports-map parsing find the correct file
// under whatever name it has.
// react-i18next hits this same hazard but names its CJS output folder
// "commonjs" instead of "cjs" (its package.json exports map still splits
// require -> dist/commonjs/index.js vs import -> dist/es/index.js) — without
// this second pattern its module-level default-instance registration
// (set by core/i18n's `i18n.use(initReactI18next)`, an ESM-resolved import)
// lives in a disconnected copy from the CJS copy design-system's
// useTranslation() resolves to, so every i18nKey-driven component silently
// renders the raw key instead of a translation.
const looksLikeCjs = (filePath) =>
  !filePath
    ? false
    : filePath.includes('/dist/cjs/') ||
      filePath.includes('/dist/commonjs/') ||
      filePath.endsWith('.cjs');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  let resolution = context.resolveRequest(context, moduleName, platform);

  if (resolution && resolution.type === 'sourceFile' && looksLikeCjs(resolution.filePath)) {
    // context.unstable_conditionNames isn't populated with Expo's real
    // per-platform defaults here (it reads back empty once the static
    // override above is removed), so we can't derive a "drop require" list
    // from it. Rescue conditions must still vary by platform — a static list
    // here is exactly what caused the Tamagui <Adapt> regression this file
    // documents (see the block below) — so branch on `platform` explicitly
    // rather than hardcoding one condition order for every target.
    const esmConditionNames =
      platform === 'web' ? ['browser', 'module', 'import'] : ['react-native', 'module', 'import'];
    try {
      const esmResolution = context.resolveRequest(
        { ...context, unstable_conditionNames: esmConditionNames },
        moduleName,
        platform,
      );
      if (esmResolution && esmResolution.type === 'sourceFile' && esmResolution.filePath) {
        resolution = esmResolution;
      }
    } catch (e) {
      // Fall through to the original CJS resolution if the retry fails
    }
  }

  // pnpm symlink duplication: every workspace package gets its own symlinked
  // node_modules, so two packages on the same dependency version can still
  // resolve to different symlink paths. Resolving to the realpath collapses
  // symlinks back to one physical file, matching what Node's own require()
  // cache would do.
  if (resolution && resolution.type === 'sourceFile' && resolution.filePath) {
    try {
      const real = fs.realpathSync(resolution.filePath);
      if (real !== resolution.filePath) {
        return { ...resolution, filePath: real };
      }
    } catch (e) {
      // Fall through to the original resolution if realpath fails
    }
  }
  return resolution;
};

// 4. unstable_enablePackageExports is needed for pnpm to resolve symlinked
// packages' "exports" maps correctly.
//
// Deliberately NOT setting unstable_conditionNames here (a static
// ['browser', 'require', 'react-native'] list previously lived on this line).
// That static list applied the exact same condition priority regardless of
// which platform Metro was actually bundling for, which made every Tamagui
// package resolve to its react-native/.native.js build even when bundling
// for web. Tamagui's <Select>/<Adapt>/<Sheet> combo depends on those builds
// matching the platform Metro is targeting — with a mismatched build, <Adapt>
// mounts under a different context instance than <Select> provides, so it
// can never find its parent and throws
// "You're rendering a Tamagui <Adapt /> without nesting it inside a parent
// that is able to adapt" on every screen using Select (Tasks, Commitments).
// Letting Expo's own per-platform defaults apply (rather than overriding
// them with one static list) fixed this. If a future need reintroduces a
// custom condition list, it must vary by the `platform` argument above.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
