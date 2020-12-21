import { testModule } from './test-module';
import { testInjector, readProviderOptions } from './test-injector';
import { execute } from './graphql';
import { provideEmpty } from './di';

export const testkit = {
  testModule,
  testInjector,
  readProviderOptions,
  provideEmpty,
  execute,
};
