module.exports = {
  roots: ['<rootDir>'],
  projects: ['<rootDir>/jest.config.js', '<rootDir>/client/jest.config.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
};
