import {makeExecutableSchema} from 'graphql-tools';
import {createGraphQLModule, GraphQLModule, METADATA_KEY} from '../src/graphql-module-decorator';

describe('@GraphQLModule', function () {
  const schema = makeExecutableSchema({
    typeDefs: [
      'type MyType { f1: String }',
    ],
    allowUndefinedInResolve: true,
  });

  it('should inject options correctly into the class prototype', function () {
    @GraphQLModule({name: 'my-module', schema})
    class Test {

    }

    expect(Test.prototype[METADATA_KEY]).toBeDefined();
  });

  it('should create class correctly when using createGraphQLModule', function () {
    const Test = createGraphQLModule({name: 'my-module', schema});

    expect(Test.prototype[METADATA_KEY]).toBeDefined();
  });

  it('should create class correctly when using createGraphQLModule and buildContext', function () {
    const Test = createGraphQLModule({name: 'my-module', schema}, () => null);

    expect(Test.prototype[METADATA_KEY]).toBeDefined();
    expect(Test.prototype.buildContext).toBeDefined();
  });
});
