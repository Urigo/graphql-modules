import {createGraphQLModule, GraphQLModule, METADATA_KEY} from '../src';

describe('@GraphQLModule', function () {
  const testModuleOptions = {name: 'my-module', types: 'type MyType { f1: String }' };

  it('should inject options correctly into the class prototype', function () {
    @GraphQLModule(testModuleOptions)
    class Test {

    }

    expect(Test.prototype[METADATA_KEY]).toBeDefined();
  });

  it('should create class correctly when using createGraphQLModule', function () {
    const Test = createGraphQLModule(testModuleOptions);

    expect(Test.prototype[METADATA_KEY]).toBeDefined();
  });

  it('should create class correctly when using createGraphQLModule and buildContext', function () {
    const Test = createGraphQLModule(testModuleOptions, () => null);

    expect(Test.prototype[METADATA_KEY]).toBeDefined();
    expect(Test.prototype.buildContext).toBeDefined();
  });
});
