---
id: configuration
title: Module Configuration
sidebar_label: Module Configuration
---

Each module can have it's own configuration, and you can specify it in your `GraphQLModule`.

Start by creating a TypeScript interface which specifies the structure of your configuration object, and pass it as the first generic argument to your `GraphQLModule`:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { MyProvider } from './my-provider.ts';

export interface MyModuleConfig {
    secretKey: string;
    remoteEndpoint: string;
}

export const MyModule = new GraphQLModule<MyModuleConfig>({
  providers: () => [
    MyProvider
  ]
});
```

Now, to provide the configuration values, add `.forRoot` to your module while loading it:

```typescript
import { GraphQLModule } from '@graphql-modules/core';
import { MyModule } from './modules/my-module';

const AnotherModule = new GraphQLModule({
  imports: [
    MyModule.forRoot({
          secretKey: '123',
          remoteEndpoint: 'http://my-other-service.com',
      })
  ]
});
```

To get access to your configuration in your `Provider`s, inject `MyModuleConfig` and pass your module's name as `string`:

```typescript
import { ModuleConfig, Inject, Injectable } from '@graphql-modules/core';
import { MyModule } from './my-module.ts';

@Injectable()
export class MyProvider {
    constructor(@Inject(ModuleConfig(MyModule)) private config: MyModuleConfig) {

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
