export class DependencyModuleNotFoundError extends Error {
  constructor(private _dependency: string, private _dependent: string) {
    super(`
      GraphQL-Modules Error: Dependency Module Not Found!
      - Module #${_dependency} couldn't be imported into #${_dependent}
      -- Module #${_dependency} is not defined in that scope!

      Possible solutions:
      - If you're using 'forRoot' on the upper import, use 'forChild' on the children imports.
      - If you're using 'forChild' on the parent imports, use 'forRoot' on the upper import.
  `);
    Object.setPrototypeOf(this, DependencyModuleNotFoundError.prototype);
    Error.captureStackTrace(this, DependencyModuleNotFoundError);
  }

  get dependency(): string {
    return this._dependency;
  }

  get dependent(): string {
    return this._dependent;
  }
}
