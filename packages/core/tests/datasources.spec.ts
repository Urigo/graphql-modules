import 'reflect-metadata';
import { GraphQLModule } from '../src';
import { execute } from 'graphql';
import gql from 'graphql-tag';
import { Injectable } from '../../di/src/injectable';
import { ProviderScope } from '../../di/src/types';

@Injectable({
  scope: ProviderScope.Session,
})
export class TestDataSourceAPI {
  _initParams: any;

  public initialize(initParams) {
    console.log(initParams);
    this._initParams = initParams;
  }

  public getInitParams() {
    return this._initParams;
  }
}

describe('Apollo DataSources Intergration', () => {
  it('Should pass props correctly to initialize method', async () => {
    const testQuery = gql`
      query {
        a {
          f
        }
      }
    `;
    const typesA = [`type A { f: String}`, `type Query { a: A }`];
    const moduleA = new GraphQLModule({
      name: 'A',
      typeDefs: typesA,
      resolvers: {
        Query: { a: () => ({ f: 's' }) },
      },
      context: (networkRequest, currentContext, moduleSessionInfo) => {
        return {
          myField: 'some-value',
        };
      },
      providers: [TestDataSourceAPI],
    });
    const app = new GraphQLModule({ imports: [moduleA] });
    const schema = app.schema;
    const context = await app.context({ req: {} });
    console.log('context', context);

    await execute({
      schema,
      document: testQuery,
      contextValue: context,
    });

    const datasourceInitParams = app.injector.get(TestDataSourceAPI).getInitParams();
    console.log(datasourceInitParams);
  });
});
