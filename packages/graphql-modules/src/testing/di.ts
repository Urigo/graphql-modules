import { ValueProvider } from './../di/providers.js';

export function provideEmpty<T = any>(
  token: ValueProvider<T>['provide']
): ValueProvider<T> {
  return {
    provide: token,
    useValue: {} as any,
  };
}
