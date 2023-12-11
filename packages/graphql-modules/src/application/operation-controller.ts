import type { Application } from './types.js';
import type { ExecutionContextBuilder } from './context.js';

export function operationControllerCreator(options: {
  contextBuilder: ExecutionContextBuilder<GraphQLModules.GlobalContext>;
}): Application['createOperationController'] {
  const { contextBuilder } = options;

  return (input) => {
    const operation = contextBuilder(input.context);
    const ɵdestroy = input.autoDestroy ? operation.ɵdestroy : () => {};

    return {
      context: operation.context,
      injector: operation.ɵinjector,
      destroy: operation.ɵdestroy,
      ɵdestroy,
    };
  };
}
