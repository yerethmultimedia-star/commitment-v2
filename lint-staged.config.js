const path = require('path');

module.exports = {
  'apps/backend/{src,test}/**/*.ts': (filenames) => {
    const relativeFiles = filenames.map((file) =>
      path.relative(path.join(__dirname, 'apps/backend'), file),
    );
    return `npx pnpm --filter backend exec eslint --fix ${relativeFiles.map((f) => `"${f}"`).join(' ')}`;
  },
  '**/*.{json,md,yml,yaml,js}': (filenames) => {
    return `npx prettier --write ${filenames.map((f) => `"${f}"`).join(' ')}`;
  },
};
