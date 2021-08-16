import {
  createModule,
  gql,
  InjectionToken,
  Scope,
  CONTEXT,
} from 'graphql-modules';

interface AuthenticatedUser {
  _id: number;
  username: string;
}
const AuthenticatedUser = new InjectionToken<AuthenticatedUser>(
  'authenticated-user'
);

export const AuthModule = createModule({
  id: 'auth',
  typeDefs: gql`
    type Query {
      me: User
    }
  `,
  resolvers: {
    Query: {
      me(_root: {}, _args: {}, context: GraphQLModules.Context) {
        return context.injector.get(AuthenticatedUser);
      },
    },
  },
  providers: [
    {
      provide: AuthenticatedUser,
      scope: Scope.Operation,
      deps: [CONTEXT],
      useFactory(ctx: GraphQLModules.GlobalContext) {
        const authHeader = ctx.request.headers.authorization;

        console.log({ authHeader });

        return {
          _id: 1,
          username: 'me',
        };
      },
    },
  ],
});
