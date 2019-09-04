module.exports = {
  rootDir: process.cwd(),
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: '\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  errorOnDeprecated: true,
  forceExit: true,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        addFileAttribute: 'true',
      },
    ],
  ],
};
