import 'reflect-metadata';
import { ReflectiveInjector, forwardRef } from '../src/di';

test('take params from a static parameters getter', () => {
  const spies = {
    http: jest.fn(),
    service: jest.fn(),
  };

  class Http {
    constructor() {
      spies.http();
    }
  }

  class Service {
    static get parameters() {
      return [Http];
    }

    constructor(http: any) {
      spies.service(http);
    }
  }

  const providers = ReflectiveInjector.resolve([Http, Service]);
  const injector = ReflectiveInjector.createFromResolved({
    name: 'root',
    providers,
  });

  expect(injector.get(Service)).toBeInstanceOf(Service);
  expect(spies.http).toHaveBeenCalledTimes(1);
  expect(spies.service).toHaveBeenCalledTimes(1);
});

test('support forwardRef in static parameters getter', () => {
  const spies = {
    http: jest.fn(),
    service: jest.fn(),
  };

  class Http {
    constructor() {
      spies.http();
    }
  }

  class Service {
    static get parameters() {
      return [forwardRef(() => Http)];
    }

    constructor(http: any) {
      spies.service(http);
    }
  }

  const providers = ReflectiveInjector.resolve([Http, Service]);
  const injector = ReflectiveInjector.createFromResolved({
    name: 'root',
    providers,
  });

  expect(injector.get(Service)).toBeInstanceOf(Service);
  expect(spies.http).toHaveBeenCalledTimes(1);
  expect(spies.service).toHaveBeenCalledTimes(1);
});
