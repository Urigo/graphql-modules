import { mockApplication } from './test-application';
import { testModule, mockModule } from './test-module';
import { testInjector, readProviderOptions } from './test-injector';
import { execute } from './graphql';
import { provideEmpty } from './di';

export const testkit = {
  mockApplication,
  mockModule,
  testModule,
  testInjector,
  readProviderOptions,
  provideEmpty,
  execute,
};
