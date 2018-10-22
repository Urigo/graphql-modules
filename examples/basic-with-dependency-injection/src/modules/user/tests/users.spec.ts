import 'reflect-metadata';
import { GraphQLModule } from '@graphql-modules/core';
import { userModule } from '../index';

describe('Users Module', () => {
  let app: GraphQLModule;

  beforeEach(() => {
    app = new GraphQLModule({
      modules: [
        userModule,
      ],
    });
  });

  it('boop', () => {
  });
});
