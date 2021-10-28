module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transform: {
    '\\.[jt]sx?$': '<rootDir>/src/test/jest.transform.js',
  },
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$|@fontsource/': '<rootDir>/src/test/styleMock.js',
  },
};
