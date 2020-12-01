# graphql-modules

## 1.0.0
### Major Changes

- fe10299: Make ExecutionContext optional and stable
- fe10299: Support executor of ApolloServer
- fe10299: Global providers in Operation Scope
- fe10299: Refactor, simplify DI, better execution flow, simpler module declartion
- fe10299: Instantiate singleton providers on application bootstrap

### Minor Changes

- fe10299: Global tokens provided by modules

### Patch Changes

- fe10299: Fix issues with isTypeOf and resolveType
- fe10299: test canary
- fe10299: Fixed exception thrown when there are multiple type extenions
