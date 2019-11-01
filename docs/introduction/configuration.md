---
id: configuration
title: Module Configuration
sidebar_label: Module Configuration
---

Each module can have its own configuration, and you can specify it in your `GraphQLModule`.

Start by creating a TypeScript interface that specifies the structure of your configuration object, and pass it as the first generic argument to your `GraphQLModule`:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { MyProvider } from './my-provider.ts';

export interface MyModuleConfig {
  secretKey: string;
  remoteEndpoint: string;
  someDbInstance: SomeDBInstance;
}

// You can access the config object like below inside the module declaration
export const MyModule = new GraphQLModule<MyModuleConfig>({
  providers: ({ config: { someDbInstance } }) => [
    MyProvider,
    {
      provide: SomeDbInstance,
      useValue: someDbInstance
    }
  ]
});
```

To provide the configuration values, add `.forRoot` to your module when you load it:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { MyModule } from './modules/my-module';

const AnotherModule = new GraphQLModule({
  imports: [
    MyModule.forRoot({
      secretKey: '123',
      remoteEndpoint: 'http://my-other-service.com'
    })
  ]
});
```

To get access to your configuration in your `Provider`s, inject `MyModuleConfig`:

```typescript
import { ModuleConfig } from '@graphql-modules/core';
import { Inject, Injectable } from '@graphql-modules/di';
import { MyModule } from './my-module.ts';

@Injectable()
export class MyProvider {
  constructor(@Inject(ModuleConfig) private config: MyModuleConfig) {
    ...
  }

  async fetchData() {
    return fetch({
      url: this.config.remoteEndpoint.
      body: {
        key: this.config.secretKey,
      }
    });
  }
}
```
