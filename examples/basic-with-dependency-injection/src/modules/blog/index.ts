import path from 'path';
import { createModule } from 'graphql-modules';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';

import { Blog } from './providers/blog';
import resolvers from './resolvers';
import { Users } from '../user/providers/users';

export const BlogModule = createModule({
  id: 'blog',
  dirname: __dirname,
  providers: [Blog, Users],
  resolvers,
  typeDefs: mergeTypeDefs(
    loadFilesSync(path.join(__dirname, './typedefs/*.graphql'))
  ),
});
