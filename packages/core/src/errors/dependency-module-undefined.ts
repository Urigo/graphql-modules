export class DependencyModuleUndefinedError extends Error {
  constructor(private _dependency: string) {
    super(`
      GraphQL-Modules Error: Dependency Module Undefined!
      - Module #${_dependency} is trying to import an undefined module declaration

      Possible solutions:
      - Circular imports may be used; so try to import modules like below;
        imports: () => [
          FooModule,
          BarModule
        ]
  `);
    Object.setPrototypeOf(this, DependencyModuleUndefinedError.prototype);
    Error.captureStackTrace(this, DependencyModuleUndefinedError);
  }

  get dependency(): string {
    return this._dependency;
  }
}
