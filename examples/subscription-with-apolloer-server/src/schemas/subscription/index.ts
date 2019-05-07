import 'graphql-import-node'
import { GraphQLModule } from '@graphql-modules/core'
import { PubSub } from 'apollo-server-express'

import * as typeDefs from './schema.graphql'
import resolvers from './resolvers'

export default new GraphQLModule({
  typeDefs,
  resolvers,
  providers: [PubSub]
})