---
id: scalars-directives
title: Scalars and directives
---

GraphQL Modules allows you to define schema directives. GraphQL Modules will apply your directives from all your combined modules to your final schema.

## Scalar Date example

```typescript
import { createModule, gql } from 'graphql-modules';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { loadFilesSync } from '@graphql-tools/load-files';
// 3rd party scalars
import { DateResolver, DateTypeDefinition } from 'graphql-scalars';
// own scalars
import { ImageUrlType } from './scalars/image-url';
import { PageSizeType } from './scalars/page-size';

const typeDefsArray = loadFilesSync(`${__dirname}/schema/*.graphql`, {
    useRequire: true,
});

const typeDefs = mergeTypeDefs([...typeDefsArray, DateTypeDefinition], { useSchemaDefinition: false });

const resolverFunctions = {
    ImageUrl: ImageUrlType,
    PageSize: PageSizeType,
    Date: DateResolver,
};

export const CommonModule = createModule({
    id: 'common',
    typeDefs: typeDefs,
    resolvers: resolverFunctions,
});
```

_Please note that when utilizing the [graphql code generator](https://www.graphql-code-generator.com/) in your setup you can better not add 'DateTypeDefinition', but instead add the schema in the schema folder, for example file 'date.graphql' with content below. It makes your configuration easier._

```typescript
scalar Date
```


## Directives

We can add directives to the server (this example uses the Apollo server) by adding the SchemaDirectiveVisitor. 

```typescript
import { ApolloServer, SchemaDirectiveVisitor } from 'apollo-server-express';
// AppModule is the created Application with GraphQL Modules
const schema = AppModule.createSchemaForApollo();
// Now add any directive you would like
SchemaDirectiveVisitor.visitSchemaDirectives(schema, {
    isMember: IsMemberDirective,
    deprecated: isDeprecated,
    ...
});
...
const server = new ApolloServer({
    schema,
    ...
});
```

In this case the 'isMember' directive can be like:

```typescript
import { GraphQLResolveInfo, defaultFieldResolver } from 'graphql';
import {
    SchemaDirectiveVisitor,
    AuthenticationError,
} from 'apollo-server-express';

export class IsMemberDirective extends SchemaDirectiveVisitor {
  ...SNIP...
}
```

While its .graphql schema file is added (see scalars setup above), like

```typescript
directive @isMember(
    """
    How to proceed error handling
    1. 'true' Throw an error when not having member id
    2. 'false' Simply return null (default)
    """
    error: Boolean = false
) on FIELD_DEFINITION | OBJECT
```
