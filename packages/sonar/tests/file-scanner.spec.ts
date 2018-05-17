import { loadSchemaFiles } from '../src';

function testSchemaDir(path, expectedResult, note, extensions?) {
  it(`should return the correct schema results for path: ${path} (${note})`, () => {
    const result = loadSchemaFiles(path, extensions);

    expect(result.length).toBe(expectedResult.length);
    expect(result.map(stripWhitespaces)).toEqual(expectedResult.map(stripWhitespaces));
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
  });

  describe('resolvers', () => {

  });
});
