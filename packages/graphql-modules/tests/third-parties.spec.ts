import 'reflect-metadata';
import { createApplication, createModule } from '../src';
import { GraphQLField, parse } from 'graphql';
import { SchemaDirectiveVisitor } from '@graphql-tools/utils';

describe('schema directives', () => {
  test('schema directives used on top of produced schema', async () => {
    const id = '12';
    const directives = createModule({
      id: 'directives',
      // We may want to allow for directive and root type definitions on Application level
      // createApplication({ typeDefs: /* ... */ })
      // WDYT?
      typeDefs: parse(/* GraphQL */ `
        directive @isAuthenticated on FIELD_DEFINITION
      `),
    });
    const mod = createModule({
      id: 'test',
      typeDefs: parse(/* GraphQL */ `
        type Query {
          idOfCurrentlyLoggedInUser: String @isAuthenticated
        }
      `),
      resolvers: {
        Query: {
          idOfCurrentlyLoggedInUser: () => {
            return id;
          },
        },
      },
    });

    const app = createApplication({
      modules: [directives, mod],
    });

    SchemaDirectiveVisitor.visitSchemaDirectives(app.schema, {
      isAuthenticated: class extends SchemaDirectiveVisitor {
        public visitFieldDefinition(field: GraphQLField<any, any>) {
          const orgResolver = field.resolve;

          if (orgResolver) {
            field.resolve = (
              source: {},
              args: {},
              context: { loggedIn?: boolean },
              info
            ) => {
              if (context.loggedIn) {
                return orgResolver!(source, args, context, info);
              }

              throw new Error('NOT LOGGED IN');
            };
          }
        }
      },
    });

    const executeFn = app.createExecution();

    const authResult = await executeFn({
      schema: app.schema,
      document: parse(/* GraphQL */ `
        query test {
          idOfCurrentlyLoggedInUser
        }
      `),
      variableValues: {},
      contextValue: {
        loggedIn: true,
      },
    });

    expect(authResult.errors).toBeUndefined();
    expect(authResult.data).toEqual({
      idOfCurrentlyLoggedInUser: id,
    });

    const noAuthResult = await executeFn({
      schema: app.schema,
      document: parse(/* GraphQL */ `
        query test {
          idOfCurrentlyLoggedInUser
        }
      `),
      contextValue: {
        loggedIn: false,
      },
      variableValues: {},
    });

    expect(noAuthResult.errors).toBeDefined();
    expect(noAuthResult.data).toEqual({
      idOfCurrentlyLoggedInUser: null,
    });
  });
});
