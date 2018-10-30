import 'reflect-metadata';
import { GraphQLModule } from '@graphql-modules/core';
import { UserModule } from '../index';

describe('Users Module', () => {
  let app: GraphQLModule<any, any, any>;

  beforeEach(() => {
    app = new GraphQLModule({
      name: 'app',
      imports: [
        UserModule,
      ],
    });
  });

  it('boop', () => {
  });
});
