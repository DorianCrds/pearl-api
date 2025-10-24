// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    clearMocks: true,
    coverageDirectory: 'coverage',
    globalSetup: '<rootDir>/tests/helpers/setupTestDB.ts',

    maxWorkers: 1,

    silent: true,
    verbose: false,

    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/coverage/'
    ],
};

export default config;
