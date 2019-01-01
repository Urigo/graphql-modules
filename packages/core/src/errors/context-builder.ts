export class ContextBuilderError extends Error {
  constructor(private _module: string, private _internalError: Error) {
    super(`
      GraphQL-Modules Error: Context couldn't be built!
      - Module #${_module} couldn't build the context due to the following internal error!
      -- ${_internalError.message}
      -- ${_internalError.stack}
  `);
    Object.setPrototypeOf(this, ContextBuilderError.prototype);
    Error.captureStackTrace(this, ContextBuilderError);
  }

  get module() {
    return this._module;
  }

  get internalError() {
    return this._internalError;
  }
}
