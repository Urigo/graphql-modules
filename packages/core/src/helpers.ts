export const asArray = <T>(fns: T | T[]) => (Array.isArray(fns) ? fns : [fns]);
