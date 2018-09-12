---
id: development-environment
title: Development Environment
sidebar_label: Development Environment
---

## TypeScript

### Basic Configuration

To setup your development environment easily, we recommend to use [TypeScript](http://www.typescriptlang.org/).

> You don't have to use TypeScript, but it makes it much easier to use GraphQL Modules.

To get started to with your development environment, install the following tools in your project:

```bash
yarn add -D ts-node typescript nodemon
```

Next, create (or update, if you already have one) `tsconfig.json` in your root directory:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "module": "commonjs",
    "target": "es5",
    "lib": ["es6", "esnext", "es2015"],
    "noImplicitAny": false,
    "suppressImplicitAnyIndexErrors": true,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "sourceMap": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "files": ["src/index.ts"],
  "exclude": ["node_modules"]
}
```

> These configurations will make it easier to use, but note that your can modify it as you wish. Just keep in mind to keep `experimentalDecorators: true` because that's important for GraphQL Modules.

Next, add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/main.ts",
    "debug": "nodemon --exec ts-node --inspect --debug-brk src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

- `dev` will start your server in development mode.
- `debug` will start it in debug mode ([read more about it here](https://nodejs.org/en/docs/guides/debugging-getting-started/)).
- `build` will use `tsc` compiler to compile your code to JavaScript.
- `start` will run the compiled server using pure Node.

### `paths`

TypeScript has an [aliasing mechanism](https://www.typescriptlang.org/docs/handbook/module-resolution.html) that can make it easier to work with modules directories.

To setup it quickly with GraphQL Modules, add the following module to your server:

```bash
yarn add tsconfig-paths
```

Then, update your scripts to load the [require extension](https://gist.github.com/jamestalmage/df922691475cff66c7e6) for TypeScript `paths`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node -r tsconfig-paths/register src/main.ts",
    "debug": "nodemon --exec ts-node -r tsconfig-paths/register --inspect --debug-brk src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

Then, you can add custom mapping to your `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "paths": {
      "@modules/*": ["./modules/*"]
    }
  },
}
```

This way, you can now import files between modules like that:

```typescript
import { SomeProvider } from '@modules/my-module';
```

### Import from `.graphql` files

You can also treat `.graphql` files as text files and import from them easily. It's useful because most IDEs detects `.graphql` files and have syntax highlighting for it.

To add support for this kind of imports in TypeScript, create a file called `src/typings.d.ts` in your project, with the following content:

```typescript
declare module '*.graphql' {
    import {DocumentNode} from 'graphql';

    const value: DocumentNode;
    export = value;
}
```

Now you should be able to import `.graphql` files this way:

```typescript
import * as UserType from './user.graphql';
```

## Webpack

## JavaScript Usage

## Testing Environment

### Jest

### Jest with TypeScript

### Other Test Runners

