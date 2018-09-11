This module glue together parts of GraphQL schemas, based on their AST representation.

It makes it easier and simpler to merge GraphQL Types, enums, unions and interfaces.

```graphql
# a1.graphql
type A {
    f1: String
}

# a2.graphql
type A {
    f2: String
}
```

Will result:
```graphql
type A {
    f1: String
    f2: String
}
```
