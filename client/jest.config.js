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
  testPathIgnorePatterns: [
    '<rootDir>[/\\\\](node_modules|.next)[/\\\\]',
    '<rootDir>[/\\\\]src[/\\\\]__tests__[/\\\\]__mocks__',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
};
