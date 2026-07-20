/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.tsx?$',
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@pablo/shared$': '<rootDir>/../../../packages/shared/src',
  },
};
