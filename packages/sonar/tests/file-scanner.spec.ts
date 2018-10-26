import {loadResolversFiles, loadSchemaFiles} from '../src';

function testSchemaDir(path, expectedResult, note, extensions?: string[]) {
  it(`should return the correct schema results for path: ${path} (${note})`, () => {
    const result = loadSchemaFiles(path, extensions ? { extensions } : {});

    expect(result.length).toBe(expectedResult.length);
    expect(result.map(stripWhitespaces)).toEqual(expectedResult.map(stripWhitespaces));
  });
}

function testResolversDir(path, expectedResult, note, extensions = null, compareValue = true) {
  it(`should return the correct resolvers results for path: ${path} (${note})`, () => {
    const result = loadResolversFiles(path, extensions ? { extensions } : {});

    expect(result.length).toBe(expectedResult.length);

    if (compareValue) {
      expect(result).toEqual(expectedResult);
    }
  });
}

function stripWhitespaces(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

describe('file scanner', function () {
  describe('schema', () => {
    const schemaContent = `type MyType { f: String }`;
    testSchemaDir('./tests/test-assets/1', [schemaContent], 'one file');
    testSchemaDir('./tests/test-assets/2', [schemaContent, schemaContent, schemaContent], 'multiple files');
    testSchemaDir('./tests/test-assets/3', [schemaContent, schemaContent, schemaContent], 'recursive');
    testSchemaDir('./tests/test-assets/4', [schemaContent], 'custom extension', ['schema']);
    testSchemaDir('./tests/test-assets/5', [schemaContent, schemaContent], 'custom extensions', ['schema', 'myschema']);
    testSchemaDir('./tests/test-assets/10', [schemaContent, schemaContent, schemaContent], 'code files with gql tag', ['js']);
  });

  describe('resolvers', () => {
    testResolversDir('./tests/test-assets/6', [{ MyType: { f: 1 }}], 'one file');
    testResolversDir('./tests/test-assets/7', [{ MyType: { f: 1 }}, { MyType: { f: 2 }}], 'multiple files');
    testResolversDir('./tests/test-assets/8', [{ MyType: { f: 1 }}], 'default export');
    testResolversDir('./tests/test-assets/9', [{ MyType: { f: 1 }}, { MyType: { f: 2 }}], 'named exports');
    testResolversDir('./tests/test-assets/11', (new Array(2)).fill(''), 'ignored extensions', null, false);
  });
});
