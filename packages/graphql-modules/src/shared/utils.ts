export function flatten<T>(arr: T[]): T extends (infer A)[] ? A[] : T[] {
  return Array.prototype.concat(...arr) as any;
}

export function isDefined<T>(val: T | null | undefined): val is T {
  return !isNil(val);
}

export function isNil<T>(val: T | null | undefined): val is null | undefined {
  return val === null || typeof val === 'undefined';
}

export function isObject(val: any) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

export function isPrimitive(
  val: any
): val is number | string | boolean | symbol | bigint {
  return ['number', 'string', 'boolean', 'symbol', 'bigint'].includes(
    typeof val
  );
}

export function isAsyncIterable(obj: any): obj is AsyncIterableIterator<any> {
  return obj && typeof obj[Symbol.asyncIterator] === 'function';
}

export default function tapAsyncIterator<T>(
  iterable: AsyncIterable<T>,
  doneCallback: () => void
): AsyncGenerator<T> {
  const iteratorMethod = iterable[Symbol.asyncIterator];
  const iterator = iteratorMethod.call(iterable);

  function mapResult(result: IteratorResult<T, any>) {
    if (result.done) {
      doneCallback();
    }

    return result;
  }

  return {
    async next() {
      try {
        let result = await iterator.next();
        return mapResult(result);
      } catch (error) {
        doneCallback();
        throw error;
      }
    },
    async return() {
      try {
        const result = await iterator.return!();

        return mapResult(result);
      } catch (error) {
        doneCallback();
        throw error;
      }
    },
    async throw(error) {
      doneCallback();
      return iterator.throw!(error);
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}

export function once(cb: () => void) {
  let called = false;

  return () => {
    if (!called) {
      called = true;
      cb();
    }
  };
}
