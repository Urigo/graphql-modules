export class ModuleConfigRequiredError extends Error {
  constructor(private _moduleName: string) {
    super(`
      GraphQL-Modules Error: Module needs a configuration object!
      - #Module #${_moduleName} isn't imported by a configuration object.

      Possible solutions:
      - You should pass a valid configuration to import this module using forRoot.
      - If you already pass a configuration object with forRoot in somewhere in the application.
        You must import that module with forChild in other modules.
    `);
    Object.setPrototypeOf(this, ModuleConfigRequiredError.prototype);
    Error.captureStackTrace(this, ModuleConfigRequiredError);
  }
  get moduleName() {
    return this._moduleName;
  }
}
