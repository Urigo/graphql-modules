import { AsyncLocalStorage } from 'async_hooks';
import { type ExecutionContextPicker } from './execution-context.interface';

const executionContextStore = AsyncLocalStorage
  ? new AsyncLocalStorage<ExecutionContextPicker>()
  : undefined;

export const executionContext: {
  create(picker: ExecutionContextPicker): () => void;
  getModuleContext: ExecutionContextPicker['getModuleContext'];
  getApplicationContext: ExecutionContextPicker['getApplicationContext'];
} = {
  create(picker) {
    executionContextStore!.enterWith(picker);
    return function destroyContext() {};
  },
  getModuleContext(moduleId) {
    return executionContextStore!.getStore()!.getModuleContext(moduleId);
  },
  getApplicationContext() {
    return executionContextStore!.getStore()!.getApplicationContext();
  },
};

export function enableExecutionContext() {}

export function getExecutionContextStore() {
  return executionContextStore;
}
