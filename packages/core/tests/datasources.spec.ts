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
  public initialize(initParams) {
    expect(initParams.context.myField).toBe('some-value');
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
      context: () => {
        return {
          myField: 'some-value',
        };
      },
      providers: [TestDataSourceAPI],
    });
    const app = new GraphQLModule({ imports: [moduleA] });
    await app.context({ req: {} });
  });
});
