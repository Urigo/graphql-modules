import path from 'path';
import { createModule } from 'graphql-modules';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';

import { Users } from './providers/users';
import resolvers from './resolvers';

export const UserModule = createModule({
  id: 'user',
  dirname: __dirname,
  providers: [Users],
  resolvers,
  typeDefs: mergeTypeDefs(
    loadFilesSync(path.join(__dirname, './typedefs/*.graphql'))
  ),
});
