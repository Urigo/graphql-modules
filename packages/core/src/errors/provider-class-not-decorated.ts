import { ServiceIdentifier } from '@graphql-modules/di';

export class ProviderClassNotDecoratedError<T> extends Error {
  constructor(
    private _moduleName: string,
    private _serviceIdentifier: ServiceIdentifier<T>,
    private _className: string
  ) {
    super(`
      GraphQL-Modules Error: Provider is not decorated!
      - Module #${_moduleName} provides a provider with a non-decorated ${_className}.

      Possible solutions:
      - Check if Class #${_className} decorated with @Injectable()
    `);
    Object.setPrototypeOf(this, ProviderClassNotDecoratedError.prototype);
    Error.captureStackTrace(this, ProviderClassNotDecoratedError);
  }
  get moduleName() {
    return this._moduleName;
  }

  get serviceIdentifier(): ServiceIdentifier<T> {
    return this._serviceIdentifier;
  }

  get className() {
    return this._className;
  }
}
