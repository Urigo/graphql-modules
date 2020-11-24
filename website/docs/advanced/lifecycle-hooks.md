---
id: lifecycle-hooks
title: Lifecycle hooks
---

There are two life cycle hooks in GraphQL Modules, one represents an incoming request and the other is called when the execution is done. Hooks are only available in Operation scoped Injector.

Every Operation scoped service is created for each incoing GraphQL operation, which means you can use the constructor as the initial hook.

After Operation is resolved and the context about to be destroyed, GraphQL Modules call the `onDestroy` method on all operation-scoped services.

```typescript
import { Injectable, Scope, OnDestroy } from 'graphql-modules';

@Injectable({
  scope: Scope.Operation,
})
export class Data implements OnDestroy {
  constructor() {
    // incoming operation, here you can do your setup and preparation
  }

  onDestroy() {
    // Operation is resolved
    // Execution context is about to be disposed
  }
}
```
