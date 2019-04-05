---
id: test-your-module
title: Test Your Module
sidebar_label: Test Your Module
---

With GraphQL Modules and dependency injection it's much easier to test your modules.

> Make sure to follow our recommend **[development environment configuration](/docs/recipes/development-environment)** to get started with test environment (we recommend **[Jest](https://jestjs.io/)**).

So let's start with a basic module definition:

`modules/user/user.module.ts`
```typescript
import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';

export class UsersProvider {
  getUserById(id: string){
    // some business logic
  }
}

export const UserModule = new GraphQLModule({
  providers: [UsersProvider],
  typeDefs: gql`
    type User {
      id: String
      username: String
    }
    
    type Query {
      userById(id: String!): User
    }
  `,
  resolvers: {
    User: {
      id: user => user._id,
      username: user => user.username,
    },
    Query: {
      userById: (root, { id }, injector) =>
        injector.get(UsersProvider).getUserById(id),
    },
  },
});
```

You can mock providers by overwriting the existing provider definitions;

tests/user.module.spec.ts
```typescript
  import { UserModule } from '../modules/user/user.module';
  import { execute } from 'graphql';
  describe('UserModule', () => {
    it('FieldResolver of Query: userById', async () => {
      const { schema, injector } = UserModule;

      injector.provide({
        provide: UserProvider,
        overwrite: true,
        useValue: {
          userById: (id: string) => ({ id, username: 'USERNAME' })
        }
      });

      const result = await execute({
        schema,
        document: gql`
          query {
            userById(id: "ANOTHERID") {
              id
              username
            }
          }
        `,
      });
      expect(result.errors).toBeFalsy();
      expect(result.data['userById']['id']).toBe('ANOTHERID');
      expect(result.data['userById']['username']).toBe('USERNAME');
    });
  });
```

Then, run `jest` to get your test results.
