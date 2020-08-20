import { Users } from '../providers/users';

export default {
  Query: {
    users: (_root: any, _args: {}, { injector }: GraphQLModules.Context) =>
      injector.get(Users).allUsers(),
    user: (_root: any, { id }: any, { injector }: GraphQLModules.Context) =>
      injector.get(Users).getUser(id),
  },
};
