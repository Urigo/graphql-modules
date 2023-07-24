import { AsyncLocalStorage } from 'async_hooks';

/*
  Use AsyncLocalStorage if available (available sync Node 14).
  Otherwise, fall back to using async_hooks.createHook
*/

import * as Hooks from './execution-context-hooks';
import * as Async from './execution-context-async-local-storage';

export type { ExecutionContextPicker } from './execution-context.interface';

export const executionContext = AsyncLocalStorage
  ? Async.executionContext
  : Hooks.executionContext;

export const enableExecutionContext = AsyncLocalStorage
  ? () => undefined
  : Hooks.enableExecutionContext;
