import { ValueProvider } from './../di/providers';

export function provideEmpty<T = any>(
  token: ValueProvider<T>['provide']
): ValueProvider<T> {
  return {
    provide: token,
    useValue: {} as any,
  };
}
