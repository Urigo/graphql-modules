import type { DocumentNode, ExecutionArgs, ExecutionResult } from 'graphql';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { Application, OperationController } from '../application/types';
import type { ValueOrPromise } from '../shared/types';

export function execute<
  TResult = { [key: string]: any },
  TVariables = { [key: string]: any },
>(
  app: Application,
  inputs: Omit<ExecutionArgs, 'schema'> & {
    document: DocumentNode | TypedDocumentNode<TResult, TVariables>;
    variableValues?: TVariables;
  },
  options?: {
    controller?: OperationController;
  }
): ValueOrPromise<ExecutionResult<TResult>> {
  const executor = app.createExecution(options);

  return executor({
    schema: app.schema,
    ...inputs,
  }) as ValueOrPromise<ExecutionResult<TResult>>;
}
