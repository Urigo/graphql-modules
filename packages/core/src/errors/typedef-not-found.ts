export class TypeDefNotFoundError extends Error {
  constructor(private _typeName: string, private _dependent: string) {
    super(`
      GraphQL-Modules Error: typeDef Not Found!
      - TypeDef '${_typeName}' not found in Module #${_dependent} scope!

      Possible solutions:
      - Check if you have this typeDef in that module's typeDefs.
      - Check if you have the module of this typeDef imported in your dependent modules.
    `);
    Object.setPrototypeOf(this, TypeDefNotFoundError.prototype);
    Error.captureStackTrace(this, TypeDefNotFoundError);
  }

  get typeName(): string {
    return this._typeName;
  }

  get dependent(): string {
    return this._dependent;
  }
}
