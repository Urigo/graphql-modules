---
id: introduction
title: Dependency Injection
sidebar_label: Introduction
---

One of the main goals of GraphQL Modules is to help you organize and better understand the GraphQL codebase. We believe that Dependency Injection fits here perfectly.

We learned not to force Dependency Injection too early in the process, because dependency injection makes sense only in some use cases when you application grows, and using it can be recommended only when your codebase is quite large and you need to move fast.

GraphQL Modules lets you choose whether to use dependency injection or not.

:::caution Usage Requirements

GraphQL Modules depend on **Reflect API** and specifically **design:paramtypes** for reflection and for defining dependencies between DI parts, please install and import `reflect-metadata` before every other module.

```typescript
import 'reflect-metadata';
/* code */

If you are using Babel, please be aware that the preset **@babel/preset-typescript** strips out all the metadata and breaks DI. To overcome this, please use the following plugin: https://www.npmjs.com/package/babel-plugin-transform-typescript-metadata  
```

## Introduction

We won't explain what Dependency Injection is, only how to use it withing the context of GraphQL-Modules. [You can find a quick tutorial about DI here](https://www.freecodecamp.org/news/a-quick-intro-to-dependency-injection-what-it-is-and-when-to-use-it-7578c84fa88f/).

There are few terms to understand:

- Injector
- Provider
- Token
- Scopes

Each term will have its explanation in following examples.

## Hierarchical Injectors

As you know the structure of GraphQL Modules is flat and so is the hierarchy of Dependency Injection.

**Every Module has its own isolated <u>space</u> and reuses a global <u>space</u> defined by Application.**

What does it mean?

Whatever is defined in a Module, is only accessible within that module. It doesn't leak to other modules or application. On the other hand, Module consumes things defined in Application.

Now replace "<u>space</u>" with Dependency Injection and Injector.

![Dependency Injection in GraphQL Modules](/img/docs/di.png)

**Injector** is responsible for registering and managing Services and Injection Tokens (and their values). Basically managing their own space. Every Module has its own Injector that has one parent which is Injector of the application.

If something (`Provider`, `InjectionToken`) is not available in Module Injector, it will look up the Application Injector.

## Providers and Tokens

The building blocks of DI are [Providers and InjectionToken](./providers).

A `InjectionToken` is an abstract way of declaring things you would like to live in your Injector space.

A `Provider` is a way to <u>provide</u> a specific `InjectionToken`.

They are covered in [next chapter](./providers).

## Scopes

Every `Provider` or `InjectionToken` is created once and the same instance is available for all incoming GraphQL Operations. That's the default behavior and it's under `Singleton` Scope.

In GraphQL Modules, we have two kinds of scope, `Singleton` and `Operation`.

`Operation` scope means that a service is created for each incoming GraphQL Operation and destroyed once request is resolved. Read more about [Scopes](./scopes.md) in a separate chapter.
