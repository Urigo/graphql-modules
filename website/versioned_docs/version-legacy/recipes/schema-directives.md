---
id: schema-directives
title: Schema Directives
sidebar_label: Schema Directives
---

GraphQL Modules allows you to define schema directives on a per-module basis. For example, we can add a schema directive to our module like this:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { SchemaDirectiveVisitor } from 'graphql-tools';

const typeDefs = gql`
  directive @date on FIELD_DEFINITION

  scalar Date

  type Query {
    today: Date @date
  }
`;
const resolvers = {
  Query: {
    today: () => new Date();
  },
};

class FormattableDateDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;

    field.args.push({
      name: 'format',
      type: GraphQLString,
    });

    field.resolve = async function (source, args, context, info) {
      const date = await resolve.call(this, source, args, context, info);
      return date.toLocaleDateString();
    };

    field.type = GraphQLString;
  }
}

const schemaDirectives = {
  date: FormattableDateDirective
};

const { schema } = new GraphQLModule({
  typeDefs,
  resolvers,
  schemaDirectives,
});
```

GraphQL Modules won't automatically apply your directives when it generates a schema for a module to avoid applying the same directive more than once. However, you can set the `visitSchemaDirectives` option to `true` in your root module and the directives from all your combined modules will be applied to your final schema.

```typescript
const { schema } = new GraphQLModule({
  typeDefs,
  resolvers,
  schemaDirectives,
  visitSchemaDirectives: true,
});
```
