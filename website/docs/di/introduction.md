---
id: introduction
title: Dependency Injection
sidebar_label: Introduction
---

One of the main goals of GraphQL Modules is to help you organize and better understand the GraphQL codebase. We belive that Dependency Injection fits here perfectly.

We learned not to force Dependency Injection too early in the process, because dependency injection makes sense only in some use cases, and using it can be recommended only when your codebase is quite large and you need to move fast.

GraphQL Modules lets you choose whether to use dependency injection or not.

{@import ./reflect-note.md}

## Introduction

We won't explain what Dependency Injection is, only how to use it.

There are few terms to understand:

- Injector
- Service
- Token
- Scopes

Each term will have its explaination in following examples.

## Hierarchical Injectors

As you know the structure of GraphQL Modules is flat and so is the hierarchy of Dependency Injection.

**Every Module has its own isolated space and reuses a global space defined by Application.**

What does it mean?

Whatever is defined in a Module, is only accessible within that module. It doesn't leak to other modules or application. On the other hand, Module consumes things defined in Application.

Now replace "space" with Dependency Injection and Injector.

![Dependency Injection in GraphQL Modules](/img/docs/di.png)

**Injector** is responsible for registering and managing Services and Injection Tokens (and their values). Basically managing their own space. Every Module has its own Injector that has one parent which is Injector of the application.

If something (Service, Injection Token) is not available in Module Injector, it will look up the Application Injector.

## Providers and Tokens

The building blocks of DI are [Providers and Tokens](./providers). They are covered in next chapter.

## Scopes

Every Service or Injection Token is created once and the same instance is available for all incoming GraphQL Operations. That's the default behavior and it's under `Singleton` Scope.

In GraphQL Modules, we have two kinds of scope, `Singleton` and `Operation`.

`Operation` scope means that a service is created for each incoming GraphQL Operation and destroyed once request is resolved. Read more about [Scopes](./scopes.md) in a separate chapter.
