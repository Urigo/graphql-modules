module.exports = {
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
};
