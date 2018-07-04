import { mergeGraphQLSchemas, mergeGraphQLTypes } from '../src/schema-mergers/merge-schema';
import { makeExecutableSchema } from 'graphql-tools';
import { stripWhitespaces } from './utils';
import gql from 'graphql-tag';

describe('Merge Schema', () => {
  describe('mergeGraphQLTypes', () => {
    it('should return the correct definition of Schema', () => {
      const mergedArray = mergeGraphQLTypes([
        'type Query { f1: String }',
        'type Query { f2: String }',
        'type MyType { field: Int } type Query { f3: MyType }',
      ]);

      expect(mergedArray.length).toBe(3);
      expect(mergedArray[0].kind).toBe('ObjectTypeDefinition');
      expect(mergedArray[1].kind).toBe('ObjectTypeDefinition');
      expect(mergedArray[2].kind).toBe('SchemaDefinition');
    });

    it('should return the correct definition of Schema', () => {
      const mergedArray = mergeGraphQLTypes([
        'type Query { f1: String }',
        'type Query { f2: String }',
        'schema { query: Query }',
        'type MyType { field: Int } type Query { f3: MyType }',
      ]);

      expect(mergedArray.length).toBe(3);
      expect(mergedArray[0].kind).toBe('ObjectTypeDefinition');
      expect(mergedArray[1].kind).toBe('ObjectTypeDefinition');
      expect(mergedArray[2].kind).toBe('SchemaDefinition');
    });

    it('should return the correct definition of Schema when it defined multiple times', () => {
      const mergedArray = mergeGraphQLTypes([
        'type Query { f1: String }',
        'type Query { f2: String }',
        'schema { query: Query }',
        'schema { query: Query }',
        'schema { query: Query }',
        'type MyType { field: Int } type Query { f3: MyType }',
      ]);

      expect(mergedArray.length).toBe(3);
      expect(mergedArray[0].kind).toBe('ObjectTypeDefinition');
      expect(mergedArray[1].kind).toBe('ObjectTypeDefinition');
      expect(mergedArray[2].kind).toBe('SchemaDefinition');
    });
  });

  describe('mergeGraphQLSchemas', () => {
    it('should return a string with the correct values', () => {
      const merged = mergeGraphQLSchemas([
        'type Query { f1: String }',
        'type Query { f2: String }',
        'type MyType { field: Int } type Query { f3: MyType }',
      ]);

      expect(stripWhitespaces(merged)).toBe(stripWhitespaces(`
        type Query {
          f1: String
          f2: String
          f3: MyType
        }
  
        type MyType {
          field: Int
        }
  
        schema {
          query: Query
        }`));
    });

    it('should merge everything correctly', () => {
      const merged = mergeGraphQLSchemas([
        'type Query @test { f1: String }',
        'type Query @test2 { f2: String }',
        'type MyType { field: Int } type Query { f3: MyType } union MyUnion = MyType',
        'type MyType2 { field: Int } union MyUnion = MyType2',
        'interface MyInterface { f: Int } type MyType3 implements MyInterface { f: Int }',
        'interface MyInterface2 { f2: Int } type MyType4 implements MyInterface2 { f2: Int }',
        'interface MyInterface3 { f3: Int } type MyType4 implements MyInterface3 { f3: Int }'
      ]);

      expect(stripWhitespaces(merged)).toBe(stripWhitespaces(`
        type Query @test @test2 { f1: String f2: String f3: MyType } type MyType { field: Int } union MyUnion = MyType | MyType2 type MyType2 { field: Int } interface MyInterface { f: Int } type MyType3 implements MyInterface { f: Int } interface MyInterface2 { f2: Int } type MyType4 implements MyInterface2 & MyInterface3 { f2: Int f3: Int } interface MyInterface3 { f3: Int } schema { query: Query }
        `));
    });

    it('should include directives', () => {
      const merged = mergeGraphQLSchemas([
        `directive @id on FIELD_DEFINITION`,
        `type MyType { id: Int @id }`,
        `type Query { f1: MyType }`,
      ]);

      expect(stripWhitespaces(merged)).toBe(
        stripWhitespaces(`
          directive @id on FIELD_DEFINITION
          
          type MyType {
            id: Int @id
          } 
          
          type Query {
            f1: MyType
          } 
          
          schema {
            query: Query
          }
        `),
      );
    });

    it('should fail when there are multiple different directive definitions', (done: jest.DoneCallback) => {
      try {
        mergeGraphQLSchemas([
          `directive @id on FIELD_DEFINITION`,
          `directive @id(name: String) on FIELD_DEFINITION`,
          `type MyType { id: Int @id }`,
          `type Query { f1: MyType }`,
        ]);

        done.fail('It should have failed');
      } catch (e) {
        const msg = stripWhitespaces(e.message);

        expect(msg).toMatch('GraphQL directive "id"');
        expect(msg).toMatch('Existing directive: directive @id on FIELD_DEFINITION');
        expect(msg).toMatch('Received directive: directive @id(name: String) on FIELD_DEFINITION');

        done();
      }
    });

    it('should merge the same directives', () => {
      const merged = mergeGraphQLSchemas([
        `directive @id on FIELD_DEFINITION`,
        `directive @id on FIELD_DEFINITION`,
        `type MyType { id: Int @id }`,
        `type Query { f1: MyType }`,
      ]);

      expect(stripWhitespaces(merged)).toBe(
        stripWhitespaces(`
          directive @id on FIELD_DEFINITION
          
          type MyType {
            id: Int @id
          } 
          
          type Query {
            f1: MyType
          } 
          
          schema {
            query: Query
          }
        `),
      );
    });
  });

  describe('input arguments', () => {
    it('should handle string correctly', () => {
      const merged = mergeGraphQLSchemas([
        'type Query { f1: String }',
      ]);

      expect(stripWhitespaces(merged)).toBe(stripWhitespaces(`
        type Query {
          f1: String
        }
  
        schema {
          query: Query
        }`));
    });

    it('should handle compiled gql correctly', () => {
      const merged = mergeGraphQLSchemas([
        gql`type Query { f1: String }`,
      ]);

      expect(stripWhitespaces(merged)).toBe(stripWhitespaces(`
        type Query {
          f1: String
        }
  
        schema {
          query: Query
        }`));
    });

    it('should handle compiled gql and strings correctly', () => {
      const merged = mergeGraphQLSchemas([
        gql`type Query { f1: String }`,
        'type Query { f2: String }',
      ]);

      expect(stripWhitespaces(merged)).toBe(stripWhitespaces(`
        type Query {
          f1: String
          f2: String
        }
  
        schema {
          query: Query
        }`));
    });

    it('should handle GraphQLSchema correctly', () => {
      const merged = mergeGraphQLSchemas([
        makeExecutableSchema({
          typeDefs: [
            'type Query { f1: String }',
          ],
          allowUndefinedInResolve: true,
        }),
        'type Query { f2: String }',
      ]);

      expect(stripWhitespaces(merged)).toBe(stripWhitespaces(`
        type Query {
          f1: String
          f2: String
        }
  
        schema {
          query: Query
        }`));
    });

    it('should handle all merged correctly', () => {
      const merged = mergeGraphQLSchemas([
        makeExecutableSchema({
          typeDefs: [
            'type Query { f1: String }',
          ],
          allowUndefinedInResolve: true,
        }),
        'type Query { f2: String }',
        gql`type Query { f3: String }`,
      ]);

      expect(stripWhitespaces(merged)).toBe(stripWhitespaces(`
        type Query {
          f1: String
          f2: String
          f3: String
        }
  
        schema {
          query: Query
        }`));
    });

    it('should allow GraphQLSchema with empty Query', () => {
      const merged = mergeGraphQLSchemas([
        makeExecutableSchema({
          typeDefs: [
            'type MyType { f1: String }',
          ],
          allowUndefinedInResolve: true,
        }),
      ]);

      expect(stripWhitespaces(merged)).toBe(stripWhitespaces(`
        type MyType { f1: String }
        `));
    });

    it('should allow GraphQLSchema with empty Query', () => {
      const merged = mergeGraphQLSchemas([
        makeExecutableSchema({
          typeDefs: [
            'type MyType { f1: String }',
          ],
          allowUndefinedInResolve: true,
        }),
        makeExecutableSchema({
          typeDefs: [
            'type MyType { f2: String }',
          ],
          allowUndefinedInResolve: true,
        }),
      ]);

      expect(stripWhitespaces(merged)).toBe(stripWhitespaces(`
        type MyType { f1: String f2: String }
        `));
    });
  });
});
