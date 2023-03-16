# graphql-modules

## 2.1.1

### Patch Changes

- [#2233](https://github.com/Urigo/graphql-modules/pull/2233) [`1d6b7fb7`](https://github.com/Urigo/graphql-modules/commit/1d6b7fb7a7c9021f4a052825a0951ab948ef684f) Thanks [@renovate](https://github.com/apps/renovate)! - dependencies updates:

  - Updated dependency [`@graphql-tools/schema@^9.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/schema/v/^9.0.0) (was `^8.3.1`, in `dependencies`)
  - Updated dependency [`@graphql-tools/wrap@^9.0.0` ↗︎](https://www.npmjs.com/package/@graphql-tools/wrap/v/^9.0.0) (was `^8.3.1`, in `dependencies`)

- [#2324](https://github.com/Urigo/graphql-modules/pull/2324) [`42599bfe`](https://github.com/Urigo/graphql-modules/commit/42599bfe2d5c19151f840d3fa05ed6fa00a5c487) Thanks [@patrickjm](https://github.com/patrickjm)! - Fix missing attributes in package.json (as preparation for TS 5.0)

## 2.1.0

### Minor Changes

- c0a3d556: Allow to overwrite providers when using testkit.testModule

### Patch Changes

- 9e5ec3ae: Add a deprecation note for createSchemaForApollo method
- 285987c6: Fix a memory leak related to ExecutionContext and Promises

## 2.0.0

### Major Changes

- d0a662d4: Update graphql-tools/schema & graphql-tools/wrap to major v8

  Check [graphql-tools/schema v8.0.0 release](https://github.com/ardatan/graphql-tools/releases/tag/%40graphql-tools%2Fschema%408.0.0) for possible breaking changes

### Minor Changes

- 75552e67: feat: GraphQL v16 support
- c084f1e4: ESM support

## 1.4.4

### Patch Changes

- 9ec7fa0c: Fix the failure of missing session when multi-mutation operation

## 1.4.3

### Patch Changes

- e206539c: Use correct \_\_resolveObject signature
- 648d81fe: Adds a validation of typeDefs to be DocumentNodes

## 1.4.2

### Patch Changes

- f8e6e15: Fix missing ApolloServer cacheControl in GraphQLResolveInfo

## 1.4.1

### Patch Changes

- fefca5d: Fix race condition between Inject and Injectable

## 1.4.0

### Minor Changes

- 499c81a: Support \_\_resolveObject
- 499c81a: Manual control of GraphQL operation

## 1.3.0

### Minor Changes

- f138e08: Support \_\_resolverReference resolver for federation

## 1.2.1

### Patch Changes

- 9a59787: Allow inheritance of resolvers defined in interfaces

## 1.2.0

### Minor Changes

- f38ff90: Introduce testkit.mockApplication
- f38ff90: Custom GraphQLSchema builder
- f38ff90: Introduce testkit.mockModule

## 1.1.0

### Minor Changes

- 8db9f91: Testing utilities

## 1.0.0

Complete rewrite of GraphQL Modules based on lessons learned from using and maintaining v0 releases.
The ["Introduction to GraphQL Modules"](https://graphql-modules.com/docs) page will help you understand the new version.

For migration guide, please check ["Migration from v0.X"](https://graphql-modules.com/docs/recipes/migration) chapter in docs.
