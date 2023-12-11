import { mockApplication } from './test-application.js';
import { testModule, mockModule } from './test-module.js';
import { testInjector, readProviderOptions } from './test-injector.js';
import { execute } from './graphql.js';
import { provideEmpty } from './di.js';

export const testkit = {
  mockApplication,
  mockModule,
  testModule,
  testInjector,
  readProviderOptions,
  provideEmpty,
  execute,
};
