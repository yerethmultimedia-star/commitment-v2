/**
 * Jest configuration for the insights engine unit tests.
 *
 * These tests only cover pure TypeScript modules (no React Native). The
 * engine is designed to be testable without mocking any React/Native
 * modules — and deliberately has no __DEV__ dependency (see
 * InsightsLayoutEngine.ts's doc comment), so unlike the dashboard engine's
 * config this one doesn't need a `globals: { __DEV__ }` shim.
 */

const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: path.resolve(__dirname, '..'),
  testMatch: ['<rootDir>/engine/**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: path.resolve(__dirname, 'tsconfig.jest.json'),
        useESM: false,
      },
    ],
  },
  moduleNameMapper: {
    '^@commitment/domain$': path.resolve(
      __dirname,
      '../../../../../../packages/domain/src/index.ts',
    ),
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testPathIgnorePatterns: ['/node_modules/'],
};
