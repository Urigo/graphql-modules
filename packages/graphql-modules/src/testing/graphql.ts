import type { DocumentNode, ExecutionArgs, ExecutionResult } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { Application } from '../application/types';
import type { ValueOrPromise } from '../shared/types';

export function execute<
  TResult = { [key: string]: any },
  TVariables = { [key: string]: any }
>(
  app: Application,
  inputs: Omit<ExecutionArgs, 'schema'> & {
    document: DocumentNode | TypedDocumentNode<TResult, TVariables>;
    variableValues?: TVariables;
  }
): ValueOrPromise<ExecutionResult<TResult>> {
  const executor = app.createExecution();

  return executor({
    schema: app.schema,
    ...inputs,
  }) as ValueOrPromise<ExecutionResult<TResult>>;
}
