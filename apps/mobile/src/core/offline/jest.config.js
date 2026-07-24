/**
 * Jest configuration for the AR-048 offline architecture skeleton
 * (Storage / OperationQueue / SynchronizationEngine).
 *
 * These are pure TypeScript contracts with no React Native dependency, so
 * unlike app-level tests this doesn't need any RN/Metro mocking.
 */

const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: path.resolve(__dirname, '..'),
  testMatch: ['<rootDir>/offline/**/__tests__/**/*.test.ts'],
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
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testPathIgnorePatterns: ['/node_modules/'],
};
