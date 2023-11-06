import {
  Application,
  ApplicationConfig,
  MockedApplication,
} from '../application/types';
import { Provider } from '../di';
import { MockedModule } from '../module/types';
import { share } from '../shared/utils';

export function mockApplication(app: Application): MockedApplication {
  function mockedFactory(newConfig?: ApplicationConfig): MockedApplication {
    const sharedFactory = share(() => app.ɵfactory(newConfig));

    return {
      get typeDefs() {
        return sharedFactory().typeDefs;
      },
      get resolvers() {
        return sharedFactory().resolvers;
      },
      get schema() {
        return sharedFactory().schema;
      },
      get injector() {
        return sharedFactory().injector;
      },
      createOperationController(options) {
        return sharedFactory().createOperationController(options);
      },
      createSubscription(options) {
        return sharedFactory().createSubscription(options);
      },
      createExecution(options) {
        return sharedFactory().createExecution(options);
      },
      createApolloGateway() {
        return sharedFactory().createApolloGateway();
      },
      get ɵfactory() {
        return sharedFactory().ɵfactory;
      },
      get ɵconfig() {
        return sharedFactory().ɵconfig;
      },
      replaceModule(newModule: MockedModule) {
        const config = sharedFactory().ɵconfig;

        return mockedFactory({
          ...config,
          modules: config.modules.map((mod) =>
            mod.id === newModule.ɵoriginalModule.id ? newModule : mod
          ),
        });
      },
      addProviders(newProviders: Provider[]) {
        const config = sharedFactory().ɵconfig;
        const existingProviders =
          typeof config.providers === 'function'
            ? config.providers()
            : config.providers;
        const providers = Array.isArray(existingProviders)
          ? existingProviders.concat(newProviders)
          : newProviders;

        return mockedFactory({
          ...config,
          providers,
        });
      },
    };
  }
  return mockedFactory();
}
