import 'reflect-metadata';
import { ObjectType, getNamedTypeFromClass, FieldProperty, FieldMethod, GRAPHQL_OBJECT_TYPE_CONFIG, ArgumentParameter } from '../src/build-schema-using-classes';
import { GraphQLString, printType, graphql, GraphQLSchema, GraphQLObjectType } from 'graphql';
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
  it('should build object type with scalar fields using FieldProperty decorator', async () => {
    @ObjectType()
    class Foo {
      @FieldProperty()
      bar: string;
    }
    expect(stripWhitespaces(printType(getNamedTypeFromClass(Foo)))).toBe(stripWhitespaces(`
      type Foo {
        bar: String
      }
    `));
  });
  it('should add resolvers to the fields using FieldProperty decorator', async () => {
    @ObjectType()
    class Query {
      @FieldProperty({
        resolve: () => 'BAR',
      })
      bar: string;
    }
    const result = await graphql(new GraphQLSchema({
      query: getNamedTypeFromClass(Query) as GraphQLObjectType,
    }), `{ bar }`);
    expect(result.errors).toBeFalsy();
    expect(result.data.bar).toBe('BAR');
  });
  it('should add resolver to the fields using FieldMethod decorator by passing correct root value', async () => {
    @ObjectType()
    class Bar {
      // entity fields passed into constructor
      constructor(private message: string) {}
      @FieldMethod()
      messageLength(): number {
        return this.getLength(this.message);
      }
      // sample helper method
      private getLength(str: string): number {
        return str.length;
      }
    }
    @ObjectType()
    class Query {
      @FieldMethod()
      bar(): Bar {
        return new Bar('BAR');
      }
    }
    const result = await graphql(new GraphQLSchema({
      query: getNamedTypeFromClass(Query) as GraphQLObjectType,
    }), `{ bar { messageLength } }`);
    expect(result.errors).toBeFalsy();
    expect(result.data.bar.messageLength).toBe(3);
  });
  it('should add resolver to the fields with the arguments using ArgumentParameter decorator', async () => {
    @ObjectType()
    class Bar {
      // entity fields passed into constructor
      constructor(private message: string) {}
      @FieldMethod()
      messageLength(@ArgumentParameter({ name: 'multiply' }) multiply: number): number {
        return this.getLength(this.message) * multiply;
      }
      // sample helper method
      private getLength(str: string): number {
        return str.length;
      }
    }
    @ObjectType()
    class Query {
      @FieldMethod()
      bar(): Bar {
        return new Bar('BAR');
      }
    }
    const result = await graphql(new GraphQLSchema({
      query: getNamedTypeFromClass(Query) as GraphQLObjectType,
    }), `{ bar { messageLength(multiply: 2) } }`);
    expect(result.errors).toBeFalsy();
    expect(result.data.bar.messageLength).toBe(6);
  });
});
