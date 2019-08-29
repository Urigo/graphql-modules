import { ServiceIdentifier, getServiceIdentifierName } from '..';

export class ServiceIdentifierNotFoundError<T> extends Error {
  constructor(
    protected _serviceIdentifier: ServiceIdentifier<T>,
    private _dependent: string,
    private _dependencyIndex?: number
  ) {
    super(`
      GraphQL-Modules Error: Dependency Provider Not Found!
      - Provider #${getServiceIdentifierName(_serviceIdentifier)} not provided in #Module ${_dependent} scope!

      Possible solutions:
      - Check if you have this provider in your module.
      - Check if you have the module of this provider imported in your dependent modules.
    `);
    Object.setPrototypeOf(this, ServiceIdentifierNotFoundError.prototype);
    Error.captureStackTrace(this, ServiceIdentifierNotFoundError);
  }

  get dependent() {
    return this._dependent;
  }

  get serviceIdentifier(): ServiceIdentifier<T> {
    return this._serviceIdentifier;
  }

  get dependencyIndex(): number {
    return this._dependencyIndex;
  }
}
