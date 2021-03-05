module.exports = {
  roots: ['<rootDir>'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/.vercel/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '<rootDir>[/\\\\](node_modules|.next)[/\\\\]',
    '<rootDir>[/\\\\]src[/\\\\]__tests__[/\\\\]__mocks__',
  ],
  testRegex: '((\\.|/*.)(test))\\.(ts|js)?(x)?$',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  verbose: true,
};
