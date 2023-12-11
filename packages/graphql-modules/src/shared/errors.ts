import { ID } from './types.js';

export class ModuleNonUniqueIdError extends ExtendableBuiltin(Error) {
  constructor(message: string, ...rest: string[]) {
    super(composeMessage(message, ...rest));
    this.name = this.constructor.name;
    this.message = composeMessage(message, ...rest);
  }
}

export class ModuleDuplicatedError extends ExtendableBuiltin(Error) {
  constructor(message: string, ...rest: string[]) {
    super(composeMessage(message, ...rest));
    this.name = this.constructor.name;
    this.message = composeMessage(message, ...rest);
  }
}

export class ExtraResolverError extends ExtendableBuiltin(Error) {
  constructor(message: string, ...rest: string[]) {
    super(composeMessage(message, ...rest));
    this.name = this.constructor.name;
    this.message = composeMessage(message, ...rest);
  }
}

export class ExtraMiddlewareError extends ExtendableBuiltin(Error) {
  constructor(message: string, ...rest: string[]) {
    super(composeMessage(message, ...rest));
    this.name = this.constructor.name;
    this.message = composeMessage(message, ...rest);
  }
}

export class ResolverDuplicatedError extends ExtendableBuiltin(Error) {
  constructor(message: string, ...rest: string[]) {
    super(composeMessage(message, ...rest));
    this.name = this.constructor.name;
    this.message = composeMessage(message, ...rest);
  }
}

export class ResolverInvalidError extends ExtendableBuiltin(Error) {
  constructor(message: string, ...rest: string[]) {
    super(composeMessage(message, ...rest));
    this.name = this.constructor.name;
    this.message = composeMessage(message, ...rest);
  }
}

export class NonDocumentNodeError extends ExtendableBuiltin(Error) {
  constructor(message: string, ...rest: string[]) {
    super(composeMessage(message, ...rest));
    this.name = this.constructor.name;
    this.message = composeMessage(message, ...rest);
  }
}

// helpers

export function useLocation({ dirname, id }: { id: ID; dirname?: string }) {
  return dirname
    ? `Module "${id}" located at ${dirname}`
    : [
        `Module "${id}"`,
        `Hint: pass __dirname to "dirname" option of your modules to get more insightful errors`,
      ].join('\n');
}

export function ExtendableBuiltin<T extends Function>(cls: T): T {
  function ExtendableBuiltin(this: any) {
    cls.apply(this, arguments);
  }
  ExtendableBuiltin.prototype = Object.create(cls.prototype);
  Object.setPrototypeOf(ExtendableBuiltin, cls);

  return ExtendableBuiltin as any;
}

export function composeMessage(...lines: string[]): string {
  return lines.join('\n');
}
