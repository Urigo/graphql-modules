import 'reflect-metadata';
import { ObjectType, FieldType, GRAPHQL_NAMED_TYPE, getNamedTypeFromClass, getObjectTypeConfigFromClass } from '../src/build-schema-using-classes';
import { GraphQLString, printType } from 'graphql';
function stripWhitespaces(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

describe('Build Schema using Classes', async () => {
  it('should build object type using ObjectType decorator', async () => {
    @ObjectType()
    class Foo {}
    expect(stripWhitespaces(printType(getNamedTypeFromClass(Foo)))).toBe(stripWhitespaces(`
      type Foo {

      }
    `));
  });
  it('should build object type with scalar fields using FieldType decorator', async () => {
    @ObjectType()
    class Foo {
      @FieldType(GraphQLString)
      bar: string;
    }
    expect(stripWhitespaces(printType(getNamedTypeFromClass(Foo)))).toBe(stripWhitespaces(`
      type Foo {
        bar: String
      }
    `));
  });
});
