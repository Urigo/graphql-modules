import { mergeGraphQLSchemas, mergeGraphQLTypes } from '../src/schema-mergers/merge-schema';
import { makeExecutableSchema } from 'graphql-tools';
import { buildSchema, buildClientSchema, print } from 'graphql';
import { stripWhitespaces } from './utils';
import gql from 'graphql-tag';
import * as introspectionSchema from './schema.json';

describe('Merge Schema', () => {
  describe('AST Schema Fixing', () => {
    it('Should handle correctly schema without valid root AST node', () => {
      const schema = buildSchema(`
        type A {
          a: String
        }

        type Query {
          a: A
        }
      `);

      expect(schema.astNode).toBeUndefined();

      expect(() => {
        mergeGraphQLTypes([
          schema,
        ], {
          useSchemaDefinition: true,
        });
      }).not.toThrow();
    });

    it('Should handle correctly schema without valid types AST nodes', () => {
      const schema = buildClientSchema(introspectionSchema);

      expect(schema.astNode).toBeUndefined();

      expect(() => {
        mergeGraphQLTypes([
          schema,
        ], {
          useSchemaDefinition: true,
        });
      }).not.toThrow();
    });
  });

  describe('mergeGraphQLTypes', () => {
    it('should return the correct definition of Schema', () => {
      const mergedArray = mergeGraphQLTypes([
        'type Query { f1: String }',
        'type Query { f2: String }',
        'type MyType { field: Int } type Query { f3: MyType }',
      ], {
        useSchemaDefinition: true,
      });

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
      ], {
        useSchemaDefinition: true,
      });

      expect(mergedArray.length).toBe(3);
      expect(mergedArray[0].kind).toBe('ObjectTypeDefinition');
      expect(mergedArray[1].kind).toBe('ObjectTypeDefinition');
      expect(mergedArray[2].kind).toBe('SchemaDefinition');
    });

    it('should accept root schema object', () => {
      const mergedSchema = mergeGraphQLSchemas([
        'type RootQuery { f1: String }',
        'type RootQuery { f2: String }',
        'schema { query: RootQuery }',
        'type MyType { field: Int } type RootQuery { f3: MyType }',
      ]);

      const schema = makeExecutableSchema({
        typeDefs: mergedSchema,
      });
      const queryType = schema.getQueryType();

      expect(queryType).toBeDefined();
      expect(queryType).not.toBeNull();
      expect(queryType.name).toEqual('RootQuery');
    });

    it('should return the correct definition of Schema when it defined multiple times', () => {
      const mergedArray = mergeGraphQLTypes([
        'type Query { f1: String }',
        'type Query { f2: String }',
        'schema { query: Query }',
        'schema { query: Query }',
        'schema { query: Query }',
        'type MyType { field: Int } type Query { f3: MyType }',
      ], {
        useSchemaDefinition: true,
      });

      expect(mergedArray.length).toBe(3);
      expect(mergedArray[0].kind).toBe('ObjectTypeDefinition');
      expect(mergedArray[1].kind).toBe('ObjectTypeDefinition');
      expect(mergedArray[2].kind).toBe('SchemaDefinition');
    });
  });

  describe('mergeGraphQLSchemas', () => {
    it('should return a Document with the correct values', () => {
      const merged = mergeGraphQLSchemas([
        'type Query { f1: String }',
        'type Query { f2: String }',
        'type MyType { field: Int } type Query { f3: MyType }',
      ]);

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
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

    it('should skip printing schema definition object on request', () => {
      const merged = mergeGraphQLSchemas([
        'type Query { f1: String }',
        'type Query { f2: String }',
        'type MyType { field: Int } type Query { f3: MyType }',
      ], {
        useSchemaDefinition: false,
      });

      const output = stripWhitespaces(print(merged));

      expect(output).not.toContain('schema {');

      expect(output).toBe(stripWhitespaces(`
        type Query {
          f1: String
          f2: String
          f3: MyType
        }

        type MyType {
          field: Int
        }`));
    });

    it('should keep scalars', () => {
      const mergedSchema = mergeGraphQLSchemas([
        buildSchema('scalar UniqueId'),
      ]);

      expect(print(mergedSchema).indexOf('scalar')).not.toEqual(-1);

      const schema = makeExecutableSchema({
        typeDefs: mergedSchema,
      });

      expect(schema.getType('UniqueId')).toBeDefined();
    });

    it('should merge descriptions', () => {
      const merged = mergeGraphQLSchemas([
        `
          " She's my type "
          type MyType { field1: Int }
        `,
        `
          " or she's not? "
          type MyType { field2: String }
        `,
        `
          " Contains f1 "
          type Query { f1: MyType }
        `,
      ]);

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        " or she's not? "
        type MyType {
          field1: Int
          field2: String
        }

        " Contains f1 "
        type Query {
          f1: MyType
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
        'interface MyInterface3 { f3: Int } type MyType4 implements MyInterface3 { f3: Int }',
      ]);

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        type Query @test @test2 {
          f1: String
          f2: String
          f3: MyType
        }
        type MyType {
          field: Int
        }
        union MyUnion = MyType | MyType2
        type MyType2 {
          field: Int
        }
        interface MyInterface {
          f: Int
        }
        type MyType3 implements MyInterface {
          f: Int
        } interface MyInterface2 {
          f2: Int
        }
        type MyType4 implements MyInterface2 & MyInterface3 {
          f2: Int f3: Int
        }
        interface MyInterface3 {
          f3: Int
        }
        schema {
          query: Query
        }
        `));
    });

    it('should include directives', () => {
      const merged = mergeGraphQLSchemas([
        `directive @id on FIELD_DEFINITION`,
        `type MyType { id: Int @id }`,
        `type Query { f1: MyType }`,
      ]);

      expect(stripWhitespaces(print(merged))).toBe(
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

    it('should append and extend directives', () => {
      const merged = mergeGraphQLSchemas([
        `directive @id(primitiveArg: String, arrayArg: [String]) on FIELD_DEFINITION`,
        `type MyType { id: Int }`,
        `type MyType { id: Int @id }`,
        `type MyType { id: Int @id(primitiveArg: "1") }`,
        `type MyType { id: Int @id(primitiveArg: "1", arrayArg: ["1"]) }`,
        `type MyType { id: Int @id(arrayArg: ["2"]) }`,
        `type Query { f1: MyType }`,
      ]);

      expect(stripWhitespaces(print(merged))).toBe(
        stripWhitespaces(`
          directive @id(primitiveArg: String, arrayArg: [String]) on FIELD_DEFINITION

          type MyType {
            id: Int @id(arrayArg: ["2", "1"], primitiveArg: "1")
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

    it('should fail if inputs of the same directive are different from each other', (done: jest.DoneCallback) => {
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

      expect(stripWhitespaces(print(merged))).toBe(
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

    it('should merge two GraphQLSchema with directives correctly', () => {
      const merged = mergeGraphQLSchemas([
        makeExecutableSchema({
          typeDefs: [
            `type Query { f1: MyType }`,
            `type MyType { f2: String }`,
          ],
        }),
        makeExecutableSchema({
          typeDefs: [
            `directive @id on FIELD_DEFINITION`,
            `type MyType2 { f2: String @id }`,
          ],
        }),
      ]);

      expect(print(merged)).toContain('f2: String @id');
    });

    it('should merge the same directives and its locations', () => {
      const merged = mergeGraphQLSchemas([
        `directive @id on FIELD_DEFINITION`,
        `directive @id on OBJECT`,
        `type MyType { id: Int @id }`,
        `type Query { f1: MyType }`,
      ]);

      expect(stripWhitespaces(print(merged))).toBe(
        stripWhitespaces(`
          directive @id on FIELD_DEFINITION | OBJECT

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

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        type Query {
          f1: String
        }

        schema {
          query: Query
        }`));
    });

    it('should handle compiled gql correctly', () => {
      const merged = mergeGraphQLSchemas([
        gql`
          type Query { f1: String }
        `,
      ]);

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        type Query {
          f1: String
        }

        schema {
          query: Query
        }`));
    });

    it('should handle compiled gql and strings correctly', () => {
      const merged = mergeGraphQLSchemas([
        gql`
          type Query { f1: String }
        `,
        'type Query { f2: String }',
      ]);

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
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

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        type Query {
          f1: String
          f2: String
        }

        schema {
          query: Query
        }`));
    });

    it('should merge GraphQL Schemas that have schema definition', () => {
      const merged = mergeGraphQLSchemas([
        makeExecutableSchema({
          typeDefs: [
            'type RootQuery { f1: String }',
          ],
          allowUndefinedInResolve: true,
        }),
        makeExecutableSchema({
          typeDefs: [
            'type RootQuery { f2: String }',
            'schema { query: RootQuery }',
          ],
          allowUndefinedInResolve: true,
        }),
      ]);

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        type RootQuery {
          f1: String
          f2: String
        }

        schema {
          query: RootQuery
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
        gql`
          type Query { f3: String }
        `,
      ]);

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
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

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
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

      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        type MyType { f1: String f2: String }
        `));
    });
    it('should handle extend types', () => {
      const merged = mergeGraphQLSchemas([`
        type Test {
          foo: String
        }
      `, `
        extend type Test {
          bar: String
        }
      `]);
      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        type Test {
          foo: String
          bar: String
        }
      `));
    });
    it('should handle extend types when GraphQLSchema is the source', () => {
      const schema = makeExecutableSchema({
        typeDefs: [`
          type Query {
            foo: String
          }

          type User {
            name: String
          }
        `, `
          extend type Query {
            bar: String
          }

          extend type User {
            id: ID
          }
        `],
      });
      const merged = mergeGraphQLSchemas([schema]);
      const printed = stripWhitespaces(print(merged));

      expect(printed).toContain(stripWhitespaces(`
        type Query {
          foo: String
          bar: String
        }
      `));
      expect(printed).toContain(stripWhitespaces(`
        type User {
          name: String
          id: ID
        }
      `));
    });

    it('should fail when a field is already defined and has a different type', () => {
      expect(() => {
        mergeGraphQLSchemas([`
          type Query {
            foo: String
          }
        `, `
          extend type Query {
            foo: Int
            bar: String
          }
        `]);
      }).toThrowError('Unable to merge GraphQL type');
    });

    it('should preserve an extend keyword if there is no base', () => {
      const merged = mergeGraphQLSchemas([`
        extend type Query {
          foo: String
        }
      `, `
        extend type Query {
          bar: String
        }
      `]);

      const printed = stripWhitespaces(print(merged));

      expect(printed).toContain(stripWhitespaces(`
        extend type Query {
          foo: String
          bar: String
        }
      `));
    });

    it('should handle extend inputs', () => {
      const merged = mergeGraphQLSchemas([`
        input TestInput {
          foo: String
        }
      `, `
        extend input TestInput {
          bar: String
        }
      `]);
      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        input TestInput {
          foo: String
          bar: String
        }
      `));
    });
    it('should extend extension types', () => {
      const merged = mergeGraphQLSchemas([`
        extend type Test {
          foo: String
        }
      `, `
        extend type Test {
          bar: String
        }
      `]);
      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        extend type Test {
          foo: String
          bar: String
        }
      `));
    });
    it('should extend extension input types', () => {
      const merged = mergeGraphQLSchemas([`
        extend input TestInput {
          foo: String
        }
      `, `
        extend input TestInput {
          bar: String
        }
      `]);
      expect(stripWhitespaces(print(merged))).toBe(stripWhitespaces(`
        extend input TestInput {
          foo: String
          bar: String
        }
      `));
    });
  });
});
