import common from './typeDefs/common.graphql.js';
import { createModule } from 'graphql-modules';

const __dirname = new URL('.', import.meta.url).pathname;

export const commonModule = createModule({
  id: 'common',
  dirname: __dirname,
  typeDefs: [common],
});
