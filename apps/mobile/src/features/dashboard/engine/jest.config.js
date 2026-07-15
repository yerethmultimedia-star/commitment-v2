/**
 * Jest configuration for the dashboard engine unit tests.
 *
 * These tests only cover pure TypeScript modules (no React Native).
 * The engine is designed to be testable without mocking any React/Native modules.
 */

const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // __DEV__ is an RN/Metro global that plain Node doesn't provide.
  // assertDeterministic.ts's dev-only guards need it defined to exercise
  // the same code path they run under during real app development.
  globals: { __DEV__: true },
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
    '^@commitment/domain$': path.resolve(__dirname, '../../../../../packages/domain/src/index.ts'),
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testPathIgnorePatterns: ['/node_modules/'],
};
