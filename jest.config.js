module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/functions'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false
    }]
  },
  collectCoverageFrom: [
    'functions/**/*.ts',
    '!functions/**/*.d.ts',
    '!functions/**/*.test.ts',
  ]
};
