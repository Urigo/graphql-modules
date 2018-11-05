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

If you are using Webpack, we recommend to use [ts-loader](https://github.com/TypeStrong/ts-loader) or [awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader) to load your TypeScript files.

To load `.graphql` files, you can use [graphql-tag/loader](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader).

Here is a simple `webpack.config.js` that should do the job:

```js
module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/index.ts',
  output: {
    filename: 'dist/server.js'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js', '.graphql'],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.(graphql|gql)$/, exclude: /node_modules/, loader: 'graphql-tag/loader' },
    ],
  },
};
```

## JavaScript Usage

If you are using JavaScript in your project and not TypeScript, you can either [add support for TypeScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html), or use GraphQL Modules with it's JavaScript API.

### With Babel

If you are using [Babel](http://babeljs.io) to transpile your JavaScript files, you can use [babel-plugin-transform-decorators](http://babeljs.io/docs/en/babel-plugin-transform-decorators) to get decorators support, and then you can use decorators such as `@Inject` in a regular way.

### Without decorators

You can use `Inject` and `Injectable` as regular functions to wrap your arguments and classes.

## Testing Environment

We recommend Jest as your test runner - it has simple API, it's super fast and you can integrate with any CI tools.

### Jest

To test your GraphQL Modules server with Jest, start by adding support for TypeScript to your Jest instance, by adding:

```bash
yarn add -D jest @types/jest ts-jest
```

Then, add the following section to your `package.json`:

```json
{
  "jest": {
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    "moduleFileExtensions": [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json",
      "node"
    ]
  }
}
```

And add a script to your `package.json`:

```json
{
    "scripts": {
        "test": "jest"
    }
}
```

Also, make sure that each one of your spec files starts with:

```typescript
import 'reflect-metadata';
```

### Other Test Runners

You can use any other test runner you prefer, just figure out how to use it with TypeScript and make sure you can import CommonJS easily.
