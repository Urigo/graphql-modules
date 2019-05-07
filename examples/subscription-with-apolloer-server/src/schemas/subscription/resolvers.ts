import { ModuleContext } from '@graphql-modules/core'
import { PubSub } from 'apollo-server-express'

const indicators = [
  {
    host: 't1',
    risk: false
  },
  {
    host: 't2',
    risk: true
  }
]

export default {
  Query: {
    indicators() {
      return indicators
    }
  },
  Mutation: {
    updateIndicators(_, { psm, payload }, { injector }: ModuleContext) {
      const pubsub = injector.get(PubSub)
      console.log('update:', psm, payload)
      pubsub.publish('indicatorUpdated', {
        indicatorUpdated: payload,
        psm
      })
      return payload
    }
  },

  Subscription: {
    indicatorUpdated: {
      resolve(payload) {
        console.log('subscription transformation:', payload)

        // the reture type MUST be in correspondence with the definition in the schema.
        return [
          {
            host: '改了',
            risk: false
          }
        ]
      },
      subscribe: (_, __, { injector }: ModuleContext) => injector.get(PubSub).asyncIterator(['indicatorUpdated'])
    }
  }
}