---
id: development-environment
title: Development Environment
sidebar_label: Development Environment
---

## TypeScript

GraphQL Modules always supports the latest TypeScript version. Lower versions are not supported!

### TS-Node **_(recommended way)_**

To set up your development environment easily, we recommend to use [TypeScript](http://www.typescriptlang.org/).

> You don't have to use TypeScript, but it makes it much easier to use GraphQL Modules.

To get started with your development environment, install the following tools in your project:

```bash
yarn add -D ts-node typescript nodemon
```

Next, create/update `tsconfig.json` in your root directory:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "module": "commonjs",
    "target": "es6",
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

> These configurations facilitate development, but of course you can modify them as you wish. Keep particularly in mind to keep `experimentalDecorators: true` because that's important for GraphQL Modules.

Next, add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/main.ts",
    "debug": "nodemon --exec node -r ts-node/register --inspect src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

- `dev` starts your server in the development mode.
- `debug` starts the server in the debug mode.
- `build` uses the `tsc` compiler to compile your code to JavaScript.
- `start` runs the compiled server using pure Node.

#### `paths`

TypeScript has an **[aliasing mechanism](https://www.typescriptlang.org/docs/handbook/module-resolution.html)** for working with modules directories.

To set it up quickly with GraphQL Modules, first add the following package to your server:

```bash
yarn add tsconfig-paths
```

Then update your scripts to load the **[require extension](https://gist.github.com/jamestalmage/df922691475cff66c7e6)** for TypeScript `paths`:

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

And you can add custom mapping to your `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@modules/*": ["./modules/*"]
    }
  }
}
```

You can now import files between modules like below:

```typescript
import { SomeProvider } from '@modules/my-module';
```

#### Import from `.graphql` files

You can also treat `.graphql` files as text files and import from them easily.
It's useful because many IDEs detect `.graphql` files and do syntax highlighting for them.

You can use **[graphql-import-node](https://github.com/ardatan/graphql-import-node)** to enable NodeJS to import `.graphql` files:

```bash
yarn add graphql-import-node
```

```typescript
import 'graphql-import-node'; // You should add this at the begininng of your entry file.
import * as UserTypeDefs from './user.graphql';
```

### Webpack

If you are using Webpack, we recommend to use **[ts-loader](https://github.com/TypeStrong/ts-loader)** or **[awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader)** to load your TypeScript files.

To load `.graphql` files, you can use **[graphql-tag/loader](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader)**.

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
    // Add `.ts` and `.tsx` as a resolvable extension
    extensions: ['.ts', '.tsx', '.js', '.graphql'],
    plugins: [new TsconfigPathsPlugin()]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' },
      { test: /\.(graphql|gql)$/, exclude: /node_modules/, loader: 'graphql-tag/loader' }
    ]
  }
};
```

### TypeScript-Babel-Starter

You can use Babel for TypeScript with GraphQL Modules by using [TypeScript-Babel-Starter](https://github.com/Microsoft/TypeScript-Babel-Starter).

Still, if you use dependency injection, you have to decorate each property and argument in the providers manually even for the classes like below;

```typescript
import { Injectable, Inject } from '@graphql-modules/di';
@Injectable()
export class SomeProvider {
  constructor(@Inject(OtherProvider) private otherProvider: OtherProvider) {}
}
```

## JavaScript Usage

If you are using JavaScript (not TypeScript) in your project, you can either **[add support for TypeScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)** or use GraphQL Modules with the JavaScript API.

### With Babel

If you are using [Babel](http://babeljs.io) to transpile your JavaScript files, you can use **[babel-plugin-transform-decorators](http://babeljs.io/docs/en/babel-plugin-transform-decorators)** to get decorators support, which enables using decorators such as `@Inject` in a regular way.

### Without decorators

#### Dependency Injection

You can use `Inject` and `Injectable` as regular functions to wrap your arguments and classes from `tslib`.

Take care to add the polyfill `reflect-metadata` and require it (once).

```js
require('reflect-metadata');
Inject(AProvider)(MyProvider, undefined, 0); // inject AProvider to the first MyProvider constructor argument
Inject(ModuleConfig)(MyProvider, undefined, 0); // inject SimpleModule Config to the second MyProvider constructor argument
module.exports = Injectable({...})(MyProvider);
```

## Testing Environment

We recommend Jest as your test runner: it has a simple API, it's super fast and you can integrate it with any CI tools.

### Jest

To test your GraphQL Modules server with Jest, first add support for TypeScript to your Jest instance:

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
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"]
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

You can use any other test runner you prefer.
Just figure out how to use it with TypeScript and make sure you can import CommonJS easily.
