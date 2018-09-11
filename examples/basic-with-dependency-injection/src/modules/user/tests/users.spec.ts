import 'reflect-metadata';
import { GraphQLApp } from '@graphql-modules/core';
import { userModule } from '../index';

describe('Users Module', () => {
  let app: GraphQLApp;

  beforeEach(() => {
    app = new GraphQLApp({
      modules: [
        userModule,
      ],
    });
  });

  it('boop', () => {
  });
});
