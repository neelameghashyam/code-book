module.exports = {
  preset: 'jest-preset-angular',
  testResultsProcessor: 'jest-sonar-reporter',
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*.module.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular|rxjs)',
  ],testPathIgnorePatterns: [
    '<rootDir>/e2e/', // Ignore Playwright tests
    '<rootDir>/node_modules/'
  ],
};