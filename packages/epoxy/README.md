# graphql-epoxy

![graphql-epoxy](https://cf1.s3.souqcdn.com/item/2016/08/10/11/36/38/23/item_XL_11363823_15851869.jpg)

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
