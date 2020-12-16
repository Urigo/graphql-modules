import type { ExecutionArgs, ExecutionResult } from 'graphql';
import type { Application } from '../application/types';
import type { ValueOrPromise } from '../shared/types';

export function execute<T = { [key: string]: any }>(
  app: Application,
  inputs: Omit<ExecutionArgs, 'schema'>
): ValueOrPromise<ExecutionResult<T>> {
  const executor = app.createExecution();

  return executor({
    schema: app.schema,
    ...inputs,
  }) as ValueOrPromise<ExecutionResult<T>>;
}
