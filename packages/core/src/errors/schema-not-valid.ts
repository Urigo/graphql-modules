export class SchemaNotValidError extends Error {
  constructor(moduleName: string, error: string) {
    super(`
      GraphQL-Modules Error: Schema is not valid!
      - #Module #${moduleName} doesn't have a valid schema!
      -- ${error}

      Possible solutions:
      - Check syntax errors in typeDefs
      - Make sure you import correct dependencies
    `);
    Object.setPrototypeOf(this, SchemaNotValidError.prototype);
    Error.captureStackTrace(this, SchemaNotValidError);
  }
}
