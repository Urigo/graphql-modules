---
id: test-your-module
title: Test Your Module
sidebar_label: Test Your Module
---

With GraphQL Modules and dependency injection it's much easier to test your modules.

> Make sure to follow our recommended **[development environment configurations](/docs/recipes/development-environment)** to get started with the test environment (we also recommend **[Jest](https://jestjs.io/)**).

So let's start with a basic module definition:

`modules/user/user.module.ts`

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import gql from 'graphql-tag';

export class UsersProvider {
  getUserById(id: string) {
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
      username: user => user.username
    },
    Query: {
      userById: (root, { id }, injector) => injector.get(UsersProvider).getUserById(id)
    }
  }
});
```

You can mock providers by overwriting the existing provider definitions:

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
      `
    });
    expect(result.errors).toBeFalsy();
    expect(result.data['userById']['id']).toBe('ANOTHERID');
    expect(result.data['userById']['username']).toBe('USERNAME');
  });
});
```

If you don't use DI, you can mock your context or resolvers like below:

```ts
UsersModule.mock({
  resolvers: {
    Query: {
      foo: (_, __, { fooProp }) => fooProp
    }
  },
  contextBuilder: () => ({
    fooProp: 'FOO'
  })
});
```

For authentication (a common use case for mocking the context), if `UsersModule` imports `AuthModule` and you want to mock the logged in user during tests to have an admin role, you can do this in `beforeAll`:

```ts
AuthModule.mock({
  contextBuilder: () => ({
    user: {
      roles: ['admin'],
    },
  }),
});
```

In `afterAll`, or when you're done with the mock, run `AuthModule.resetMock()`.
