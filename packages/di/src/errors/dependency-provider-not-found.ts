import { ServiceIdentifier } from '../types';
import { getServiceIdentifierName } from '../utils';

export class DependencyProviderNotFoundError<Dependency, Dependent> extends Error {
  constructor(private _dependency: ServiceIdentifier<Dependency>, private _dependent: ServiceIdentifier<Dependent>, private _moduleName: string) {
    super(`
      GraphQL-Modules Error: Dependency Provider Not Found!
      - Provider #${getServiceIdentifierName(_dependency)} couldn't be injected into Provider #${getServiceIdentifierName(_dependent)}
      -- Provider #${getServiceIdentifierName(_dependency)} is not provided in #Module ${_moduleName} scope!

      Possible solutions:
      - Make sure you have imported the module of Provider #${getServiceIdentifierName(_dependency)} in the module of Provider #${getServiceIdentifierName(_dependent)}
  `);
    Object.setPrototypeOf(this, DependencyProviderNotFoundError.prototype);
    Error.captureStackTrace(this, DependencyProviderNotFoundError);
  }

  get dependency(): ServiceIdentifier<Dependency> {
    return this._dependency;
  }

  get dependent(): ServiceIdentifier<Dependent> {
    return this._dependent;
  }

  get moduleName(): string {
    return this._moduleName;
  }
}
