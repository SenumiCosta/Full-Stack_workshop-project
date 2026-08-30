module.exports = {
  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],

  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },

  moduleNameMapper: {
    '^.+\\.css$': '<rootDir>/src/testStyleMock.js'
  }
};