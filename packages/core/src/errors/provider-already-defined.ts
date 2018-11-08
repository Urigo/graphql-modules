import { ServiceIdentifier } from '../di/types';
import { getServiceIdentifierName } from '../utils';

export class ProviderAlreadyDefinedError<T> extends Error {
  constructor(private _moduleName: string, private _serviceIdentifier: ServiceIdentifier<T>) {
    super(`
      GraphQL-Modules Error: Provider has been already defined!
      - #Module #${_moduleName} already has a #Provider #${getServiceIdentifierName(_serviceIdentifier)}.

      Possible solutions:
      - Provider must have 'override: true' field.
    `);
    Object.setPrototypeOf(this, ProviderAlreadyDefinedError.prototype);
    Error.captureStackTrace(this, ProviderAlreadyDefinedError);
  }
  get moduleName() {
    return this._moduleName;
  }

  get serviceIdentifier(): ServiceIdentifier<T> {
    return this._serviceIdentifier;
  }
}
