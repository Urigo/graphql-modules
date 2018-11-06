import { getServiceIdentifierName } from '../utils';
import { ServiceIdentifier } from '../di';

export class ServiceIdentifierNotFoundError<T> extends Error {
  constructor(protected _serviceIdentifier: ServiceIdentifier<T>) {
    super(`
      GraphQL-Modules Error: Dependency Provider Not Found!
      - Provider #${getServiceIdentifierName(_serviceIdentifier)} not provided in that scope!

      Possible solutions:
      - Check if you have this provider in your module.
      - Check if you have the module of this provider imported in your dependent modules.
    `);
    Object.setPrototypeOf(this, ServiceIdentifierNotFoundError.prototype);
    Error.captureStackTrace(this, ServiceIdentifierNotFoundError);
  }

  get serviceIdentifier(): ServiceIdentifier<T> {
    return this._serviceIdentifier;
  }
}
