---
id: configuration
title: Module Configuration
sidebar_label: Module Configuration
---

Each module can have it's own configuration, and you can specify it with using the module in your `GraphQLApp`.

Start by creating a TypeScript interface the specifies the structure of your configuration object, and pass it as the first generic argument to your `GraphQLModule`:

```typescript
export interface MyModuleConfig {
    secretKey: string;
    remoteEndpoint: string;
}

export const myModule = new GraphQLModule<MyModuleConfig>({
    name: 'my-module',
});
```

Now, to provide the configuration values, add `.withConfig` to your module while loading it into your `GraphQLApp`:

```typescript
import { GraphQLApp } from '@graphql-modules/core';
import { myModule } from './modules/my-module';

const graphQlApp = new GraphQLApp({
    modules: [
        myModule.withConfig({
            secretKey: '123',
            remoteEndpoint: 'http://my-other-service.com',
        }),
    ],
});
```

To get access to your configuration in your `Provider`s, inject `ModuleConfig` and pass your module's name as `string`:

```typescript
import { injectable, ModuleConfig, inject } from '@graphql-modules/core';

@injectable()
export class MyProvider {
    constructor(@inject(ModuleConfig('my-module')) private config: MyModuleConfig) {

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
