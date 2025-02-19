---
'graphql-modules': major
---

**BREAKING** Providers of each module are now resolved of upon application creation.

This makes Dependency Injection less strict and not dependent on the order of module imports (hello circular imports).

**BREAKING** Removed `providers`, `operationProviders` and `singletonProviders` from the `Module` interface (unlikely you were using them).
