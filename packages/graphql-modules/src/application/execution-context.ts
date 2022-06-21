import { createHook, executionAsyncId } from 'async_hooks';

export interface ExecutionContextPicker {
  getModuleContext(moduleId: string): GraphQLModules.ModuleContext;
  getApplicationContext(): GraphQLModules.AppContext;
}

const executionContextStore = new Map<number, ExecutionContextPicker>();
const executionContextDependencyStore = new Map<number, Set<number>>();

const executionContextHook = createHook({
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

export const executionContext: {
  create(picker: ExecutionContextPicker): () => void;
  getModuleContext: ExecutionContextPicker['getModuleContext'];
  getApplicationContext: ExecutionContextPicker['getApplicationContext'];
} = {
  create(picker) {
    const id = executionAsyncId();
    executionContextStore.set(id, picker);
    return function destroyContext() {
      destroyContextAndItsChildren(id);
    };
  },
  getModuleContext(moduleId) {
    const picker = executionContextStore.get(executionAsyncId())!;
    return picker.getModuleContext(moduleId);
  },
  getApplicationContext() {
    const picker = executionContextStore.get(executionAsyncId())!;
    return picker.getApplicationContext();
  },
};

let executionContextEnabled = false;

export function enableExecutionContext() {
  if (!executionContextEnabled) {
    executionContextHook.enable();
  }
}
