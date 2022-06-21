const { resolve } = require('path');
const { pathsToModuleNameMapper } = require('ts-jest');

const ROOT_DIR = __dirname;
const TSCONFIG_PATH = resolve(ROOT_DIR, 'tsconfig.json');
const TSCONFIG_TEST_PATH = resolve(ROOT_DIR, 'tsconfig.test.json');
const tsconfig = require(TSCONFIG_PATH);
const CI = !!process.env.CI;

module.exports = (dir) => {
  return {
    testEnvironment: 'node',
    rootDir: dir,
    reporters: ['default'],
    modulePathIgnorePatterns: ['dist'],
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
      prefix: `${ROOT_DIR}/`,
    }),
    cacheDirectory: resolve(
      ROOT_DIR,
      `${CI ? '' : 'node_modules/'}.cache/jest`
    ),
  };
};
