---
id: configuration
title: Module Configuration
sidebar_label: Module Configuration
---

Each module can have it's own configuration, and you can specify it in your `GraphQLModule`.

Start by creating a TypeScript interface which specifies the structure of your configuration object, and pass it as the first generic argument to your `GraphQLModule`:

```typescript

export interface MyModuleConfig {
    secretKey: string;
    remoteEndpoint: string;
}

export const myModule = new GraphQLModule<MyModuleConfig>({
    name: 'my-module',
});
```

Now, to provide the configuration values, add `.forRoot` to your module while loading it:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { myModule } from './modules/my-module';

const anotherModule = new GraphQLModule({
  name: 'another-module',
  imports: [
    myModule.forRoot({
          secretKey: '123',
          remoteEndpoint: 'http://my-other-service.com',
      })
  ]
});
```

To get access to your configuration in your `Provider`s, inject `MyModuleConfig` and pass your module's name as `string`:

```typescript
import { ModuleConfig, Inject } from '@graphql-modules/core';

export class MyProvider {
    constructor(@Inject(ModuleConfig('my-module'))private config: MyModuleConfig) {

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
