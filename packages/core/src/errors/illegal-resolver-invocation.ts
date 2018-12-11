export class IllegalResolverInvocationError extends Error {
  constructor(private _resolverPath: string, private _moduleName: string, private _detail: string) {
    super(`
      GraphQL-Modules Error: Illegal Resolver Invocation!
        - Resolver #${_resolverPath} is invoked unsafely outside of GraphQL-Modules.
        -- Detail: ${_detail}

      Possible solutions:
      - You may forget to pass context of the module to your GraphQL Server.
      -- Check if it is passed like below;
      ---  const { schema, context } = YourModule;
      ---  new ApolloServer({ schema, context });'
  `);
    Object.setPrototypeOf(this, IllegalResolverInvocationError.prototype);
    Error.captureStackTrace(this, IllegalResolverInvocationError);
  }
  get resolverPath() {
    return this._resolverPath;
  }
  get moduleName() {
    return this._moduleName;
  }
  get detail() {
    return this._detail;
  }
}
