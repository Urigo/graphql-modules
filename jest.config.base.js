const { resolve } = require('path');
const { pathsToModuleNameMapper } = require('ts-jest');

const ROOT_DIR = __dirname;
const TSCONFIG_PATH = resolve(ROOT_DIR, 'tsconfig.json');
const tsconfig = require(TSCONFIG_PATH);
const CI = !!process.env.CI;

module.exports = (dir) => {
  return {
    testEnvironment: 'node',
    rootDir: dir,
    reporters: ['default'],
    modulePathIgnorePatterns: ['dist', '.bob'],
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
      prefix: `${ROOT_DIR}/`,
    }),
    cacheDirectory: resolve(
      ROOT_DIR,
      `${CI ? '' : 'node_modules/'}.cache/jest`
    ),
  };
};
