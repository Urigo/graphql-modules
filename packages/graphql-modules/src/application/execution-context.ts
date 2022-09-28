export interface ExecutionContextConfig {
  executionAsyncId: () => number;
  createHook(config: {
    init(asyncId: number, _: string, triggerAsyncId: number): void;
    destroy(asyncId: number): void;
  }): void;
}

export interface ExecutionContextPicker {
  getModuleContext(moduleId: string): GraphQLModules.ModuleContext;
  getApplicationContext(): GraphQLModules.AppContext;
}

const executionContextStore = new Map<number, ExecutionContextPicker>();
const executionContextDependencyStore = new Map<number, Set<number>>();

let executionContextHook = null;
let executionAsyncId: () => number = () => 0;

function destroyContextAndItsChildren(id: number) {
  if (executionContextStore.has(id)) {
    executionContextStore.delete(id);
  }

  const deps = executionContextDependencyStore.get(id);

  if (deps) {
    for (const dep of deps) {
      destroyContextAndItsChildren(dep);
    }
    executionContextDependencyStore.delete(id);
  }
}

let executionContextEnabled = false;

export const executionContext: {
  create(picker: ExecutionContextPicker): () => void;
  getModuleContext: ExecutionContextPicker['getModuleContext'];
  getApplicationContext: ExecutionContextPicker['getApplicationContext'];
} = {
  create(picker) {
    if (!executionContextEnabled) {
      return function destroyContextNoop() {
        // noop
      };
    }

    const id = executionAsyncId();
    executionContextStore.set(id, picker);
    return function destroyContext() {
      destroyContextAndItsChildren(id);
    };
  },
  getModuleContext(moduleId) {
    assertExecutionContext();

    const picker = executionContextStore.get(executionAsyncId())!;
    return picker.getModuleContext(moduleId);
  },
  getApplicationContext() {
    assertExecutionContext();

    const picker = executionContextStore.get(executionAsyncId())!;
    return picker.getApplicationContext();
  },
};

export function enableExecutionContext(config: ExecutionContextConfig) {
  if (!executionContextEnabled) {
    executionContextHook = config.createHook({
      init(asyncId, _, triggerAsyncId) {
        // Store same context data for child async resources
        const ctx = executionContextStore.get(triggerAsyncId);
        if (ctx) {
          const dependencies =
            executionContextDependencyStore.get(triggerAsyncId) ??
            executionContextDependencyStore
              .set(triggerAsyncId, new Set())
              .get(triggerAsyncId)!;
          dependencies.add(asyncId);
          executionContextStore.set(asyncId, ctx);
        }
      },
      destroy(asyncId) {
        if (executionContextStore.has(asyncId)) {
          executionContextStore.delete(asyncId);
        }
      },
    });
    executionAsyncId = config.executionAsyncId;
    executionContextEnabled = true;
  }
}

export function assertExecutionContext(): void | never {
  if (!executionContextEnabled) {
    throw new Error(
      'Execution Context is not enabled. Please set `executionContext` option in `createApplication`'
    );
  }
}

export function getExecutionContextStore() {
  return executionContextStore;
}

export function getExecutionContextDependencyStore() {
  return executionContextDependencyStore;
}
