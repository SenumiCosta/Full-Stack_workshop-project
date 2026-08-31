module.exports = {
  testEnvironment: 'jsdom',

  setupFiles: ['<rootDir>/src/setupTests.js'],

  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.js'],

  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },

  moduleFileExtensions: ['js', 'jsx'],

  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};