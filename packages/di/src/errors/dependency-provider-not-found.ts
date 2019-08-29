import { ServiceIdentifier, getServiceIdentifierName } from '..';

const getErrorMsg = <Dependency, Dependent>(
  _dependency: ServiceIdentifier<Dependency>,
  _dependent: ServiceIdentifier<Dependent>,
  _moduleName: string,
  _dependencyIndex: number
) => {
  const dependencyName = getServiceIdentifierName(_dependency);
  const dependentName = getServiceIdentifierName(_dependent);
  return dependencyName === 'Object'
    ? `
  GraphQL-Modules Error: Dependency Provider Not Valid!
  - Provider in index: #${_dependencyIndex} couldn't be injected into Provider #${dependentName}

  Possible solutions:
  - There might be a circular import issue in Provider #${dependentName}. So make sure imports are valid.
  - Try using Inject decorator!
  `
    : `
    GraphQL-Modules Error: Dependency Provider Not Found!
    - Provider #${dependencyName} at the index #${_dependencyIndex} couldn't be injected into Provider #${getServiceIdentifierName(
        _dependent
      )}
    -- Provider #${dependencyName} is not provided in #Module ${_moduleName} scope!

    Possible solutions:
    - Make sure you have imported the module of Provider #${getServiceIdentifierName(
      _dependency
    )} in the module of Provider #${getServiceIdentifierName(_dependent)}
    - Check the dependency of the provider at the index #${_dependencyIndex}
    `;
};

export class DependencyProviderNotFoundError<Dependency, Dependent> extends Error {
  constructor(
    private _dependency: ServiceIdentifier<Dependency>,
    private _dependent: ServiceIdentifier<Dependent>,
    private _moduleName: string,
    private _dependencyIndex: number
  ) {
    super(getErrorMsg(_dependency, _dependent, _moduleName, _dependencyIndex));
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

  get dependencyIndex(): number {
    return this._dependencyIndex;
  }
}
