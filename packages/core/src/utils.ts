export const asArray = <T>(fns: T | T[]) => (Array.isArray(fns) ? fns : [fns]);

export function chainFunctions(funcs: any[]) {
  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args: any[]) => a(b(...args)));
}
