---
id: dependency-injection
title: Dependency Injection
sidebar_label: Dependency Injection
---

GraphQL Modules let you use dependency injection between your modules, and let you inject config, functions, classes and instances to your modules.

We are wrapping **[InversifyJS](http://inversify.io/)** and expose a simple API that covers most of the use-cases of relations between backend modules.

We learned not to force you to use dependency injection too early in the process, because dependency injection make sense on some specific use cases and you should need to use it only when it helps you move faster and as your codebase grows.

GraphQL Modules let you choose whether to use dependency injection or not.

### Providers


