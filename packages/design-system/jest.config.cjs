/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: '@react-native/jest-preset',
  transform: {
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$': require.resolve(
      '@react-native/jest-preset/jest/assetFileTransformer.js',
    ),
    '^.+\\.jsx?$': [
      'babel-jest',
      {
        configFile: './babel.config.cjs',
      },
    ],
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
      },
    ],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@tamagui/lucide-icons$': '<rootDir>/lucide-mock.cjs',
    '^@gorhom/bottom-sheet$': '<rootDir>/bottom-sheet-mock.cjs',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', 'setup\\.tsx?'],
  transformIgnorePatterns: ['node_modules/(?!(?:\\.pnpm/)?(?:react-native|@react-native|tamagui|@tamagui|@shopify|react-native-safe-area-context|@gorhom))'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
