import { ServiceIdentifier, getServiceIdentifierName } from '..';

export class ProviderNotValidError<T> extends Error {
  constructor(private _moduleName: string, private _serviceIdentifier: ServiceIdentifier<T>) {
    super(`
      GraphQL-Modules Error: Provider is not valid!
      - #Module #${_moduleName} provides an invalid #Provider #${getServiceIdentifierName(_serviceIdentifier)}!

      Possible solutions:
      - Provider must be a class itself,
        or provides a valid identifier with 'useValue', 'useFactory' or 'useClass'.
    `);
    Object.setPrototypeOf(this, ProviderNotValidError.prototype);
    Error.captureStackTrace(this, ProviderNotValidError);
  }
  get moduleName() {
    return this._moduleName;
  }

  get serviceIdentifier(): ServiceIdentifier<T> {
    return this._serviceIdentifier;
  }
}
