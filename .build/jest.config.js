"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    preset: 'ts-jest/presets/js-with-ts',
    transform: {
        '^.+\\.m?[tj]sx?$': ['ts-jest'],
    },
    testEnvironment: 'node',
    testMatch: ['**/*.+(spec|test).[tj]s?(x)'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
    moduleNameMapper: {
        '#(.*)': '<rootDir>/src/$1',
    },
    testPathIgnorePatterns: ['/node_modules/', '/frontend/'],
    resetModules: false,
    coverageDirectory: './.jest',
    collectCoverageFrom: ['**/*.{ts,dts}', '!**/node_modules/**', '!**/test/**'],
    coverageReporters: ['lcov', 'text'],
    coveragePathIgnorePatterns: ['/dist/'],
    testTimeout: 60000,
};
//# sourceMappingURL=jest.config.js.map