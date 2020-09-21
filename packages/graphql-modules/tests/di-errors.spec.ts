import 'reflect-metadata';
import { ReflectiveInjector, InjectionToken, Injectable } from '../src/di';

test('No Injectable error', () => {
  class NoAnnotations {
    // @ts-ignore
    constructor(dep: any) {}
  }
  expect(() => ReflectiveInjector.resolve([NoAnnotations])).toThrowError(
    `Missing @Injectable decorator for 'NoAnnotations'`
  );
});

test('No Annotation error', () => {
  @Injectable()
  class Data {}

  @Injectable()
  class NoAnnotations {
    // @ts-ignore
    constructor(data: Data, dep: any) {}
  }

  expect(() => ReflectiveInjector.resolve([NoAnnotations])).toThrowError(
    `Cannot resolve all parameters for 'NoAnnotations'(Data, ?). Make sure that all the parameters are decorated with Inject or have valid type annotations and that 'NoAnnotations' is decorated with Injectable.`
  );
});

test('Circular dependencies error', () => {
  const Foo = new InjectionToken<string>('Foo');
  const Bar = new InjectionToken<string>('Bar');

  const injector = ReflectiveInjector.createFromResolved({
    name: 'main',
    providers: ReflectiveInjector.resolve([
      {
        provide: Foo,
        useFactory(bar: string) {
          return `foo + ${bar}`;
        },
        deps: [Bar],
      },
      {
        provide: Bar,
        useFactory(foo: string) {
          return `bar + ${foo}`;
        },
        deps: [Foo],
      },
    ]),
  });

  expect(() => injector.get(Foo)).toThrowError(
    'Cannot instantiate cyclic dependency! (InjectionToken Foo -> InjectionToken Bar -> InjectionToken Foo)'
  );
});

test('No provider error', () => {
  const Foo = new InjectionToken<string>('Foo');

  const injector = ReflectiveInjector.createFromResolved({
    name: 'main',
    providers: [],
  });

  expect(() => injector.get(Foo)).toThrowError(
    'No provider for InjectionToken Foo'
  );
});

test('Instantiation error', () => {
  const Foo = new InjectionToken<string>('Foo');

  const injector = ReflectiveInjector.createFromResolved({
    name: 'main',
    providers: ReflectiveInjector.resolve([
      {
        provide: Foo,
        useFactory() {
          throw new Error('expected error');
        },
      },
    ]),
  });

  expect(() => injector.get(Foo)).toThrowError(
    'Error during instantiation of InjectionToken Foo: expected error - in main'
  );
});

test('Invalid provider error', () => {
  expect(() =>
    ReflectiveInjector.createFromResolved({
      name: 'main',
      providers: ReflectiveInjector.resolve([true as any]),
    })
  ).toThrowError(
    'Invalid provider - only instances of Provider and Type are allowed, got: true'
  );
});
